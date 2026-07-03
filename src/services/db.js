import { supabase } from '../lib/supabase';

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function login(correo, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: correo, password });
  if (error) {
    if (error.message === 'Invalid login credentials') {
      throw new Error('Correo o contraseña incorrectos.');
    }
    if (error.message === 'Email not confirmed') {
      throw new Error('Debes confirmar tu correo antes de iniciar sesión.');
    }
    throw new Error(error.message);
  }
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
  if (!profile) throw new Error('Perfil no encontrado. Contacta al administrador.');
  if (!profile.estado) throw new Error('Tu cuenta está inactiva.');
  return { id: data.user.id, correo: data.user.email, ...profile };
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
  if (!profile) return null;
  return { id: session.user.id, correo: session.user.email, ...profile };
}

// ── Users / Profiles ──────────────────────────────────────────────────────────
export async function getUsers() {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) throw error;
  return data || [];
}

export async function createUser({ nombre, correo, password, rol, estado }) {
  const { data: { session: prevSession } } = await supabase.auth.getSession();

  const { data, error } = await supabase.auth.signUp({
    email: correo,
    password,
    options: { data: { nombre, rol } },
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('No se pudo crear el usuario. Verifica que el correo no exista ya.');

  if (!estado) {
    await supabase.from('profiles').update({ estado: false }).eq('id', data.user.id);
  }

  if (prevSession) {
    await supabase.auth.setSession({
      access_token: prevSession.access_token,
      refresh_token: prevSession.refresh_token,
    });
  }

  return { id: data.user.id, nombre, correo, rol, estado: estado ?? true };
}

export async function deleteUser(id) {
  const { data, error } = await supabase.functions.invoke('delete-user', {
    body: { userId: id },
  });
  if (error) throw new Error('No se pudo contactar el servicio de eliminación.');
  if (!data?.success) throw new Error(data?.error || 'No se pudo eliminar la cuenta.');
  return true;
}

export async function updateUser(id, data) {
  const profileUpdates = {};
  if (data.nombre !== undefined) profileUpdates.nombre = data.nombre;
  if (data.rol !== undefined) profileUpdates.rol = data.rol;
  if (data.estado !== undefined) profileUpdates.estado = data.estado;
  if (Object.keys(profileUpdates).length > 0) {
    const { error } = await supabase.from('profiles').update(profileUpdates).eq('id', id);
    if (error) throw error;
  }
  return { id, ...data };
}

// ── Sedes ─────────────────────────────────────────────────────────────────────
export async function getSedes(soloActivas = false) {
  let q = supabase.from('sedes').select('*');
  if (soloActivas) q = q.eq('estado', true);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function createSede(data) {
  const { data: nueva, error } = await supabase.from('sedes').insert(data).select().single();
  if (error) throw error;
  return nueva;
}

export async function updateSede(id, data) {
  const { data: updated, error } = await supabase.from('sedes').update(data).eq('id', id).select().single();
  if (error) throw error;
  return updated;
}

// ── Barberos ──────────────────────────────────────────────────────────────────
export async function getBarberos(soloActivos = false) {
  let q = supabase.from('barberos').select('*');
  if (soloActivos) q = q.eq('estado', true);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function getBarberoByUserId(userId) {
  const { data } = await supabase.from('barberos').select('*').eq('usuario_id', userId).single();
  return data || null;
}

export async function getBarberosBySede(sedeId, soloActivos = false) {
  let q = supabase.from('barberos').select('*').eq('sede_id', sedeId);
  if (soloActivos) q = q.eq('estado', true);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function createBarbero(data) {
  const { data: nuevo, error } = await supabase.from('barberos').insert(data).select().single();
  if (error) throw error;
  return nuevo;
}

export async function updateBarbero(id, data) {
  const { data: updated, error } = await supabase.from('barberos').update(data).eq('id', id).select().single();
  if (error) throw error;
  return updated;
}

export async function getServiciosByBarbero(barberoId) {
  const { data: barbero } = await supabase.from('barberos').select('servicios_ids').eq('id', barberoId).single();
  let q = supabase.from('servicios').select('*').eq('estado', true);
  if (barbero?.servicios_ids?.length > 0) q = q.in('id', barbero.servicios_ids);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

// ── Servicios ─────────────────────────────────────────────────────────────────
export async function getServicios(soloActivos = false) {
  let q = supabase.from('servicios').select('*');
  if (soloActivos) q = q.eq('estado', true);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function createServicio(data) {
  const { data: nuevo, error } = await supabase.from('servicios').insert(data).select().single();
  if (error) throw error;
  return nuevo;
}

export async function updateServicio(id, data) {
  const { data: updated, error } = await supabase.from('servicios').update(data).eq('id', id).select().single();
  if (error) throw error;
  return updated;
}

export async function deleteServicio(id) {
  return updateServicio(id, { estado: false });
}

// ── Reservas ──────────────────────────────────────────────────────────────────
export async function getReservas() {
  const { data, error } = await supabase.from('reservas').select('*');
  if (error) throw error;
  return data || [];
}

export async function getReservasByBarbero(barberoId) {
  const { data, error } = await supabase.from('reservas').select('*').eq('barbero_id', barberoId);
  if (error) throw error;
  return data || [];
}

export async function getReservasByFecha(fecha) {
  const { data, error } = await supabase.from('reservas').select('*').eq('fecha', fecha);
  if (error) throw error;
  return data || [];
}

export async function getReservasByBarberoFecha(barberoId, fecha) {
  const { data, error } = await supabase
    .from('reservas').select('*')
    .eq('barbero_id', barberoId)
    .eq('fecha', fecha)
    .neq('estado', 'cancelada');
  if (error) throw error;
  return data || [];
}

function addMinutes(time, minutes) {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function generateSlots(start, end) {
  const slots = [];
  let cur = start;
  while (cur < end) { slots.push(cur); cur = addMinutes(cur, 30); }
  return slots;
}

export async function getHorasOcupadas(barberoId, fecha) {
  const reservas = await getReservasByBarberoFecha(barberoId, fecha);
  const occupied = new Set();
  reservas.forEach((r) => generateSlots(r.hora_inicio, r.hora_fin).forEach((s) => occupied.add(s)));
  return Array.from(occupied);
}

export async function getHorasDisponibles(barberoId, fecha, duracionMinutos) {
  const { data: barbero } = await supabase.from('barberos').select('*').eq('id', barberoId).single();
  if (!barbero) return [];
  const dayOfWeek = new Date(fecha + 'T12:00:00').getDay();
  if (!barbero.dias_laborales.includes(dayOfWeek)) return [];
  const allSlots = generateSlots(barbero.horario_inicio, barbero.horario_fin);
  const occupied = new Set(await getHorasOcupadas(barberoId, fecha));
  const slotsNeeded = Math.ceil(duracionMinutos / 30);
  const available = [];
  for (let i = 0; i <= allSlots.length - slotsNeeded; i++) {
    const block = allSlots.slice(i, i + slotsNeeded);
    if (block.every((s) => !occupied.has(s))) available.push(allSlots[i]);
  }
  return available;
}

export async function createReserva(data) {
  const existing = await getReservasByBarberoFecha(data.barbero_id, data.fecha);
  if (existing.some((r) => r.hora_inicio === data.hora_inicio))
    throw new Error('Ese horario ya está ocupado. Por favor elige otro.');
  const { data: nueva, error } = await supabase.from('reservas').insert({ ...data, estado: 'pendiente', notas: data.notas || '' }).select().single();
  if (error) throw error;
  return nueva;
}

export async function updateReserva(id, data) {
  const { data: updated, error } = await supabase.from('reservas').update(data).eq('id', id).select().single();
  if (error) throw error;
  return updated;
}

export async function cancelarReserva(id) {
  return updateReserva(id, { estado: 'cancelada' });
}

// ── Servicios Realizados ──────────────────────────────────────────────────────
export async function getServiciosRealizados() {
  const { data, error } = await supabase.from('servicios_realizados').select('*');
  if (error) throw error;
  return data || [];
}

export async function getServiciosRealizadosByBarbero(barberoId) {
  const { data, error } = await supabase.from('servicios_realizados').select('*').eq('barbero_id', barberoId);
  if (error) throw error;
  return data || [];
}

export async function createServicioRealizado(data) {
  const { count } = await supabase.from('servicios_realizados').select('*', { count: 'exact', head: true });
  const numero_recibo = `RS-${String((count || 0) + 1).padStart(8, '0')}`;
  const { data: nuevo, error } = await supabase.from('servicios_realizados').insert({ ...data, numero_recibo }).select().single();
  if (error) throw error;
  return nuevo;
}

// ── Storage (Fotos) ───────────────────────────────────────────────────────────
async function uploadFoto(path, file) {
  const ext = file.name.split('.').pop();
  const { error } = await supabase.storage.from('fotos').upload(`${path}.${ext}`, file, { upsert: true });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from('fotos').getPublicUrl(`${path}.${ext}`);
  return publicUrl;
}

export async function uploadBarberoFoto(barberoId, field, file) {
  const url = await uploadFoto(`barbers/${barberoId}/${field}`, file);
  await updateBarbero(barberoId, { [field]: url });
  return url;
}

export async function uploadSedeFoto(sedeId, file) {
  const url = await uploadFoto(`sedes/${sedeId}/foto`, file);
  await updateSede(sedeId, { foto: url });
  return url;
}
