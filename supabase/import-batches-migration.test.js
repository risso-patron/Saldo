import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const migrationPath = join(process.cwd(), 'supabase', 'migrations', '20260823_imp_002a_import_batches.sql');
const sql = () => readFileSync(migrationPath, 'utf8');

describe('IMP-002A.1 import batch database foundation migration', () => {
  it('defines import_batches with adjusted source values and lifecycle statuses', () => {
    const migration = sql();

    expect(migration).toContain('CREATE TABLE IF NOT EXISTS public.import_batches');
    expect(migration).toContain("source IN ('csv_import', 'txt_import')");
    expect(migration).toContain("status IN ('pending', 'completed', 'failed', 'reverted')");
  });

  it('adds nullable transaction metadata and an ownership guard', () => {
    const migration = sql();

    expect(migration).toContain('ADD COLUMN IF NOT EXISTS import_batch_id UUID NULL');
    expect(migration).toContain('ADD COLUMN IF NOT EXISTS source TEXT NULL');
    expect(migration).toContain('ADD COLUMN IF NOT EXISTS imported_at TIMESTAMPTZ NULL');
    expect(migration).toContain('ensure_transaction_import_batch_owner');
    expect(migration).toContain('ON DELETE SET NULL');
  });

  it('creates an atomic RPC contract that returns completedAt and documents Supabase-first imports', () => {
    const migration = sql();

    expect(migration).toContain('CREATE OR REPLACE FUNCTION public.create_import_batch_with_transactions');
    expect(migration).toContain('Cannot create import batch without movements');
    expect(migration).toContain("'completedAt'");
    expect(migration).toContain('Supabase-first');
    expect(migration).toContain('pendingOperation is not a queue');
  });
});
