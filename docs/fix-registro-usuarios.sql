-- =====================================================
-- FIX v2: Error "Database error saving new user"
-- Causa raíz: "Function Search Path Mutable" bloquea
-- funciones SECURITY DEFINER sin search_path fijo.
-- Ejecutar en Supabase → SQL Editor
-- =====================================================

-- PASO 1: Reemplazar función del trigger con versión segura
-- CRÍTICO: SET search_path = '' resuelve "Function Search Path Mutable"
-- Sin search_path fijo, Supabase bloquea funciones SECURITY DEFINER → error 500
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user error for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- PASO 2: Asegurar que el trigger existe (re-crear si es necesario)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- PASO 3: Corregir las otras funciones con el mismo warning
-- "Function Search Path Mutable" en update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- PASO 4: Verificación — muestra los 3 triggers activos
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name IN ('on_auth_user_created', 'update_user_profiles_updated_at', 'update_transactions_updated_at')
ORDER BY trigger_name;

-- =====================================================
-- FIN DEL FIX
-- =====================================================
