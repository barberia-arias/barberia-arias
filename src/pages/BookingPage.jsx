import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import {
  getSedes,
  getBarberosBySede,
  getServiciosByBarbero,
  getHorasDisponibles,
  createReserva,
} from '../services/db';
import { format, addDays } from 'date-fns';

const STEPS = ['Sede', 'Barbero', 'Servicio', 'Fecha & Hora', 'Tus Datos', 'Confirmación'];
const avatarColors = ['#C9A84C', '#8B6914', '#D4AF37'];

export default function BookingPage() {
  const [step, setStep] = useState(0);
  const [sedes, setSedes] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [horasDisp, setHorasDisp] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reservaCreada, setReservaCreada] = useState(null);

  const [form, setForm] = useState({
    sede_id: '', barbero_id: '', servicio_id: '',
    fecha: '', hora_inicio: '',
    cliente_nombre: '', cliente_telefono: '', cliente_correo: '', notas: '',
  });

  useEffect(() => {
    getSedes(true).then(setSedes);
  }, []);

  useEffect(() => {
    if (form.sede_id) getBarberosBySede(form.sede_id, true).then(setBarberos);
  }, [form.sede_id]);

  useEffect(() => {
    if (form.barbero_id) getServiciosByBarbero(form.barbero_id).then(setServicios);
  }, [form.barbero_id]);

  useEffect(() => {
    if (form.barbero_id && form.fecha && form.servicio_id) {
      const servicio = servicios.find((s) => s.id === form.servicio_id);
      if (servicio) getHorasDisponibles(form.barbero_id, form.fecha, servicio.duracion_minutos).then(setHorasDisp);
    }
  }, [form.barbero_id, form.fecha, form.servicio_id, servicios]);

  const selectedSede = sedes.find((s) => s.id === form.sede_id);
  const selectedBarber = barberos.find((b) => b.id === form.barbero_id);
  const selectedService = servicios.find((s) => s.id === form.servicio_id);

  const minDate = format(new Date(), 'yyyy-MM-dd');
  const maxDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');

  const formatPrice = (p) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 2 }).format(p);

  const canNext = () => {
    if (step === 0) return !!form.sede_id;
    if (step === 1) return !!form.barbero_id;
    if (step === 2) return !!form.servicio_id;
    if (step === 3) return !!form.fecha && !!form.hora_inicio;
    if (step === 4) return form.cliente_nombre.trim().length > 2 && form.cliente_telefono.trim().length >= 7;
    return true;
  };

  const addMinutes = (time, mins) => {
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + mins;
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const hora_fin = addMinutes(form.hora_inicio, selectedService.duracion_minutos);
      const reserva = await createReserva({ ...form, hora_fin });
      setReservaCreada(reserva);
      setStep(5);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === 2) setForm((f) => ({ ...f, servicio_id: '', fecha: '', hora_inicio: '' }));
    if (step === 3) setForm((f) => ({ ...f, fecha: '', hora_inicio: '' }));
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <div className="pt-20 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          <div className="text-center mb-12">
            <span className="section-subtitle">Barbería ARIAS</span>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-3">Reserva tu Cita</h1>
            <div className="section-divider mx-auto" />
          </div>

          {step < 5 && (
            <div className="flex items-center justify-between mb-12 relative">
              <div className="absolute left-0 right-0 top-1/2 h-px bg-dark-4 -translate-y-1/2" />
              {STEPS.slice(0, 5).map((s, i) => (
                <div key={s} className="relative flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 z-10 ${i < step ? 'bg-gold border-gold text-dark' : i === step ? 'border-gold text-gold bg-dark' : 'border-dark-4 text-gray-600 bg-dark'}`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs tracking-wide hidden sm:block ${i === step ? 'text-gold' : 'text-gray-600'}`}>{s}</span>
                </div>
              ))}
            </div>
          )}

          {step === 0 && (
            <div>
              <h2 className="font-heading text-2xl text-white mb-2">¿En qué sede te atenderás?</h2>
              <p className="text-gray-500 text-sm mb-8">Selecciona la sucursal más cercana a ti.</p>
              <div className="grid gap-4">
                {sedes.map((sede) => (
                  <button
                    key={sede.id}
                    onClick={() => setForm((f) => ({ ...f, sede_id: sede.id, barbero_id: '', servicio_id: '', fecha: '', hora_inicio: '' }))}
                    className={`text-left p-6 border-2 transition-all duration-200 flex justify-between items-center ${form.sede_id === sede.id ? 'border-gold bg-gold/5' : 'border-dark-4 hover:border-gray-500'}`}
                  >
                    <div>
                      <p className="font-semibold text-white text-lg font-heading">{sede.nombre}</p>
                      <p className="text-gray-500 text-sm mt-1">{sede.direccion}</p>
                    </div>
                    {form.sede_id === sede.id && <span className="text-gold text-xs ml-4 flex-shrink-0">✓ Seleccionada</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="font-heading text-2xl text-white mb-2">¿Con qué barbero prefieres?</h2>
              <p className="text-gray-500 text-sm mb-8">Barberos disponibles en <span className="text-gold">{selectedSede?.nombre}</span>.</p>
              <div className="grid sm:grid-cols-2 gap-6">
                {barberos.map((b, idx) => (
                  <button
                    key={b.id}
                    onClick={() => setForm((f) => ({ ...f, barbero_id: b.id, servicio_id: '', fecha: '', hora_inicio: '' }))}
                    className={`text-center p-6 border-2 transition-all duration-200 ${form.barbero_id === b.id ? 'border-gold bg-gold/5' : 'border-dark-4 hover:border-gray-500'}`}
                  >
                    {b.foto ? (
                      <img src={b.foto} alt={b.nombre} className="w-20 h-20 mx-auto mb-4 object-cover object-top" />
                    ) : (
                      <div
                        className="w-20 h-20 mx-auto mb-4 flex items-center justify-center font-heading font-bold text-2xl text-dark"
                        style={{ backgroundColor: avatarColors[idx % 3] }}
                      >
                        {b.nombre.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <p className="font-semibold text-white">{b.nombre}</p>
                    <p className="text-gold text-xs tracking-widest uppercase mt-1">{b.especialidad}</p>
                    <p className="text-gray-600 text-xs mt-3">Horario: {b.horario_inicio} – {b.horario_fin}</p>
                    {form.barbero_id === b.id && <span className="block text-gold text-xs mt-2">✓ Seleccionado</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-heading text-2xl text-white mb-2">¿Qué servicio deseas?</h2>
              <p className="text-gray-500 text-sm mb-8">Servicios disponibles con <span className="text-gold">{selectedBarber?.nombre}</span>.</p>
              <div className="grid gap-4">
                {servicios.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setForm((f) => ({ ...f, servicio_id: s.id, hora_inicio: '' }))}
                    className={`text-left p-5 border-2 transition-all duration-200 flex justify-between items-center ${form.servicio_id === s.id ? 'border-gold bg-gold/5' : 'border-dark-4 hover:border-gray-500'}`}
                  >
                    <div>
                      <p className="font-semibold text-white">{s.nombre}</p>
                      <p className="text-gray-500 text-sm mt-1">{s.descripcion.slice(0, 70)}...</p>
                      <p className="text-gray-600 text-xs mt-2">{s.duracion_minutos} min</p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="font-heading text-gold font-bold text-lg">{formatPrice(s.precio)}</p>
                      {form.servicio_id === s.id && <span className="text-gold text-xs">✓ Seleccionado</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-heading text-2xl text-white mb-6">Elige fecha y hora</h2>
              <div className="mb-6">
                <label className="label-dark">Fecha de la cita</label>
                <input
                  type="date" min={minDate} max={maxDate} value={form.fecha}
                  onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value, hora_inicio: '' }))}
                  className="input-dark"
                />
              </div>
              {form.fecha && (
                <div>
                  <label className="label-dark mb-3 block">Horas disponibles</label>
                  {horasDisp.length === 0 ? (
                    <div className="border border-dark-4 p-8 text-center">
                      <p className="text-gray-500">No hay horarios disponibles para esta fecha.</p>
                      <p className="text-gray-600 text-sm mt-2">Prueba con otra fecha.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {horasDisp.map((hora) => (
                        <button
                          key={hora}
                          onClick={() => setForm((f) => ({ ...f, hora_inicio: hora }))}
                          className={`py-3 text-sm font-medium border-2 transition-all duration-200 ${form.hora_inicio === hora ? 'bg-gold text-dark border-gold' : 'border-dark-4 text-gray-300 hover:border-gold/50'}`}
                        >
                          {hora}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="font-heading text-2xl text-white mb-6">Tus datos de contacto</h2>
              <div className="space-y-5">
                <div>
                  <label className="label-dark">Nombre completo *</label>
                  <input type="text" placeholder="Tu nombre" value={form.cliente_nombre} onChange={(e) => setForm((f) => ({ ...f, cliente_nombre: e.target.value }))} className="input-dark" />
                </div>
                <div>
                  <label className="label-dark">Teléfono / WhatsApp *</label>
                  <input type="tel" placeholder="+51 900 000 000" value={form.cliente_telefono} onChange={(e) => setForm((f) => ({ ...f, cliente_telefono: e.target.value }))} className="input-dark" />
                </div>
                <div>
                  <label className="label-dark">Correo electrónico (opcional)</label>
                  <input type="email" placeholder="tu@correo.com" value={form.cliente_correo} onChange={(e) => setForm((f) => ({ ...f, cliente_correo: e.target.value }))} className="input-dark" />
                </div>
                <div>
                  <label className="label-dark">Notas adicionales (opcional)</label>
                  <textarea rows={3} placeholder="¿Algo especial que debamos saber?" value={form.notas} onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))} className="input-dark resize-none" />
                </div>
                <div className="border border-dark-4 p-5 bg-dark-3">
                  <h4 className="text-white font-semibold text-sm mb-4 tracking-wide">Resumen de tu reserva</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Sede', value: selectedSede?.nombre },
                      { label: 'Barbero', value: selectedBarber?.nombre },
                      { label: 'Servicio', value: selectedService?.nombre },
                      { label: 'Fecha', value: form.fecha },
                      { label: 'Hora', value: form.hora_inicio },
                      { label: 'Precio', value: selectedService ? formatPrice(selectedService.precio) : '' },
                    ].map((r) => (
                      <div key={r.label} className="flex justify-between text-sm">
                        <span className="text-gray-500">{r.label}</span>
                        <span className="text-white font-medium">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && reservaCreada && (
            <div className="text-center py-8">
              <div className="w-20 h-20 border-2 border-gold flex items-center justify-center mx-auto mb-6 text-3xl">✓</div>
              <h2 className="font-heading text-3xl font-bold text-white mb-3">¡Reserva Confirmada!</h2>
              <p className="text-gray-400 mb-8">Hemos registrado tu cita exitosamente. Nos vemos pronto.</p>
              <div className="border border-gold/30 bg-gold/5 p-6 max-w-md mx-auto mb-8">
                <div className="space-y-3">
                  {[
                    { label: 'Código', value: `#${reservaCreada.id.slice(-6).toUpperCase()}` },
                    { label: 'Sede', value: selectedSede?.nombre },
                    { label: 'Barbero', value: selectedBarber?.nombre },
                    { label: 'Servicio', value: selectedService?.nombre },
                    { label: 'Fecha', value: reservaCreada.fecha },
                    { label: 'Hora', value: reservaCreada.hora_inicio },
                    { label: 'Estado', value: 'Pendiente de confirmación' },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between text-sm">
                      <span className="text-gray-500">{r.label}</span>
                      <span className="text-white font-medium">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-8">Recuerda llegar 5 minutos antes de tu cita. Si necesitas cancelar, contáctanos con al menos 2 horas de anticipación.</p>
              <Link to="/" className="btn-gold text-sm">Volver al Inicio</Link>
            </div>
          )}

          {step < 5 && (
            <div className="flex justify-between items-center mt-10 pt-6 border-t border-dark-4">
              <button onClick={step === 0 ? undefined : goBack} className={`btn-outline-gold text-xs px-8 ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`}>
                ← Anterior
              </button>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              {step < 4 ? (
                <button onClick={() => setStep(step + 1)} disabled={!canNext()} className={`btn-gold text-xs px-8 ${!canNext() ? 'opacity-40 cursor-not-allowed' : ''}`}>
                  Siguiente →
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={!canNext() || loading} className={`btn-gold text-xs px-8 ${!canNext() || loading ? 'opacity-40 cursor-not-allowed' : ''}`}>
                  {loading ? 'Procesando...' : 'Confirmar Reserva'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
