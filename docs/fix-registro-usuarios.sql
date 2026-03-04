-- =====================================================
-- FIX: Error "Database error saving new user"
-- Ejecutar en Supabase → SQL Editor
-- =====================================================
-- El problema: el trigger handle_new_user() falla si ya existe
-- un perfil con ese email, o si hay algún error de permisos,
-- y Supabase bloquea todo el registro.
-- La solución: trigger con ON CONFLICT DO NOTHING + EXCEPTION HANDLER
-- =====================================================

-- PASO 1: Reemplazar función del trigger con versión segura
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;  -- No falla si el perfil ya existe

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Si algo falla, loggearlo pero NO bloquear el registro
    RAISE WARNING 'handle_new_user error for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 2: Asegurar que el trigger existe (re-crear si es necesario)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- PASO 3: Verificación — debería mostrar el trigger
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- =====================================================
-- FIN DEL FIX
-- =====================================================
