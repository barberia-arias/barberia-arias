import { useState, useEffect } from 'react';
import {
  getServiciosRealizados, getBarberos, getSedes, getServicios,
  updateServicioRealizado, deleteServicioRealizado,
} from '../../services/db';
import { printRecibo } from '../../utils/recibo';

const formatPrice = (p) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 2 }).format(p);

const MEDIOS_PAGO = ['EFECTIVO', 'YAPE', 'PLIN'];

// Desglose de pagos de un registro: usa el detalle `pagos` si existe,
// si no, atribuye el total al medio de pago único (registros antiguos).
const getDesglose = (r) =>
  Array.isArray(r.pagos) && r.pagos.length > 0
    ? r.pagos
    : [{ medio: r.medio_pago || 'EFECTIVO', monto: Number(r.total || 0) }];

export default function AdminServiciosRealizados() {
  const [registros, setRegistros] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [filterBarbero, setFilterBarbero] = useState('todos');
  const [filterSede, setFilterSede] = useState('todos');
  const [filterFecha, setFilterFecha] = useState('');
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editPagos, setEditPagos] = useState({ EFECTIVO: '', YAPE: '', PLIN: '' });
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);

  const refresh = async () => setRegistros(await getServiciosRealizados());

  useEffect(() => {
    (async () => {
      const [r, b, s, c] = await Promise.all([getServiciosRealizados(), getBarberos(), getSedes(), getServicios()]);
      setRegistros(r);
      setBarberos(b);
      setSedes(s);
      setCatalogo(c);
    })();
  }, []);

  const filtered = registros
    .filter((r) => filterBarbero === 'todos' || r.barbero_id === filterBarbero)
    .filter((r) => filterSede === 'todos' || r.sede_id === filterSede)
    .filter((r) => !filterFecha || r.fecha === filterFecha)
    .sort((a, b) => (a.fecha_creacion > b.fecha_creacion ? -1 : 1));

  const totalFiltrado = filtered.reduce((sum, r) => sum + Number(r.total || 0), 0);
  const hasFilters = filterBarbero !== 'todos' || filterSede !== 'todos' || filterFecha;

  const totalPorMedio = (medio) =>
    filtered.reduce((sum, r) => sum + getDesglose(r).filter((p) => p.medio === medio).reduce((s, p) => s + Number(p.monto || 0), 0), 0);
  const countPorMedio = (medio) => filtered.filter((r) => getDesglose(r).some((p) => p.medio === medio)).length;

  // ── Edición (solo administrador) ─────────────────────────────────────────
  const openEdit = (r) => {
    setEditing(r);
    setEditForm({
      cliente_nombre: r.cliente_nombre || '',
      servicio_id: r.servicio_id || '',
      producto_vendido: r.producto_vendido || '',
      precio_producto: r.precio_producto ? String(r.precio_producto) : '',
    });
    const pagos = { EFECTIVO: '', YAPE: '', PLIN: '' };
    getDesglose(r).forEach((p) => { if (pagos[p.medio] !== undefined) pagos[p.medio] = String(p.monto); });
    setEditPagos(pagos);
    setEditError('');
  };

  const editServicio = catalogo.find((s) => s.id === editForm?.servicio_id);
  const editTotal = Number(editServicio?.precio ?? editing?.servicio_precio ?? 0) +
    (editForm?.producto_vendido && editForm?.precio_producto ? Number(editForm.precio_producto) : 0);
  const editActivos = MEDIOS_PAGO.filter((m) => editPagos[m] !== '');
  const editPagado = editActivos.reduce((s, m) => s + Number(editPagos[m] || 0), 0);

  const handleGuardarEdit = async () => {
    setEditError('');
    if (!editForm.cliente_nombre.trim()) { setEditError('El nombre del cliente es obligatorio.'); return; }
    if (editActivos.length === 0) { setEditError('Indica al menos un medio de pago.'); return; }
    if (editActivos.some((m) => !Number(editPagos[m]) || Number(editPagos[m]) <= 0)) { setEditError('Cada medio de pago necesita un monto válido.'); return; }
    if (Math.abs(editTotal - editPagado) > 0.01) {
      setEditError(`Los pagos (${formatPrice(editPagado)}) no cuadran con el total (${formatPrice(editTotal)}).`);
      return;
    }
    setSaving(true);
    try {
      const pagosList = editActivos.map((m) => ({ medio: m, monto: Number(editPagos[m]) }));
      await updateServicioRealizado(editing.id, {
        cliente_nombre: editForm.cliente_nombre.trim(),
        servicio_id: editForm.servicio_id,
        servicio_nombre: editServicio?.nombre ?? editing.servicio_nombre,
        servicio_precio: Number(editServicio?.precio ?? editing.servicio_precio),
        producto_vendido: editForm.producto_vendido.trim(),
        precio_producto: editForm.producto_vendido.trim() && editForm.precio_producto ? Number(editForm.precio_producto) : 0,
        medio_pago: pagosList.map((p) => p.medio).join(' + '),
        pagos: pagosList,
        total: editTotal,
      });
      setEditing(null);
      await refresh();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async (r) => {
    if (!window.confirm(`¿Eliminar el registro ${r.numero_recibo} de ${r.cliente_nombre}? Esta acción no se puede deshacer.`)) return;
    await deleteServicioRealizado(r.id);
    await refresh();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-white mb-1">Servicios Realizados</h1>
        <p className="text-gray-500 text-sm">Registro de atenciones por barbero · {registros.length} total</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input type="date" value={filterFecha} onChange={(e) => setFilterFecha(e.target.value)} className="input-dark w-auto text-sm" />
        <select value={filterBarbero} onChange={(e) => setFilterBarbero(e.target.value)} className="input-dark w-auto text-sm">
          <option value="todos">Todos los barberos</option>
          {barberos.map((b) => <option key={b.id} value={b.id}>{b.nombre}</option>)}
        </select>
        <select value={filterSede} onChange={(e) => setFilterSede(e.target.value)} className="input-dark w-auto text-sm">
          <option value="todos">Todas las sedes</option>
          {sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
        {hasFilters && (
          <button onClick={() => { setFilterFecha(''); setFilterBarbero('todos'); setFilterSede('todos'); }}
            className="text-xs text-gray-500 hover:text-gold transition-colors px-3 py-2 border border-dark-4">
            Limpiar filtros
          </button>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-dark-2 border border-dark-4 p-4 text-center">
            <div className="font-heading text-2xl font-bold text-gold">{filtered.length}</div>
            <p className="text-gray-500 text-xs uppercase tracking-wide mt-1">Servicios</p>
          </div>
          <div className="bg-dark-2 border border-dark-4 p-4 text-center">
            <div className="font-heading text-xl font-bold text-green-400">{formatPrice(totalFiltrado)}</div>
            <p className="text-gray-500 text-xs uppercase tracking-wide mt-1">Total</p>
          </div>
          {MEDIOS_PAGO.map((medio) => (
            <div key={medio} className="bg-dark-2 border border-dark-4 p-4 text-center">
              <div className={`font-heading text-xl font-bold ${medio === 'YAPE' ? 'text-purple-400' : medio === 'PLIN' ? 'text-green-400' : 'text-white'}`}>
                {formatPrice(totalPorMedio(medio))}
              </div>
              <p className="text-gray-500 text-xs uppercase tracking-wide mt-1">{medio} ({countPorMedio(medio)})</p>
            </div>
          ))}
          <div className="bg-dark-2 border border-dark-4 p-4 text-center">
            <div className="font-heading text-2xl font-bold text-white">{filtered.filter((r) => r.producto_vendido).length}</div>
            <p className="text-gray-500 text-xs uppercase tracking-wide mt-1">Con producto</p>
          </div>
        </div>
      )}

      <div className="bg-dark-2 border border-dark-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-4">
                {['N° Recibo', 'Fecha', 'Hora', 'Cliente', 'Servicio', 'Barbero', 'Sede', 'Pago', 'Total', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-600 text-xs tracking-widest uppercase font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-dark-4/50 hover:bg-dark-3 transition-colors">
                  <td className="px-4 py-3 text-gold font-medium text-xs">{r.numero_recibo}</td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{r.fecha}</td>
                  <td className="px-4 py-3 text-gray-400">{r.hora}</td>
                  <td className="px-4 py-3 text-white">{r.cliente_nombre}</td>
                  <td className="px-4 py-3 text-gray-400">
                    <div>{r.servicio_nombre}</div>
                    {r.producto_vendido && <div className="text-xs text-gray-600 mt-0.5">+ {r.producto_vendido}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{r.barbero_nombre}</td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{r.sede_nombre}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {getDesglose(r).map((p, i) => (
                        <span key={i} className={`text-xs font-bold tracking-wide px-2 py-1 border whitespace-nowrap ${p.medio === 'YAPE' ? 'border-purple-500/50 text-purple-400' : p.medio === 'PLIN' ? 'border-green-500/50 text-green-400' : 'border-dark-4 text-gray-400'}`}>
                          {p.medio} · {formatPrice(p.monto)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{formatPrice(r.total)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 whitespace-nowrap">
                      <button onClick={() => printRecibo(r)} className="text-gold hover:text-gold-light text-xs font-medium uppercase tracking-wide transition-colors">
                        Recibo
                      </button>
                      <button onClick={() => openEdit(r)} className="text-blue-400 hover:text-blue-300 text-xs font-medium uppercase tracking-wide transition-colors">
                        Editar
                      </button>
                      <button onClick={() => handleEliminar(r)} className="text-red-400 hover:text-red-300 text-xs font-medium uppercase tracking-wide transition-colors">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              {registros.length === 0 ? 'Aún no hay servicios registrados.' : 'No hay registros con los filtros aplicados.'}
            </div>
          )}
        </div>
      </div>

      {/* Modal de edición */}
      {editing && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setEditing(null)} />
          <div className="relative bg-dark-2 border border-dark-4 w-full max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-heading text-xl font-semibold text-white">Editar registro</h3>
                <p className="text-gray-600 text-xs mt-0.5">{editing.numero_recibo} · {editing.fecha} {editing.hora} · {editing.barbero_nombre}</p>
              </div>
              <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-white text-xl">×</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label-dark">Cliente *</label>
                <input type="text" value={editForm.cliente_nombre} onChange={(e) => setEditForm((f) => ({ ...f, cliente_nombre: e.target.value }))} className="input-dark" />
              </div>
              <div>
                <label className="label-dark">Servicio</label>
                <select value={editForm.servicio_id} onChange={(e) => setEditForm((f) => ({ ...f, servicio_id: e.target.value }))} className="input-dark">
                  {catalogo.map((s) => <option key={s.id} value={s.id}>{s.nombre} · S/ {s.precio.toFixed(2)}</option>)}
                </select>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-dark">Producto vendido</label>
                  <input type="text" value={editForm.producto_vendido} onChange={(e) => setEditForm((f) => ({ ...f, producto_vendido: e.target.value }))} className="input-dark" placeholder="—" />
                </div>
                <div>
                  <label className="label-dark">Precio producto (S/)</label>
                  <input type="number" min="0" step="0.50" value={editForm.precio_producto} onChange={(e) => setEditForm((f) => ({ ...f, precio_producto: e.target.value }))} className="input-dark" placeholder="0.00" />
                </div>
              </div>

              <div>
                <label className="label-dark mb-2 block">Medios de pago (deja vacío el que no aplique)</label>
                <div className="grid grid-cols-3 gap-3">
                  {MEDIOS_PAGO.map((medio) => (
                    <div key={medio}>
                      <p className="text-gray-500 text-xs mb-1 font-bold tracking-wide">{medio}</p>
                      <input type="number" min="0" step="0.50" value={editPagos[medio]}
                        onChange={(e) => setEditPagos((p) => ({ ...p, [medio]: e.target.value }))}
                        className="input-dark text-sm" placeholder="—" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-dark-3 border border-gold/20 px-4 py-3 flex justify-between items-center text-sm">
                <span className="text-gray-400">Total: <span className="text-gold font-bold">{formatPrice(editTotal)}</span></span>
                <span className={Math.abs(editTotal - editPagado) > 0.01 ? 'text-yellow-400' : 'text-green-400'}>
                  Pagos: {formatPrice(editPagado)} {Math.abs(editTotal - editPagado) > 0.01 ? '✗' : '✓'}
                </span>
              </div>

              {editError && <div className="bg-red-900/20 border border-red-700/50 text-red-400 px-4 py-3 text-sm">{editError}</div>}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditing(null)} className="btn-outline-gold text-xs px-8">Cancelar</button>
                <button onClick={handleGuardarEdit} disabled={saving} className={`btn-gold text-xs flex-1 ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}>
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
