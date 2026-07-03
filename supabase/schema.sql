-- ============================================================
-- Barbería ARIAS — Supabase Schema
-- Ejecutar completo en: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Tabla de perfiles (extiende auth.users de Supabase)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  nombre text not null,
  correo text,
  rol text not null check (rol in ('admin', 'barbero')),
  estado boolean default true,
  fecha_creacion timestamptz default now()
);

-- Sedes / locales
create table if not exists sedes (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  direccion text not null,
  estado boolean default true,
  foto text
);

-- Barberos
create table if not exists barberos (
  id uuid default gen_random_uuid() primary key,
  usuario_id uuid references profiles(id),
  nombre text not null,
  especialidad text,
  descripcion text,
  horario_inicio text default '09:00',
  horario_fin text default '18:00',
  estado boolean default true,
  foto text,
  foto_hover text,
  dias_laborales integer[] default '{1,2,3,4,5,6}',
  sede_id uuid references sedes(id),
  servicios_ids uuid[] default '{}'
);

-- Servicios del catálogo
create table if not exists servicios (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  descripcion text,
  duracion_minutos integer default 30,
  precio numeric default 0,
  estado boolean default true
);

-- Reservas de clientes
create table if not exists reservas (
  id uuid default gen_random_uuid() primary key,
  cliente_nombre text,
  cliente_telefono text,
  cliente_correo text,
  sede_id uuid references sedes(id),
  servicio_id uuid references servicios(id),
  barbero_id uuid references barberos(id),
  fecha date,
  hora_inicio text,
  hora_fin text,
  estado text default 'pendiente',
  fecha_creacion timestamptz default now(),
  notas text default '',
  -- Pago con Mercado Pago (opcional; 'no_aplica' si el cliente paga en el local)
  pago_estado text default 'no_aplica',
  pago_monto numeric,
  mp_preference_id text,
  mp_payment_id text
);

-- Servicios realizados (registro de atenciones)
create table if not exists servicios_realizados (
  id uuid default gen_random_uuid() primary key,
  numero_recibo text,
  barbero_id uuid references barberos(id),
  barbero_nombre text,
  sede_id uuid references sedes(id),
  sede_nombre text,
  sede_direccion text,
  cliente_nombre text,
  servicio_id uuid references servicios(id),
  servicio_nombre text,
  servicio_precio numeric,
  producto_vendido text,
  precio_producto numeric default 0,
  medio_pago text,
  total numeric,
  fecha date,
  hora text,
  fecha_creacion timestamptz default now()
);

-- ── Trigger: crear profile automáticamente al registrar usuario ──────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nombre, correo, rol, estado)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'rol', 'barbero'),
    true
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Deshabilitar RLS (habilitar con políticas antes de ir a producción) ──────
alter table profiles disable row level security;
alter table sedes disable row level security;
alter table barberos disable row level security;
alter table servicios disable row level security;
alter table reservas disable row level security;
alter table servicios_realizados disable row level security;

-- ── Datos iniciales ──────────────────────────────────────────────────────────
insert into sedes (nombre, direccion, estado, foto) values
  ('Carabayllo', 'Av. Mariano Condorcanqui Mz. R Lt. 27 Urb. Santo Domingo', true, null),
  ('Comas', 'Av. Retablo N° 105 Urb. Santa Luzmila', true, null),
  ('Los Olivos', 'Av. Universitaria 6138 Urb. Villa Sol', true, null);

insert into servicios (nombre, descripcion, duracion_minutos, precio, estado) values
  ('Corte Clásico', 'Corte tradicional con acabado perfecto. Incluye lavado, corte, secado y peinado final.', 30, 20, true),
  ('Corte + Barba', 'El combo completo: corte de cabello y arreglo completo de barba con navaja y toalla caliente.', 60, 35, true),
  ('Fade Degradado', 'Degradado de precisión skin fade, low fade o high fade. El acabado que marca la diferencia.', 45, 25, true),
  ('Arreglo de Barba', 'Modelado, perfilado y acabado de barba con productos premium. Toalla caliente incluida.', 30, 15, true),
  ('Afeitado Clásico', 'Afeitado con navaja recta, espuma premium, toallas calientes y mascarilla hidratante.', 45, 20, true),
  ('Tratamiento Capilar', 'Hidratación profunda, keratina o tratamiento anticaspa. Cabello restaurado desde la primera sesión.', 60, 40, true);
