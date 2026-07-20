-- ============================================================
-- Migración: propina en servicios realizados
-- Ejecutar en: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Propina que el cliente deja al barbero; se cobra junto con el
-- servicio y aparece en el recibo, pero no forma parte del total
-- del servicio (ingreso de la barbería).
alter table servicios_realizados
  add column if not exists propina numeric default 0;
