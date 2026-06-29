import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getBarberoByUserId, getReservasByBarbero, getServicios,
  getReservasByBarberoFecha, updateBarbero, uploadBarberoFoto,
} from '../../services/db';
import { format } from 'date-fns';

const statusBadge = {
  pendiente: 'badge-pending',
  confirmada: 'badge-confirmed',
  cancelada: 'badge-cancelled',
  finalizada: 'badge-finished',
};

export default function BarberDashboard() {
  const { user } = useAuth();
  const [barbero, setBarbero] = useState(null);
  const [reservasHoy, setReservasHoy] = useState([]);
  const [stats, setStats] = useState({ hoy: 0, pendientes: 0, total: 0 });
  const [servicios, setServicios] = useState([]);
  const [uploading, setUploading] = useState(null);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const b = await getBarberoByUserId(user.id);
      setBarbero(b);
      if (!b) return;
      const [todayR, allR, svs] = await Promise.all([
        getReservasByBarberoFecha(b.id, today),
        getReservasByBarbero(b.id),
        getServicios(),
      ]);
      setReservasHoy(todayR.sort((a, b2) => a.hora_inicio > b2.hora_inicio ? 1 : -1));
      setServicios(svs);
      setStats({
        hoy: todayR.filter((r) => r.estado !== 'cancelada').length,
        total: allR.filter((r) => r.estado !== 'cancelada').length,
        pendientes: allR.filter((r) => r.estado === 'pendiente').length,
      });
    })();
  }, [user]);

  const getServiceName = (id) => servicios.find((s) => s.id === id)?.nombre || '-';

  const handleFotoUpload = async (field, file) => {
    if (!file || !barbero) return;
    setUploading(field);
    try {
      const url = await uploadBarberoFoto(barbero.id, field, file);
      setBarbero((prev) => ({ ...prev, [field]: url }));
    } catch (err) {
      alert('Error al subir foto: ' + err.message);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-white mb-1">
          Hola, {user?.nombre?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm">
          {barbero ? barbero.especialidad : 'Barbero'} · {format(new Date(), 'EEEE dd MMMM yyyy')}
        </p>
      </div>

      {!barbero ? (
        <div className="bg-dark-2 border border-dark-4 p-8 text-center text-gray-500">
          Tu perfil de barbero aún no está configurado. Contacta al administrador.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { label: 'Citas Hoy', value: stats.hoy, color: 'text-gold' },
              { label: 'Pendientes', value: stats.pendientes, color: 'text-yellow-400' },
              { label: 'Total Citas', value: stats.total, color: 'text-blue-400' },
            ].map((s) => (
              <div key={s.label} className="bg-dark-2 border border-dark-4 p-5 text-center">
                <div className={`font-heading text-3xl font-bold ${s.color} mb-2`}>{s.value}</div>
                <p className="text-gray-500 text-xs tracking-wide uppercase">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-dark-2 border border-dark-4 p-6">
              <h3 className="font-heading text-base font-semibold text-white mb-4">Mi Horario</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Entrada</span>
                  <span className="text-white font-medium">{barbero.horario_inicio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Salida</span>
                  <span className="text-white font-medium">{barbero.horario_fin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Estado</span>
                  <span className={barbero.estado ? 'badge-confirmed' : 'badge-cancelled'}>
                    {barbero.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-dark-2 border border-dark-4 p-6 lg:col-span-2">
              <h3 className="font-heading text-base font-semibold text-white mb-1">Mis Fotos de Perfil</h3>
              <p className="text-gray-600 text-xs mb-5">Estas fotos aparecen en la página principal de la barbería.</p>
              <div className="grid sm:grid-cols-2 gap-5">
                {[
                  { field: 'foto', label: 'Foto Principal', hint: 'Se muestra en la landing' },
                  { field: 'foto_hover', label: 'Foto Hover', hint: 'Aparece al pasar el mouse' },
                ].map(({ field, label, hint }) => (
                  <div key={field}>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">{label}</p>
                    <p className="text-gray-600 text-xs mb-3">{hint}</p>
                    <div className="relative w-full overflow-hidden bg-dark-3 border border-dark-4 mb-3" style={{ aspectRatio: '3 / 4' }}>
                      {barbero[field] ? (
                        <img src={barbero[field]} alt={label} className="absolute inset-0 w-full h-full object-cover object-top" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-gray-600 text-xs text-center px-4">Sin foto</p>
                        </div>
                      )}
                      {uploading === field && (
                        <div className="absolute inset-0 bg-dark/70 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <label className={`btn-outline-gold text-xs cursor-pointer block text-center ${uploading === field ? 'opacity-50 pointer-events-none' : ''}`}>
                      {barbero[field] ? 'Cambiar foto' : 'Subir foto'}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFotoUpload(field, e.target.files[0])} />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-dark-2 border border-dark-4">
            <div className="px-6 py-4 border-b border-dark-4">
              <h3 className="font-heading text-lg font-semibold text-white">Mis Citas de Hoy</h3>
            </div>
            {reservasHoy.length === 0 ? (
              <div className="p-10 text-center text-gray-500">No tienes citas programadas para hoy.</div>
            ) : (
              <div className="divide-y divide-dark-4/50">
                {reservasHoy.map((r) => (
                  <div key={r.id} className="px-6 py-4 flex items-center justify-between hover:bg-dark-3 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="font-heading text-gold font-bold text-lg w-16">{r.hora_inicio}</span>
                      <div>
                        <p className="text-white font-medium">{r.cliente_nombre}</p>
                        <p className="text-gray-500 text-sm">{getServiceName(r.servicio_id)}</p>
                        {r.cliente_telefono && <p className="text-gray-600 text-xs mt-1">📞 {r.cliente_telefono}</p>}
                      </div>
                    </div>
                    <span className={statusBadge[r.estado] || 'badge-pending'}>{r.estado}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
