import { useState, useEffect } from 'react';
import { getReservas, getBarberos, getServicios, updateReserva } from '../../services/db';
import { format } from 'date-fns';

const STATUS_OPTIONS = ['todos', 'pendiente', 'confirmada', 'cancelada', 'finalizada'];
const statusBadge = {
  pendiente: 'badge-pending',
  confirmada: 'badge-confirmed',
  cancelada: 'badge-cancelled',
  finalizada: 'badge-finished',
};
const pagoBadge = {
  no_aplica: { text: 'En el local', className: 'badge-pending' },
  pendiente: { text: 'Pago pendiente', className: 'badge-pending' },
  pagado: { text: 'Pagado ✓', className: 'badge-confirmed' },
  rechazado: { text: 'Pago rechazado', className: 'badge-cancelled' },
};

export default function AdminReservations() {
  const [reservas, setReservas] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterBarbero, setFilterBarbero] = useState('todos');
  const [filterFecha, setFilterFecha] = useState('');
  const [selected, setSelected] = useState(null);

  const refresh = async () => setReservas(await getReservas());

  useEffect(() => {
    (async () => {
      const [r, b, s] = await Promise.all([getReservas(), getBarberos(), getServicios()]);
      setReservas(r);
      setBarberos(b);
      setServicios(s);
    })();
  }, []);

  const getBarberName = (id) => barberos.find((b) => b.id === id)?.nombre || '-';
  const getServiceName = (id) => servicios.find((s) => s.id === id)?.nombre || '-';
  const getServicePrice = (id) => servicios.find((s) => s.id === id)?.precio || 0;
  const formatPrice = (p) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 2 }).format(p);

  const filtered = reservas
    .filter((r) => filterStatus === 'todos' || r.estado === filterStatus)
    .filter((r) => filterBarbero === 'todos' || r.barbero_id === filterBarbero)
    .filter((r) => !filterFecha || r.fecha === filterFecha)
    .sort((a, b) => (a.fecha + a.hora_inicio) > (b.fecha + b.hora_inicio) ? -1 : 1);

  const changeStatus = async (id, estado) => {
    await updateReserva(id, { estado });
    await refresh();
    if (selected?.id === id) setSelected({ ...selected, estado });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-white mb-1">Reservas</h1>
        <p className="text-gray-500 text-sm">Historial completo de citas · {reservas.length} total</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input type="date" value={filterFecha} onChange={(e) => setFilterFecha(e.target.value)} className="input-dark w-auto text-sm" />
        <select value={filterBarbero} onChange={(e) => setFilterBarbero(e.target.value)} className="input-dark w-auto text-sm">
          <option value="todos">Todos los barberos</option>
          {barberos.map((b) => <option key={b.id} value={b.id}>{b.nombre}</option>)}
        </select>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 text-xs font-medium border transition-all capitalize ${filterStatus === s ? 'bg-gold text-dark border-gold' : 'border-dark-4 text-gray-500 hover:border-gold/50'}`}>
              {s}
            </button>
          ))}
        </div>
        {(filterFecha || filterBarbero !== 'todos' || filterStatus !== 'todos') && (
          <button onClick={() => { setFilterFecha(''); setFilterBarbero('todos'); setFilterStatus('todos'); }}
            className="text-xs text-gray-500 hover:text-gold transition-colors px-3 py-2 border border-dark-4">
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="flex gap-6">
        <div className="flex-1 bg-dark-2 border border-dark-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-4">
                  {['Fecha', 'Hora', 'Cliente', 'Servicio', 'Barbero', 'Estado', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-gray-600 text-xs tracking-widest uppercase font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} onClick={() => setSelected(r)}
                    className={`border-b border-dark-4/50 cursor-pointer transition-colors ${selected?.id === r.id ? 'bg-gold/5' : 'hover:bg-dark-3'}`}>
                    <td className="px-5 py-3 text-gray-400">{r.fecha}</td>
                    <td className="px-5 py-3 font-medium text-gold">{r.hora_inicio}</td>
                    <td className="px-5 py-3 text-white">{r.cliente_nombre}</td>
                    <td className="px-5 py-3 text-gray-400">{getServiceName(r.servicio_id)}</td>
                    <td className="px-5 py-3 text-gray-400">{getBarberName(r.barbero_id)}</td>
                    <td className="px-5 py-3"><span className={statusBadge[r.estado] || 'badge-pending'}>{r.estado}</span></td>
                    <td className="px-5 py-3 text-gray-600 text-xs">›</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="p-10 text-center text-gray-500">No hay reservas que coincidan con los filtros.</div>}
          </div>
        </div>

        {selected && (
          <div className="w-72 flex-shrink-0 bg-dark-2 border border-dark-4 p-5 self-start">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-base font-semibold text-white">Detalle</h3>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white">×</button>
            </div>
            <div className="space-y-3 text-sm mb-6">
              {[
                { label: 'ID', value: `#${selected.id.slice(-6).toUpperCase()}` },
                { label: 'Cliente', value: selected.cliente_nombre },
                { label: 'Teléfono', value: selected.cliente_telefono || '-' },
                { label: 'Correo', value: selected.cliente_correo || '-' },
                { label: 'Servicio', value: getServiceName(selected.servicio_id) },
                { label: 'Precio', value: formatPrice(getServicePrice(selected.servicio_id)) },
                { label: 'Barbero', value: getBarberName(selected.barbero_id) },
                { label: 'Fecha', value: selected.fecha },
                { label: 'Hora', value: `${selected.hora_inicio} – ${selected.hora_fin}` },
                { label: 'Estado', value: selected.estado },
              ].map((item) => (
                <div key={item.label} className="flex justify-between gap-2">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="text-white text-right">{item.value}</span>
                </div>
              ))}
              <div className="flex justify-between gap-2">
                <span className="text-gray-600">Pago</span>
                <span className={pagoBadge[selected.pago_estado || 'no_aplica']?.className || 'badge-pending'}>
                  {pagoBadge[selected.pago_estado || 'no_aplica']?.text || 'En el local'}
                </span>
              </div>
              {selected.notas && (
                <div className="pt-3 border-t border-dark-4">
                  <p className="text-gray-600 text-xs mb-1">Notas:</p>
                  <p className="text-gray-400">{selected.notas}</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-gray-600 text-xs tracking-widest uppercase mb-2">Cambiar estado:</p>
              {['pendiente', 'confirmada', 'finalizada', 'cancelada'].map((s) => (
                <button key={s} disabled={selected.estado === s} onClick={() => changeStatus(selected.id, s)}
                  className={`w-full text-left px-3 py-2 text-xs border transition-all capitalize ${selected.estado === s ? 'border-gold bg-gold/10 text-gold cursor-default' : 'border-dark-4 text-gray-500 hover:border-gold/50 hover:text-gray-300'}`}>
                  {s === selected.estado ? `✓ ${s}` : s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
