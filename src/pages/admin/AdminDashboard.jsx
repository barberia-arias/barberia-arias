import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getReservas, getBarberos, getServicios, getReservasByFecha } from '../../services/db';
import { format } from 'date-fns';

const statusBadge = {
  pendiente: 'badge-pending',
  confirmada: 'badge-confirmed',
  cancelada: 'badge-cancelled',
  finalizada: 'badge-finished',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({ reservas: 0, barberos: 0, servicios: 0, hoy: 0 });
  const [reservasHoy, setReservasHoy] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    (async () => {
      const [allReservas, todayR, allBarberos, allServicios] = await Promise.all([
        getReservas(),
        getReservasByFecha(today),
        getBarberos(),
        getServicios(),
      ]);
      setStats({
        reservas: allReservas.filter((r) => r.estado !== 'cancelada').length,
        barberos: allBarberos.filter((b) => b.estado).length,
        servicios: allServicios.filter((s) => s.estado).length,
        hoy: todayR.filter((r) => r.estado !== 'cancelada').length,
      });
      setReservasHoy(todayR.slice(0, 8));
      setBarberos(allBarberos);
      setServicios(allServicios);
    })();
  }, []);

  const getBarberName = (id) => barberos.find((b) => b.id === id)?.nombre || '-';
  const getServiceName = (id) => servicios.find((s) => s.id === id)?.nombre || '-';

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-gray-500 text-sm">Bienvenido al panel de control · {format(new Date(), 'EEEE dd MMMM yyyy')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Citas Hoy', value: stats.hoy, color: 'text-gold', icon: '📅' },
          { label: 'Total Reservas', value: stats.reservas, color: 'text-blue-400', icon: '📋' },
          { label: 'Barberos Activos', value: stats.barberos, color: 'text-green-400', icon: '✂' },
          { label: 'Servicios Activos', value: stats.servicios, color: 'text-purple-400', icon: '💎' },
        ].map((s) => (
          <div key={s.label} className="bg-dark-2 border border-dark-4 p-5 hover:border-gold/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
              <span className={`font-heading text-3xl font-bold ${s.color}`}>{s.value}</span>
            </div>
            <p className="text-gray-500 text-xs tracking-wide uppercase">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-dark-2 border border-dark-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-4">
          <h3 className="font-heading text-lg font-semibold text-white">Citas de Hoy</h3>
          <Link to="/admin/reservas" className="text-gold text-xs hover:text-gold-light tracking-wide uppercase">Ver todas →</Link>
        </div>
        {reservasHoy.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No hay citas programadas para hoy.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-4">
                  {['Hora', 'Cliente', 'Servicio', 'Barbero', 'Estado'].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-gray-600 text-xs tracking-widest uppercase font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reservasHoy.map((r) => (
                  <tr key={r.id} className="border-b border-dark-4/50 hover:bg-dark-3 transition-colors">
                    <td className="px-6 py-4 font-medium text-gold">{r.hora_inicio}</td>
                    <td className="px-6 py-4 text-white">{r.cliente_nombre}</td>
                    <td className="px-6 py-4 text-gray-400">{getServiceName(r.servicio_id)}</td>
                    <td className="px-6 py-4 text-gray-400">{getBarberName(r.barbero_id)}</td>
                    <td className="px-6 py-4"><span className={statusBadge[r.estado] || 'badge-pending'}>{r.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mt-8">
        {[
          { label: 'Gestionar Trabajadores', to: '/admin/trabajadores', desc: 'Agregar o editar barberos', icon: '✂' },
          { label: 'Gestionar Servicios', to: '/admin/catalogo', desc: 'Precios y catálogo', icon: '💎' },
          { label: 'Ver Reservas', to: '/admin/reservas', desc: 'Agenda completa', icon: '📋' },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="bg-dark-2 border border-dark-4 hover:border-gold p-5 transition-all group">
            <span className="text-2xl mb-3 block">{item.icon}</span>
            <p className="text-white font-semibold text-sm group-hover:text-gold transition-colors">{item.label}</p>
            <p className="text-gray-500 text-xs mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
