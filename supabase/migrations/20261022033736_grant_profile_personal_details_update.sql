-- Completa los permisos de los datos personales añadidos al perfil.
-- Las políticas profiles_self_select y profiles_self_update conservan el acceso
-- limitado al propietario de la fila. No se conceden permisos a anon.
grant update (dni, birth_date, gender) on table public.profiles to authenticated;
