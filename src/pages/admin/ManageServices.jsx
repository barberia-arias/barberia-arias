import { useState, useEffect } from 'react';
import { getServicios, createServicio, updateServicio } from '../../services/db';

const emptyForm = { nombre: '', descripcion: '', duracion_minutos: 30, precio: 0, estado: true };

export default function ManageServices() {
  const [servicios, setServicios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const refresh = async () => setServicios(await getServicios());
  useEffect(() => { refresh(); }, []);

  const formatPrice = (p) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 2 }).format(p);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(''); setShowForm(true); };
  const openEdit = (s) => { setEditing(s); setForm({ ...s }); setError(''); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = { ...form, duracion_minutos: Number(form.duracion_minutos), precio: Number(form.precio) };
      if (editing) { await updateServicio(editing.id, data); setSuccess('Servicio actualizado.'); }
      else { await createServicio(data); setSuccess('Servicio creado.'); }
      setShowForm(false);
      await refresh();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Desactivar este servicio?')) return;
    await updateServicio(id, { estado: false });
    await refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white mb-1">Servicios</h1>
          <p className="text-gray-500 text-sm">Catálogo de servicios de Barbería ARIAS</p>
        </div>
        <button onClick={openCreate} className="btn-gold text-xs">+ Nuevo Servicio</button>
      </div>

      {success && <div className="bg-green-900/20 border border-green-700/50 text-green-400 px-4 py-3 text-sm mb-6">{success}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {servicios.map((s) => (
          <div key={s.id} className={`bg-dark-2 border p-6 transition-all ${s.estado ? 'border-dark-4 hover:border-gold/40' : 'border-dark-4/30 opacity-50'}`}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-heading text-lg font-semibold text-white">{s.nombre}</h3>
              <span className={s.estado ? 'badge-confirmed' : 'badge-cancelled'}>{s.estado ? 'Activo' : 'Inactivo'}</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">{s.descripcion}</p>
            <div className="flex items-center justify-between pt-4 border-t border-dark-4">
              <div>
                <span className="text-gold font-bold font-heading text-lg">{formatPrice(s.precio)}</span>
                <span className="text-gray-600 text-xs ml-2">· {s.duracion_minutos} min</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(s)} className="text-gold text-xs hover:text-gold-light uppercase tracking-wide transition-colors">Editar</button>
                {s.estado && <button onClick={() => handleDelete(s.id)} className="text-red-500 text-xs hover:text-red-400 uppercase tracking-wide transition-colors">Desactivar</button>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-dark-2 border border-dark-4 w-full max-w-lg my-8">
            <div className="flex items-center justify-between px-8 py-5 border-b border-dark-4">
              <h3 className="font-heading text-xl text-white">{editing ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white text-xl">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="label-dark">Nombre del servicio *</label>
                <input required value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} className="input-dark" placeholder="Ej: Corte Clásico" />
              </div>
              <div>
                <label className="label-dark">Descripción</label>
                <textarea rows={3} value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} className="input-dark resize-none" placeholder="Descripción del servicio..." />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="label-dark">Duración (minutos) *</label>
                  <input type="number" required min={15} step={15} value={form.duracion_minutos} onChange={(e) => setForm((f) => ({ ...f, duracion_minutos: e.target.value }))} className="input-dark" />
                </div>
                <div>
                  <label className="label-dark">Precio (S/) *</label>
                  <input type="number" required min={0} value={form.precio} onChange={(e) => setForm((f) => ({ ...f, precio: e.target.value }))} className="input-dark" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="sEstado" checked={form.estado} onChange={(e) => setForm((f) => ({ ...f, estado: e.target.checked }))} className="accent-gold w-4 h-4" />
                <label htmlFor="sEstado" className="text-gray-400 text-sm">Servicio activo</label>
              </div>
              {error && <div className="bg-red-900/20 border border-red-700/50 text-red-400 px-4 py-3 text-sm">{error}</div>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline-gold text-xs flex-1">Cancelar</button>
                <button type="submit" className="btn-gold text-xs flex-1">{editing ? 'Guardar' : 'Crear Servicio'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
