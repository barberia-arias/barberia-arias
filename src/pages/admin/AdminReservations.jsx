import { useState, useEffect } from 'react';
import { getReservas, getBarberos, getServicios, updateReserva } from '../../services/db';

const STATUS_OPTIONS = ['todos', 'pendiente', 'confirmada', 'cancelada', 'finalizada'];
const ESTADOS = ['pendiente', 'confirmada', 'finalizada', 'cancelada'];
const statusBadge = {
  pendiente: 'badge-pending',
  confirmada: 'badge-confirmed',
  cancelada: 'badge-cancelled',
  finalizada: 'badge-finished',
};

export default function AdminReservations() {
  const [reservas, setReservas] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterBarbero, setFilterBarbero] = useState('todos');
  const [filterFecha, setFilterFecha] = useState('');
  const [openMenu, setOpenMenu] = useState(null);

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

  const filtered = reservas
    .filter((r) => filterStatus === 'todos' || r.estado === filterStatus)
    .filter((r) => filterBarbero === 'todos' || r.barbero_id === filterBarbero)
    .filter((r) => !filterFecha || r.fecha === filterFecha)
    .sort((a, b) => (a.fecha + a.hora_inicio) > (b.fecha + b.hora_inicio) ? -1 : 1);

  const changeStatus = async (id, estado) => {
    await updateReserva(id, { estado });
    setOpenMenu(null);
    await refresh();
  };

  const statusList = (r) => (
    <div className="mt-2 space-y-1.5">
      {ESTADOS.map((s) => (
        <button key={s} disabled={r.estado === s} onClick={() => changeStatus(r.id, s)}
          className={`block w-full text-left px-3 py-2 text-xs border transition-all capitalize ${r.estado === s ? 'border-gold bg-gold/10 text-gold cursor-default' : 'border-dark-4 bg-dark-3 text-gray-400 hover:border-gold/50 hover:text-gray-200'}`}>
          {s === r.estado ? `✓ ${s}` : s}
        </button>
      ))}
    </div>
  );

  const statusToggle = (r) => (
    <button onClick={() => setOpenMenu(openMenu === r.id ? null : r.id)}
      className="inline-flex items-center gap-1.5"
      title="Cambiar estado">
      <span className={statusBadge[r.estado] || 'badge-pending'}>{r.estado}</span>
      <span className={`text-gray-500 text-xs transition-transform ${openMenu === r.id ? 'rotate-180' : ''}`}>▾</span>
    </button>
  );

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

      {/* Vista móvil: tarjetas */}
      <div className="lg:hidden space-y-4">
        {filtered.length === 0 && (
          <div className="bg-dark-2 border border-dark-4 p-10 text-center text-gray-500">No hay reservas que coincidan con los filtros.</div>
        )}
        {filtered.map((r) => (
          <div key={r.id} className="bg-dark-2 border border-dark-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-white font-semibold">{r.cliente_nombre}</p>
                <p className="text-gray-400 text-sm">{getServiceName(r.servicio_id)} · {getBarberName(r.barbero_id)}</p>
                <p className="text-gray-500 text-xs mt-1">{r.fecha} · <span className="text-gold font-medium">{r.hora_inicio}</span></p>
                {r.cliente_telefono && <p className="text-gray-600 text-xs mt-1">📞 {r.cliente_telefono}</p>}
              </div>
              <div className="flex-shrink-0">{statusToggle(r)}</div>
            </div>
            {openMenu === r.id && statusList(r)}
          </div>
        ))}
      </div>

      {/* Vista escritorio: tabla */}
      <div className="hidden lg:block bg-dark-2 border border-dark-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-4">
                {['Fecha', 'Hora', 'Cliente', 'Servicio', 'Barbero', 'Estado'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-gray-600 text-xs tracking-widest uppercase font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-dark-4/50 hover:bg-dark-3 transition-colors align-top">
                  <td className="px-5 py-3 text-gray-400">{r.fecha}</td>
                  <td className="px-5 py-3 font-medium text-gold">{r.hora_inicio}</td>
                  <td className="px-5 py-3 text-white">{r.cliente_nombre}</td>
                  <td className="px-5 py-3 text-gray-400">{getServiceName(r.servicio_id)}</td>
                  <td className="px-5 py-3 text-gray-400">{getBarberName(r.barbero_id)}</td>
                  <td className="px-5 py-3">
                    {statusToggle(r)}
                    {openMenu === r.id && <div className="w-40">{statusList(r)}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-10 text-center text-gray-500">No hay reservas que coincidan con los filtros.</div>}
        </div>
      </div>
    </div>
  );
}
