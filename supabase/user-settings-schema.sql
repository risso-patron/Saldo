-- Tabla de Preferencias del Usuario (user_settings)
-- Esquema clave-valor extensible: una fila por (user_id, setting_key).
-- Dominio distinto de `subscriptions` (plan/pago/Stripe): acá viven decisiones
-- de la PERSONA (ej. consentimiento de IA), no del plan que paga.
-- Convención seguida (igual que supabase/subscriptions-schema.sql):
-- gen_random_uuid(), FK a auth.users(id) ON DELETE CASCADE, RLS habilitada,
-- índice por user_id, trigger update_updated_at_column() reutilizado (no redefinido).

CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- ej. 'ai_consent' (futuras preferencias: sin columna nueva)
  setting_key TEXT NOT NULL,
  -- JSONB: absorbe boolean/string/objeto sin cambiar el esquema
  setting_value JSONB NOT NULL,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 1 valor por preferencia por usuario → UPSERT idempotente
  UNIQUE (user_id, setting_key)
);

-- Índice para mejorar performance de lookups por usuario
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- Row Level Security (RLS)
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- A diferencia de `subscriptions` (UPDATE bloqueado, cambia solo vía webhook),
-- `user_settings` ES dato propio del usuario: se permite SELECT/INSERT/UPDATE
-- por dueño (patrón de public.transactions), auth.uid() = user_id.
CREATE POLICY "own_settings_select" ON public.user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "own_settings_insert" ON public.user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own_settings_update" ON public.user_settings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Nota: sin policy DELETE — igual que subscriptions, si se necesita eliminar,
-- hacerlo desde backend seguro o dashboard de Supabase.

-- Reutiliza la función update_updated_at_column() ya definida en
-- subscriptions-schema.sql — NO se redefine acá para evitar duplicidad.
CREATE TRIGGER set_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE public.user_settings IS 'Preferencias del usuario, clave-valor extensible (ej. ai_consent). Dominio distinto de subscriptions.';
COMMENT ON COLUMN public.user_settings.setting_key IS 'Clave de la preferencia, ej. ai_consent. Futuras preferencias reutilizan esta tabla sin DDL nuevo.';
COMMENT ON COLUMN public.user_settings.setting_value IS 'Valor JSONB de la preferencia — boolean, string u objeto según la clave.';
