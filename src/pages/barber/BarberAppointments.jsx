import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getBarberoByUserId, getReservasByBarbero, getServicios, updateReserva } from '../../services/db';

const statusBadge = {
  pendiente: 'badge-pending',
  confirmada: 'badge-confirmed',
  cancelada: 'badge-cancelled',
  finalizada: 'badge-finished',
};

export default function BarberAppointments() {
  const { user } = useAuth();
  const [barbero, setBarbero] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [filterFecha, setFilterFecha] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  const refresh = async (b) => {
    const all = await getReservasByBarbero((b || barbero).id);
    setReservas(all.sort((a, b2) => (a.fecha + a.hora_inicio) > (b2.fecha + b2.hora_inicio) ? -1 : 1));
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      const b = await getBarberoByUserId(user.id);
      setBarbero(b);
      if (b) {
        await refresh(b);
        setServicios(await getServicios());
      }
    })();
  }, [user]);

  const getServiceName = (id) => servicios.find((s) => s.id === id)?.nombre || '-';

  const filtered = reservas
    .filter((r) => filterStatus === 'todos' || r.estado === filterStatus)
    .filter((r) => !filterFecha || r.fecha === filterFecha);

  const markFinished = async (id) => {
    await updateReserva(id, { estado: 'finalizada' });
    if (barbero) await refresh(barbero);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-white mb-1">Mis Citas</h1>
        <p className="text-gray-500 text-sm">Historial de reservas · {reservas.length} registradas</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input type="date" value={filterFecha} onChange={(e) => setFilterFecha(e.target.value)} className="input-dark w-auto text-sm" />
        {['todos', 'pendiente', 'confirmada', 'finalizada', 'cancelada'].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-2 text-xs font-medium border transition-all capitalize ${filterStatus === s ? 'bg-gold text-dark border-gold' : 'border-dark-4 text-gray-500 hover:border-gold/50'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-dark-2 border border-dark-4">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No hay citas que mostrar.</div>
        ) : (
          <div className="divide-y divide-dark-4/50">
            {filtered.map((r) => (
              <div key={r.id} className="px-4 sm:px-6 py-5 hover:bg-dark-3 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="text-right min-w-[64px] sm:min-w-[80px] flex-shrink-0">
                    <p className="font-heading text-gold font-bold text-lg">{r.hora_inicio}</p>
                    <p className="text-gray-600 text-xs">{r.fecha}</p>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{r.cliente_nombre}</p>
                    <p className="text-gray-400 text-sm">{getServiceName(r.servicio_id)}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                      {r.cliente_telefono && <span className="text-gray-600 text-xs">📞 {r.cliente_telefono}</span>}
                      {r.cliente_correo && <span className="text-gray-600 text-xs break-all">✉ {r.cliente_correo}</span>}
                    </div>
                    {r.notas && <p className="text-gray-600 text-xs mt-1 italic">"{r.notas}"</p>}
                  </div>
                </div>
                <div className="flex items-center flex-wrap gap-3">
                  <span className={statusBadge[r.estado] || 'badge-pending'}>{r.estado}</span>
                  {(r.estado === 'pendiente' || r.estado === 'confirmada') && (
                    <button onClick={() => markFinished(r.id)}
                      className="text-xs text-gray-500 hover:text-green-400 border border-dark-4 hover:border-green-700 px-3 py-1.5 transition-all">
                      Marcar finalizada
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
