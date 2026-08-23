-- =====================================================
-- IMP-002A.1 - Import Batch Metadata Foundation
-- =====================================================
-- Scope:
-- - Database foundation only: import_batches, transaction metadata columns,
--   indexes, RLS, ownership guard, and atomic RPC.
-- - No frontend changes, no rollback feature, no duplicate detection,
--   no import history UI, no backfill, no mutation of existing rows.
--
-- Operational contract for future frontend implementation:
-- - Imports with metadata must be Supabase-first.
-- - If the user is offline or Supabase is unavailable, block the import.
-- - pendingOperation is not a queue and must not be used as durable sync state.
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: import_batches
-- =====================================================

CREATE TABLE IF NOT EXISTS public.import_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    source TEXT NOT NULL CHECK (source IN ('csv_import', 'txt_import')),
    original_filename TEXT,
    file_size_bytes INTEGER CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0),
    file_sha256 TEXT CHECK (file_sha256 IS NULL OR length(file_sha256) = 64),

    movement_count INTEGER NOT NULL CHECK (movement_count >= 0),
    income_count INTEGER NOT NULL DEFAULT 0 CHECK (income_count >= 0),
    expense_count INTEGER NOT NULL DEFAULT 0 CHECK (expense_count >= 0),

    income_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
    expense_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
    net_total DECIMAL(12, 2) NOT NULL DEFAULT 0,

    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'completed', 'failed', 'reverted')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_import_batches_user_id
ON public.import_batches(user_id);

CREATE INDEX IF NOT EXISTS idx_import_batches_user_created_at
ON public.import_batches(user_id, created_at DESC);

-- =====================================================
-- ALTER transactions - additive and nullable for compatibility
-- =====================================================

ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS import_batch_id UUID NULL;

ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS source TEXT NULL;

ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS imported_at TIMESTAMPTZ NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'transactions_source_check'
          AND conrelid = 'public.transactions'::regclass
    ) THEN
        ALTER TABLE public.transactions
        ADD CONSTRAINT transactions_source_check
        CHECK (source IS NULL OR source IN ('manual', 'csv_import', 'txt_import'));
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'transactions_import_batch_id_fkey'
          AND conrelid = 'public.transactions'::regclass
    ) THEN
        ALTER TABLE public.transactions
        ADD CONSTRAINT transactions_import_batch_id_fkey
        FOREIGN KEY (import_batch_id)
        REFERENCES public.import_batches(id)
        ON DELETE SET NULL;
    END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_transactions_import_batch_id
ON public.transactions(import_batch_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_import_batch
ON public.transactions(user_id, import_batch_id);

-- =====================================================
-- Ownership guard
-- Ensures a transaction cannot point to another user's import batch.
-- =====================================================

CREATE OR REPLACE FUNCTION public.ensure_transaction_import_batch_owner()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.import_batch_id IS NULL THEN
        RETURN NEW;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.import_batches ib
        WHERE ib.id = NEW.import_batch_id
          AND ib.user_id = NEW.user_id
    ) THEN
        RAISE EXCEPTION 'import_batch_id does not belong to transaction user_id'
        USING ERRCODE = '23503';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

DROP TRIGGER IF EXISTS ensure_transaction_import_batch_owner_trigger
ON public.transactions;

CREATE TRIGGER ensure_transaction_import_batch_owner_trigger
BEFORE INSERT OR UPDATE OF import_batch_id, user_id
ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.ensure_transaction_import_batch_owner();

-- =====================================================
-- RLS: import_batches
-- =====================================================

ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own import batches"
ON public.import_batches;

CREATE POLICY "Users can view own import batches"
ON public.import_batches
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own import batches"
ON public.import_batches;

CREATE POLICY "Users can insert own import batches"
ON public.import_batches
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own import batches"
ON public.import_batches;

CREATE POLICY "Users can update own import batches"
ON public.import_batches
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- No DELETE policy in IMP-002A. Rollback/revert flows are out of scope.

-- =====================================================
-- RPC: create_import_batch_with_transactions
-- Creates import batch metadata and transaction rows atomically.
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_import_batch_with_transactions(
    p_source TEXT,
    p_original_filename TEXT DEFAULT NULL,
    p_file_size_bytes INTEGER DEFAULT NULL,
    p_file_sha256 TEXT DEFAULT NULL,
    p_transactions JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_batch_id UUID;
    v_imported_at TIMESTAMPTZ := NOW();
    v_completed_at TIMESTAMPTZ;

    v_expected_count INTEGER;
    v_inserted_count INTEGER;
    v_invalid_count INTEGER;

    v_income_count INTEGER;
    v_expense_count INTEGER;
    v_income_total NUMERIC(12, 2);
    v_expense_total NUMERIC(12, 2);
    v_net_total NUMERIC(12, 2);
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authenticated user required'
        USING ERRCODE = '42501';
    END IF;

    IF p_source NOT IN ('csv_import', 'txt_import') THEN
        RAISE EXCEPTION 'Invalid import source: %', p_source
        USING ERRCODE = '22023';
    END IF;

    IF p_file_size_bytes IS NOT NULL AND p_file_size_bytes < 0 THEN
        RAISE EXCEPTION 'file_size_bytes must be non-negative'
        USING ERRCODE = '22023';
    END IF;

    IF p_file_sha256 IS NOT NULL AND length(p_file_sha256) <> 64 THEN
        RAISE EXCEPTION 'file_sha256 must be 64 characters'
        USING ERRCODE = '22023';
    END IF;

    IF p_transactions IS NULL OR jsonb_typeof(p_transactions) <> 'array' THEN
        RAISE EXCEPTION 'p_transactions must be a JSON array'
        USING ERRCODE = '22023';
    END IF;

    v_expected_count := jsonb_array_length(p_transactions);

    IF v_expected_count = 0 THEN
        RAISE EXCEPTION 'Cannot create import batch without movements'
        USING ERRCODE = '22023';
    END IF;

    WITH parsed AS (
        SELECT *
        FROM jsonb_to_recordset(p_transactions) AS t(
            id UUID,
            description TEXT,
            amount NUMERIC,
            currency TEXT,
            type TEXT,
            category TEXT,
            date DATE
        )
    )
    SELECT COUNT(*)
    INTO v_invalid_count
    FROM parsed
    WHERE id IS NULL
       OR NULLIF(BTRIM(description), '') IS NULL
       OR amount IS NULL
       OR amount <= 0
       OR type NOT IN ('income', 'expense')
       OR date IS NULL;

    IF v_invalid_count > 0 THEN
        RAISE EXCEPTION 'Invalid transactions in import payload: %', v_invalid_count
        USING ERRCODE = '22023';
    END IF;

    WITH parsed AS (
        SELECT *
        FROM jsonb_to_recordset(p_transactions) AS t(
            id UUID,
            description TEXT,
            amount NUMERIC,
            currency TEXT,
            type TEXT,
            category TEXT,
            date DATE
        )
    )
    SELECT
        COUNT(*) FILTER (WHERE type = 'income'),
        COUNT(*) FILTER (WHERE type = 'expense'),
        COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0),
        COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0)
    INTO
        v_income_count,
        v_expense_count,
        v_income_total,
        v_expense_total
    FROM parsed;

    v_net_total := v_income_total - v_expense_total;

    INSERT INTO public.import_batches (
        user_id,
        source,
        original_filename,
        file_size_bytes,
        file_sha256,
        movement_count,
        income_count,
        expense_count,
        income_total,
        expense_total,
        net_total,
        status
    )
    VALUES (
        v_user_id,
        p_source,
        p_original_filename,
        p_file_size_bytes,
        p_file_sha256,
        v_expected_count,
        v_income_count,
        v_expense_count,
        v_income_total,
        v_expense_total,
        v_net_total,
        'pending'
    )
    RETURNING id INTO v_batch_id;

    WITH parsed AS (
        SELECT *
        FROM jsonb_to_recordset(p_transactions) AS t(
            id UUID,
            description TEXT,
            amount NUMERIC,
            currency TEXT,
            type TEXT,
            category TEXT,
            date DATE
        )
    )
    INSERT INTO public.transactions (
        id,
        user_id,
        description,
        amount,
        currency,
        type,
        category,
        date,
        import_batch_id,
        source,
        imported_at
    )
    SELECT
        id,
        v_user_id,
        BTRIM(description),
        ROUND(amount, 2),
        COALESCE(NULLIF(currency, ''), 'USD'),
        type,
        COALESCE(
            NULLIF(category, ''),
            CASE WHEN type = 'income' THEN 'income' ELSE 'Otros' END
        ),
        date,
        v_batch_id,
        p_source,
        v_imported_at
    FROM parsed;

    GET DIAGNOSTICS v_inserted_count = ROW_COUNT;

    IF v_inserted_count <> v_expected_count THEN
        RAISE EXCEPTION 'Inserted count mismatch. Expected %, inserted %',
            v_expected_count,
            v_inserted_count
        USING ERRCODE = '40001';
    END IF;

    v_completed_at := NOW();

    UPDATE public.import_batches
    SET status = 'completed',
        completed_at = v_completed_at
    WHERE id = v_batch_id
      AND user_id = v_user_id;

    RETURN jsonb_build_object(
        'ok', true,
        'importBatchId', v_batch_id,
        'insertedCount', v_inserted_count,
        'movementCount', v_expected_count,
        'incomeCount', v_income_count,
        'expenseCount', v_expense_count,
        'incomeTotal', v_income_total,
        'expenseTotal', v_expense_total,
        'netTotal', v_net_total,
        'status', 'completed',
        'completedAt', v_completed_at
    );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, auth;

REVOKE ALL ON FUNCTION public.create_import_batch_with_transactions(
    TEXT,
    TEXT,
    INTEGER,
    TEXT,
    JSONB
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_import_batch_with_transactions(
    TEXT,
    TEXT,
    INTEGER,
    TEXT,
    JSONB
) TO authenticated;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE public.import_batches IS
'Persistent metadata for CSV/TXT imports. Does not store raw bank file contents.';

COMMENT ON COLUMN public.import_batches.source IS
'Import source: csv_import or txt_import.';

COMMENT ON COLUMN public.import_batches.status IS
'Import lifecycle status: pending, completed, failed, reverted. Revert implementation is out of scope for IMP-002A.';

COMMENT ON COLUMN public.transactions.import_batch_id IS
'Optional reference to the import batch that created this movement. NULL for manual or pre-existing movements.';

COMMENT ON COLUMN public.transactions.source IS
'Movement origin: manual, csv_import, or txt_import. Nullable for historical compatibility.';

COMMENT ON COLUMN public.transactions.imported_at IS
'Server timestamp for movements created through import metadata flow.';

COMMENT ON FUNCTION public.create_import_batch_with_transactions(TEXT, TEXT, INTEGER, TEXT, JSONB) IS
'Supabase-first import RPC. Blocks empty imports, atomically creates import_batches plus transactions, and returns completedAt. pendingOperation is not a queue.';
