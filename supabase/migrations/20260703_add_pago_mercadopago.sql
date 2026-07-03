-- Agrega columnas de pago (Mercado Pago) a la tabla de reservas.
-- Ejecutar en: Supabase Dashboard → SQL Editor → Run

alter table reservas
  add column if not exists pago_estado text default 'no_aplica',
  add column if not exists pago_monto numeric,
  add column if not exists mp_preference_id text,
  add column if not exists mp_payment_id text;
