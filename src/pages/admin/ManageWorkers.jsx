import { useState, useEffect } from 'react';
import {
  getUsers, createUser, updateUser, deleteUser,
  getBarberos, createBarbero, updateBarbero, uploadBarberoFoto,
  getSedes, getServicios,
} from '../../services/db';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const emptyForm = {
  nombre: '', correo: '', password: '', rol: 'barbero', estado: true,
  especialidad: '', descripcion: '', horario_inicio: '09:00', horario_fin: '18:00',
  dias_laborales: [1, 2, 3, 4, 5, 6], sede_id: '', servicios_ids: [],
};

export default function ManageWorkers() {
  const [users, setUsers] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [listError, setListError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [uploadingFoto, setUploadingFoto] = useState(null);

  const refresh = async () => {
    const [u, b] = await Promise.all([getUsers(), getBarberos()]);
    setUsers(u);
    setBarberos(b);
  };

  useEffect(() => {
    (async () => {
      await refresh();
      const [s, sv] = await Promise.all([getSedes(true), getServicios(true)]);
      setSedes(s);
      setServicios(sv);
    })();
  }, []);

  const getBarberoForUser = (userId) => barberos.find((b) => b.usuario_id === userId);
  const getSedeNombre = (sedeId) => sedes.find((s) => s.id === sedeId)?.nombre || '-';

  const openCreate = () => {
    setEditingUser(null);
    setForm({ ...emptyForm, sede_id: sedes[0]?.id || '' });
    setError('');
    setShowForm(true);
  };

  const openEdit = (user) => {
    const barbero = getBarberoForUser(user.id);
    setEditingUser(user);
    setForm({
      nombre: user.nombre, correo: user.correo || '', password: '',
      rol: user.rol, estado: user.estado,
      especialidad: barbero?.especialidad || '',
      descripcion: barbero?.descripcion || '',
      horario_inicio: barbero?.horario_inicio || '09:00',
      horario_fin: barbero?.horario_fin || '18:00',
      dias_laborales: barbero?.dias_laborales || [1, 2, 3, 4, 5, 6],
      sede_id: barbero?.sede_id || sedes[0]?.id || '',
      servicios_ids: barbero?.servicios_ids || [],
    });
    setError('');
    setShowForm(true);
  };

  const toggleDay = (day) => setForm((f) => ({
    ...f,
    dias_laborales: f.dias_laborales.includes(day)
      ? f.dias_laborales.filter((d) => d !== day)
      : [...f.dias_laborales, day].sort(),
  }));

  const toggleServicio = (serviceId) => setForm((f) => ({
    ...f,
    servicios_ids: f.servicios_ids.includes(serviceId)
      ? f.servicios_ids.filter((id) => id !== serviceId)
      : [...f.servicios_ids, serviceId],
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editingUser) {
        const updates = { nombre: form.nombre, rol: form.rol, estado: form.estado };
        await updateUser(editingUser.id, updates);

        const barbero = getBarberoForUser(editingUser.id);
        const barberoData = {
          nombre: form.nombre, especialidad: form.especialidad,
          descripcion: form.descripcion, horario_inicio: form.horario_inicio,
          horario_fin: form.horario_fin, dias_laborales: form.dias_laborales,
          estado: form.estado, sede_id: form.sede_id, servicios_ids: form.servicios_ids,
        };
        if (barbero) await updateBarbero(barbero.id, barberoData);
        else await createBarbero({ ...barberoData, usuario_id: editingUser.id });

        setSuccess(`Trabajador ${form.nombre} actualizado correctamente.`);
      } else {
        if (!form.password) { setError('La contraseña es obligatoria.'); setSaving(false); return; }
        const newUser = await createUser({
          nombre: form.nombre, correo: form.correo,
          password: form.password, rol: form.rol, estado: form.estado,
        });
        if (form.rol === 'barbero') {
          await createBarbero({
            usuario_id: newUser.id, nombre: form.nombre,
            especialidad: form.especialidad, descripcion: form.descripcion,
            horario_inicio: form.horario_inicio, horario_fin: form.horario_fin,
            dias_laborales: form.dias_laborales, estado: form.estado,
            sede_id: form.sede_id, servicios_ids: form.servicios_ids,
          });
        }
        setSuccess(`Trabajador ${form.nombre} creado correctamente.`);
      }
      setShowForm(false);
      await refresh();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`¿Eliminar la cuenta de "${user.nombre}" de forma permanente? Esta acción no se puede deshacer.`)) return;
    setListError('');
    setDeletingId(user.id);
    try {
      await deleteUser(user.id);
      setSuccess(`Cuenta de ${user.nombre} eliminada correctamente.`);
      await refresh();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setListError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleFotoUpload = async (barbero, field, file) => {
    if (!file) return;
    setListError('');
    setUploadingFoto(`${barbero.id}-${field}`);
    try {
      await uploadBarberoFoto(barbero.id, field, file);
      await refresh();
    } catch (err) {
      setListError('Error al subir la foto: ' + err.message);
    } finally {
      setUploadingFoto(null);
    }
  };

  const workers = users.filter((u) => u.rol !== 'admin');

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white mb-1">Trabajadores</h1>
          <p className="text-gray-500 text-sm">Gestiona los barberos del equipo</p>
        </div>
        <button onClick={openCreate} className="btn-gold text-xs">+ Nuevo Trabajador</button>
      </div>

      {success && <div className="bg-green-900/20 border border-green-700/50 text-green-400 px-4 py-3 text-sm mb-6">{success}</div>}
      {listError && <div className="bg-red-900/20 border border-red-700/50 text-red-400 px-4 py-3 text-sm mb-6">{listError}</div>}

      <div className="bg-dark-2 border border-dark-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-4">
                {['Nombre', 'Correo', 'Sede', 'Especialidad', 'Horario', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-gray-600 text-xs tracking-widest uppercase font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workers.map((u) => {
                const b = getBarberoForUser(u.id);
                return (
                  <tr key={u.id} className="border-b border-dark-4/50 hover:bg-dark-3 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 flex-shrink-0">
                          {b?.foto ? (
                            <img src={b.foto} alt={u.nombre} className="w-8 h-8 rounded-full object-cover border border-gold/40" />
                          ) : (
                            <div className="w-8 h-8 bg-gold/20 border border-gold/40 flex items-center justify-center text-gold text-xs font-bold">
                              {u.nombre.charAt(0)}
                            </div>
                          )}
                          {(uploadingFoto === `${b?.id}-foto`) && (
                            <div className="absolute inset-0 bg-dark/70 rounded-full flex items-center justify-center">
                              <div className="w-3 h-3 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                        </div>
                        <span className="text-white font-medium">{u.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{u.correo || '-'}</td>
                    <td className="px-6 py-4 text-gray-400">{b?.sede_id ? getSedeNombre(b.sede_id) : '-'}</td>
                    <td className="px-6 py-4 text-gray-400">{b?.especialidad || '-'}</td>
                    <td className="px-6 py-4 text-gray-400">{b ? `${b.horario_inicio} – ${b.horario_fin}` : '-'}</td>
                    <td className="px-6 py-4">
                      <span className={u.estado ? 'badge-confirmed' : 'badge-cancelled'}>{u.estado ? 'Activo' : 'Inactivo'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 flex-wrap">
                        <button onClick={() => openEdit(u)} className="text-gold hover:text-gold-light text-xs font-medium tracking-wide uppercase transition-colors">Editar</button>
                        {b && (
                          <>
                            <label className={`text-blue-400 hover:text-blue-300 text-xs font-medium tracking-wide uppercase cursor-pointer transition-colors ${uploadingFoto === `${b.id}-foto` ? 'opacity-50 pointer-events-none' : ''}`}>
                              {b.foto ? 'Cambiar foto' : 'Subir foto'}
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFotoUpload(b, 'foto', e.target.files[0])} />
                            </label>
                            <label className={`text-blue-400 hover:text-blue-300 text-xs font-medium tracking-wide uppercase cursor-pointer transition-colors ${uploadingFoto === `${b.id}-foto_hover` ? 'opacity-50 pointer-events-none' : ''}`}>
                              {b.foto_hover ? 'Cambiar hover' : 'Subir hover'}
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFotoUpload(b, 'foto_hover', e.target.files[0])} />
                            </label>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={deletingId === u.id}
                          className="text-red-500 hover:text-red-400 text-xs font-medium tracking-wide uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingId === u.id ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {workers.length === 0 && <div className="p-10 text-center text-gray-500">No hay trabajadores registrados.</div>}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-dark-2 border border-dark-4 w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-8 py-5 border-b border-dark-4">
              <h3 className="font-heading text-xl text-white">{editingUser ? 'Editar Trabajador' : 'Nuevo Trabajador'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white text-xl">×</button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="label-dark">Nombre completo *</label>
                  <input required value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} className="input-dark" placeholder="Nombre del barbero" />
                </div>
                <div>
                  <label className="label-dark">Correo electrónico *</label>
                  <input required type="email" value={form.correo} disabled={!!editingUser} onChange={(e) => setForm((f) => ({ ...f, correo: e.target.value }))} className={`input-dark ${editingUser ? 'opacity-50 cursor-not-allowed' : ''}`} placeholder="correo@ejemplo.com" />
                </div>
                {!editingUser && (
                  <div>
                    <label className="label-dark">Contraseña *</label>
                    <input type="password" required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="input-dark" placeholder="••••••••" />
                  </div>
                )}
                <div>
                  <label className="label-dark">Rol</label>
                  <select value={form.rol} onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value }))} className="input-dark">
                    <option value="barbero">Barbero</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              {editingUser && (
                <div className="bg-dark-3 border border-dark-4 px-4 py-3 text-xs text-gray-500">
                  Para cambiar la contraseña de un barbero, ve al panel de Supabase → Authentication → Users.
                </div>
              )}

              {form.rol === 'barbero' && (
                <div className="bg-dark-3 border border-dark-4 px-4 py-3 text-xs text-gray-500">
                  La foto se sube después de {editingUser ? 'guardar los cambios' : 'crear al trabajador'}, con los botones "Subir foto" / "Subir hover" en la tabla.
                </div>
              )}

              {form.rol === 'barbero' && (
                <>
                  <div>
                    <label className="label-dark">Sede asignada *</label>
                    <select required value={form.sede_id} onChange={(e) => setForm((f) => ({ ...f, sede_id: e.target.value }))} className="input-dark">
                      <option value="">— Selecciona una sede —</option>
                      {sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre} — {s.direccion}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label-dark">Especialidad</label>
                    <input value={form.especialidad} onChange={(e) => setForm((f) => ({ ...f, especialidad: e.target.value }))} className="input-dark" placeholder="Ej: Cortes Clásicos & Fade" />
                  </div>
                  <div>
                    <label className="label-dark">Descripción</label>
                    <textarea rows={3} value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} className="input-dark resize-none" placeholder="Breve descripción del barbero..." />
                  </div>
                  <div>
                    <label className="label-dark mb-2 block">Servicios que puede realizar</label>
                    <div className="grid grid-cols-2 gap-2">
                      {servicios.map((s) => (
                        <button key={s.id} type="button" onClick={() => toggleServicio(s.id)}
                          className={`px-3 py-2 text-xs font-medium border text-left transition-all ${form.servicios_ids.includes(s.id) ? 'bg-gold text-dark border-gold' : 'border-dark-4 text-gray-500 hover:border-gold/50'}`}>
                          {s.nombre}
                        </button>
                      ))}
                    </div>
                    {form.servicios_ids.length === 0 && <p className="text-gray-600 text-xs mt-2">Sin selección: puede realizar todos los servicios.</p>}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="label-dark">Inicio jornada</label>
                      <input type="time" value={form.horario_inicio} onChange={(e) => setForm((f) => ({ ...f, horario_inicio: e.target.value }))} className="input-dark" />
                    </div>
                    <div>
                      <label className="label-dark">Fin jornada</label>
                      <input type="time" value={form.horario_fin} onChange={(e) => setForm((f) => ({ ...f, horario_fin: e.target.value }))} className="input-dark" />
                    </div>
                  </div>
                  <div>
                    <label className="label-dark mb-2 block">Días laborales</label>
                    <div className="flex gap-2 flex-wrap">
                      {DAYS.map((d, i) => (
                        <button key={i} type="button" onClick={() => toggleDay(i)}
                          className={`px-3 py-2 text-xs font-medium border transition-all ${form.dias_laborales.includes(i) ? 'bg-gold text-dark border-gold' : 'border-dark-4 text-gray-500 hover:border-gold/50'}`}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center gap-3">
                <input type="checkbox" id="estado" checked={form.estado} onChange={(e) => setForm((f) => ({ ...f, estado: e.target.checked }))} className="accent-gold w-4 h-4" />
                <label htmlFor="estado" className="text-gray-400 text-sm">Cuenta activa</label>
              </div>

              {error && <div className="bg-red-900/20 border border-red-700/50 text-red-400 px-4 py-3 text-sm">{error}</div>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline-gold text-xs flex-1">Cancelar</button>
                <button type="submit" disabled={saving} className={`btn-gold text-xs flex-1 ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}>
                  {saving ? 'Guardando...' : (editingUser ? 'Guardar Cambios' : 'Crear Trabajador')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
