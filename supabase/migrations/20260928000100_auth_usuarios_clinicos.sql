-- Migración: autenticación real con Supabase Auth para usuarios_clinicos
--
-- Contexto: el login estaba hardcodeado en el front (lib/auth/mock-users.ts) y la
-- tabla usuarios_clinicos guardaba un password_hash que nadie leía, pero que era
-- legible por cualquier cliente anónimo. Este script:
--   1. Vincula cada profesional con su cuenta de auth.users.
--   2. Elimina la columna de credenciales obsoleta.
--   3. Normaliza y restringe los valores de rol.
--   4. Cierra la tabla con RLS: solo los ADMIN escriben, todos los autenticados leen.

-- 1. Vínculo con auth.users -------------------------------------------------
ALTER TABLE public.usuarios_clinicos
  ADD COLUMN IF NOT EXISTS auth_id uuid REFERENCES auth.users (id) ON DELETE CASCADE;

UPDATE public.usuarios_clinicos AS uc
SET auth_id = au.id
FROM auth.users AS au
WHERE lower(btrim(uc.email)) = lower(btrim(au.email))
  AND uc.auth_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS usuarios_clinicos_auth_id_uniq
  ON public.usuarios_clinicos (auth_id);

-- 2. Las credenciales viven en Supabase Auth -------------------------------
ALTER TABLE public.usuarios_clinicos
  DROP COLUMN IF EXISTS password_hash;

-- 3. Rol normalizado y validado --------------------------------------------
UPDATE public.usuarios_clinicos
SET rol = upper(btrim(rol))
WHERE rol <> upper(btrim(rol));

ALTER TABLE public.usuarios_clinicos
  DROP CONSTRAINT IF EXISTS usuarios_clinicos_rol_check;

ALTER TABLE public.usuarios_clinicos
  ADD CONSTRAINT usuarios_clinicos_rol_check CHECK (rol IN ('ADMIN', 'PROFESIONAL'));

-- 4. Helper de autorización (SECURITY DEFINER evita recursión de políticas) --
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.usuarios_clinicos
    WHERE auth_id = uid
      AND rol = 'ADMIN'
      AND activo
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- 5. Row Level Security -----------------------------------------------------
DROP POLICY IF EXISTS "Permitir insercion/actualizacion usuarios_clinicos" ON public.usuarios_clinicos;
DROP POLICY IF EXISTS "Permitir lectura publica usuarios_clinicos" ON public.usuarios_clinicos;

-- El directorio de profesionales sigue siendo legible por cualquier usuario
-- autenticado: lo necesita la asignación de duplas en el dashboard.
CREATE POLICY "Directorio usuarios clinicos legible por autenticados"
  ON public.usuarios_clinicos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Administradores gestionan usuarios clinicos"
  ON public.usuarios_clinicos
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
