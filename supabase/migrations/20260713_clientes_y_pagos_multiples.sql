-- ============================================================
-- Migración: base de datos de clientes + pagos con varios medios
-- Ejecutar en: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Tabla de clientes (se llena automáticamente desde reservas y
-- servicios registrados por los barberos; visible solo para el admin)
create table if not exists clientes (
  id uuid default gen_random_uuid() primary key,
  nombres text not null,
  apellidos text default '',
  dni text default '',
  fecha_nacimiento date,
  telefono text default '',
  fecha_creacion timestamptz default now()
);

alter table clientes disable row level security;

-- Detalle de pagos por servicio realizado.
-- Permite combinar medios, ej: [{"medio":"YAPE","monto":20},{"medio":"EFECTIVO","monto":10}]
alter table servicios_realizados
  add column if not exists pagos jsonb default '[]';
