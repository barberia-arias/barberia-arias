import { useState, useEffect } from 'react';
import { getSedes, createSede, updateSede } from '../../services/db';

const emptyForm = { nombre: '', direccion: '', estado: true, foto: '' };

export default function ManageSedes() {
  const [sedes, setSedes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const refresh = async () => setSedes(await getSedes());
  useEffect(() => { refresh(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(''); setShowForm(true); };
  const openEdit = (s) => { setEditing(s); setForm({ nombre: s.nombre, direccion: s.direccion, estado: s.estado, foto: s.foto || '' }); setError(''); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (!form.nombre.trim()) throw new Error('El nombre es obligatorio.');
      if (!form.direccion.trim()) throw new Error('La dirección es obligatoria.');
      if (editing) {
        await updateSede(editing.id, form);
        setSuccess(`Sede "${form.nombre}" actualizada.`);
      } else {
        await createSede(form);
        setSuccess(`Sede "${form.nombre}" creada.`);
      }
      setShowForm(false);
      await refresh();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleEstado = async (sede) => {
    await updateSede(sede.id, { estado: !sede.estado });
    await refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white mb-1">Sedes</h1>
          <p className="text-gray-500 text-sm">Gestiona las sucursales de Barbershop Arias</p>
        </div>
        <button onClick={openCreate} className="btn-gold text-xs">+ Nueva Sede</button>
      </div>

      {success && <div className="bg-green-900/20 border border-green-700/50 text-green-400 px-4 py-3 text-sm mb-6">{success}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sedes.map((s) => (
          <div key={s.id} className={`bg-dark-2 border transition-all overflow-hidden ${s.estado ? 'border-dark-4 hover:border-gold/40' : 'border-dark-4/30 opacity-50'}`}>
            <div className="relative w-full bg-dark-3" style={{ aspectRatio: '16 / 9' }}>
              {s.foto ? (
                <img src={s.foto} alt={s.nombre} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <span className="font-heading text-4xl font-bold text-dark-4">{s.nombre.charAt(0).toUpperCase()}</span>
                  <span className="text-gray-700 text-xs">Sin foto</span>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <span className={s.estado ? 'badge-confirmed' : 'badge-cancelled'}>{s.estado ? 'Activa' : 'Inactiva'}</span>
              </div>
              <h3 className="font-heading text-xl font-semibold text-white mb-2">{s.nombre}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-1">{s.direccion}</p>
              <p className="text-gray-700 text-xs mb-5">Lima - Perú</p>

              <div className="flex gap-4 pt-4 border-t border-dark-4 flex-wrap">
                <button onClick={() => openEdit(s)} className="text-gold text-xs hover:text-gold-light uppercase tracking-wide transition-colors">Editar</button>
                <button onClick={() => toggleEstado(s)} className="text-gray-500 text-xs hover:text-gray-300 uppercase tracking-wide transition-colors">
                  {s.estado ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sedes.length === 0 && <div className="bg-dark-2 border border-dark-4 p-12 text-center text-gray-500">No hay sedes registradas.</div>}

      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-2 border border-dark-4 w-full max-w-md">
            <div className="flex items-center justify-between px-8 py-5 border-b border-dark-4">
              <h3 className="font-heading text-xl text-white">{editing ? 'Editar Sede' : 'Nueva Sede'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white text-xl">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="label-dark">Nombre de la sede *</label>
                <input required value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} className="input-dark" placeholder="Ej: Los Olivos" />
              </div>
              <div>
                <label className="label-dark">Dirección *</label>
                <textarea required rows={3} value={form.direccion} onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))} className="input-dark resize-none" placeholder="Av. Ejemplo N° 123, Urb. ..." />
              </div>
              <div>
                <label className="label-dark">URL de la foto</label>
                <input value={form.foto} onChange={(e) => setForm((f) => ({ ...f, foto: e.target.value }))} className="input-dark" placeholder="https://..." />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="sedeEstado" checked={form.estado} onChange={(e) => setForm((f) => ({ ...f, estado: e.target.checked }))} className="accent-gold w-4 h-4" />
                <label htmlFor="sedeEstado" className="text-gray-400 text-sm">Sede activa</label>
              </div>
              {error && <div className="bg-red-900/20 border border-red-700/50 text-red-400 px-4 py-3 text-sm">{error}</div>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline-gold text-xs flex-1">Cancelar</button>
                <button type="submit" className="btn-gold text-xs flex-1">{editing ? 'Guardar' : 'Crear Sede'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
