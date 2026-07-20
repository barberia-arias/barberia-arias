import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getBarberoByUserId, getServiciosByBarbero, getSedes,
  createServicioRealizado, getServiciosRealizadosByBarbero,
  saveCliente,
} from '../../services/db';
import { printRecibo } from '../../utils/recibo';
import { format } from 'date-fns';

const formatPrice = (p) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 2 }).format(p);

const MEDIOS_PAGO = ['EFECTIVO', 'YAPE', 'PLIN'];
const emptyForm = {
  cliente_nombre: '', cliente_apellidos: '', cliente_dni: '', cliente_fecha_nacimiento: '', cliente_telefono: '',
  servicio_id: '', producto_vendido: '', precio_producto: '', propina: '',
};
const emptyPagos = { EFECTIVO: '', YAPE: '', PLIN: '' };
const emptyMediosActivos = { EFECTIVO: false, YAPE: false, PLIN: false };

export default function BarberRegistrarServicio() {
  const { user } = useAuth();
  const [barbero, setBarbero] = useState(null);
  const [sede, setSede] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [pagos, setPagos] = useState(emptyPagos);
  const [mediosActivos, setMediosActivos] = useState(emptyMediosActivos);
  const [error, setError] = useState('');
  const [ultimoRegistro, setUltimoRegistro] = useState(null);
  const [verTodos, setVerTodos] = useState(false);
  const [saving, setSaving] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  const refresh = async (b) => {
    const r = await getServiciosRealizadosByBarbero((b || barbero).id);
    setRegistros(r);
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      const b = await getBarberoByUserId(user.id);
      setBarbero(b);
      if (!b) return;
      const [svs, sedes] = await Promise.all([getServiciosByBarbero(b.id), getSedes()]);
      setServicios(svs);
      setSede(sedes.find((s) => s.id === b.sede_id) || null);
      await refresh(b);
    })();
  }, [user]);

  const selectedService = servicios.find((s) => s.id === form.servicio_id);
  const total = Number(selectedService?.precio || 0) + (form.producto_vendido && form.precio_producto ? Number(form.precio_producto) : 0);
  const propina = form.propina ? Number(form.propina) : 0;
  const totalCobrar = total + propina;

  const pagosActivos = MEDIOS_PAGO.filter((m) => mediosActivos[m]);
  const totalPagado = pagosActivos.reduce((s, m) => s + Number(pagos[m] || 0), 0);
  const diferencia = Number((totalCobrar - totalPagado).toFixed(2));

  const toggleMedio = (medio) => {
    if (mediosActivos[medio]) {
      setMediosActivos((a) => ({ ...a, [medio]: false }));
      setPagos((p) => ({ ...p, [medio]: '' }));
      return;
    }
    setMediosActivos((a) => ({ ...a, [medio]: true }));
    // al activar, sugiere el monto que falta por cubrir
    setPagos((p) => {
      const restante = Math.max(0, totalCobrar - MEDIOS_PAGO.filter((m) => m !== medio && mediosActivos[m]).reduce((s, m) => s + Number(p[m] || 0), 0));
      return { ...p, [medio]: restante > 0 ? String(restante) : '' };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.cliente_nombre.trim()) { setError('Ingresa el nombre del cliente.'); return; }
    if (!form.servicio_id) { setError('Selecciona el servicio realizado.'); return; }
    if (pagosActivos.length === 0) { setError('Selecciona al menos un medio de pago.'); return; }
    if (pagosActivos.some((m) => !Number(pagos[m]) || Number(pagos[m]) <= 0)) { setError('Ingresa un monto válido para cada medio de pago.'); return; }
    if (Math.abs(diferencia) > 0.01) {
      setError(`Los montos de pago (${formatPrice(totalPagado)}) no coinciden con el total a cobrar (${formatPrice(totalCobrar)}).`);
      return;
    }
    setSaving(true);
    const ahora = new Date();
    const pagosList = pagosActivos.map((m) => ({ medio: m, monto: Number(pagos[m]) }));
    const data = {
      barbero_id: barbero.id, barbero_nombre: barbero.nombre,
      sede_id: barbero.sede_id, sede_nombre: sede?.nombre || '', sede_direccion: sede?.direccion || '',
      cliente_nombre: `${form.cliente_nombre.trim()} ${form.cliente_apellidos.trim()}`.trim(),
      servicio_id: form.servicio_id, servicio_nombre: selectedService.nombre, servicio_precio: selectedService.precio,
      producto_vendido: form.producto_vendido.trim(),
      precio_producto: form.producto_vendido.trim() && form.precio_producto ? Number(form.precio_producto) : 0,
      propina,
      medio_pago: pagosList.map((p) => p.medio).join(' + '),
      pagos: pagosList,
      total,
      fecha: format(ahora, 'yyyy-MM-dd'), hora: format(ahora, 'HH:mm'),
    };
    try {
      const nuevo = await createServicioRealizado(data);
      // Registro en la base de clientes del administrador (no bloquea si falla)
      try {
        await saveCliente({
          nombres: form.cliente_nombre,
          apellidos: form.cliente_apellidos,
          dni: form.cliente_dni,
          fecha_nacimiento: form.cliente_fecha_nacimiento,
          telefono: form.cliente_telefono,
        });
      } catch { /* silencioso */ }
      setUltimoRegistro(nuevo);
      setForm(emptyForm);
      setPagos(emptyPagos);
      setMediosActivos(emptyMediosActivos);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const registrosHoy = registros.filter((r) => r.fecha === today);
  const listaVisible = verTodos ? registros : registrosHoy;

  const describirPago = (r) =>
    Array.isArray(r.pagos) && r.pagos.length > 0
      ? r.pagos.map((p) => `${p.medio} ${formatPrice(p.monto)}`).join(' · ')
      : (r.medio_pago || 'EFECTIVO');

  if (!barbero) {
    return (
      <div className="bg-dark-2 border border-dark-4 p-8 text-center text-gray-500">
        Tu perfil de barbero no está configurado. Contacta al administrador.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-white mb-1">Registrar Servicio</h1>
        <p className="text-gray-500 text-sm">{barbero.nombre} · Sede {sede?.nombre || '—'} · {format(new Date(), 'dd/MM/yyyy')}</p>
      </div>

      {ultimoRegistro && (
        <div className="bg-green-900/20 border border-green-700/50 px-5 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-green-400 font-medium text-sm">✓ Servicio registrado · <span className="font-bold">{ultimoRegistro.numero_recibo}</span></p>
            <p className="text-green-600 text-xs mt-0.5">{ultimoRegistro.cliente_nombre} · {ultimoRegistro.servicio_nombre} · {formatPrice(ultimoRegistro.total)}</p>
          </div>
          <button onClick={() => printRecibo(ultimoRegistro)} className="btn-gold text-xs px-6">Imprimir Recibo</button>
        </div>
      )}

      <div className="bg-dark-2 border border-dark-4 p-6 sm:p-8">
        <h2 className="font-heading text-lg text-white mb-6">Nuevo servicio</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="label-dark">Nombres del cliente *</label>
              <input type="text" value={form.cliente_nombre} onChange={(e) => setForm((f) => ({ ...f, cliente_nombre: e.target.value }))} className="input-dark" placeholder="Nombres" />
            </div>
            <div>
              <label className="label-dark">Apellidos (opcional)</label>
              <input type="text" value={form.cliente_apellidos} onChange={(e) => setForm((f) => ({ ...f, cliente_apellidos: e.target.value }))} className="input-dark" placeholder="Apellidos" />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            <div>
              <label className="label-dark">DNI (opcional)</label>
              <input type="text" maxLength={8} value={form.cliente_dni} onChange={(e) => setForm((f) => ({ ...f, cliente_dni: e.target.value.replace(/\D/g, '') }))} className="input-dark" placeholder="12345678" />
            </div>
            <div>
              <label className="label-dark">F. nacimiento (opcional)</label>
              <input type="date" max={today} value={form.cliente_fecha_nacimiento} onChange={(e) => setForm((f) => ({ ...f, cliente_fecha_nacimiento: e.target.value }))} className="input-dark" />
            </div>
            <div>
              <label className="label-dark">Teléfono (opcional)</label>
              <input type="tel" value={form.cliente_telefono} onChange={(e) => setForm((f) => ({ ...f, cliente_telefono: e.target.value }))} className="input-dark" placeholder="900 000 000" />
            </div>
          </div>

          <div>
            <label className="label-dark">Servicio realizado *</label>
            <select value={form.servicio_id} onChange={(e) => setForm((f) => ({ ...f, servicio_id: e.target.value }))} className="input-dark">
              <option value="">— Selecciona un servicio —</option>
              {servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre} · S/ {s.precio.toFixed(2)}</option>)}
            </select>
          </div>

          {form.servicio_id && (
            <div className="bg-dark-3 border border-dark-4 px-4 py-3 flex justify-between items-center text-sm">
              <span className="text-gray-400">Precio del servicio</span>
              <span className="text-gold font-heading font-bold">{formatPrice(selectedService?.precio || 0)}</span>
            </div>
          )}

          <div>
            <label className="label-dark">Producto vendido (opcional)</label>
            <input type="text" value={form.producto_vendido} onChange={(e) => setForm((f) => ({ ...f, producto_vendido: e.target.value }))} className="input-dark" placeholder="Ej: Shampoo para barba, pomada para cabello..." />
          </div>

          {form.producto_vendido && (
            <div>
              <label className="label-dark">Precio del producto (S/)</label>
              <input type="number" min="0" step="0.50" value={form.precio_producto} onChange={(e) => setForm((f) => ({ ...f, precio_producto: e.target.value }))} className="input-dark" placeholder="0.00" />
            </div>
          )}

          <div>
            <label className="label-dark">Propina (opcional, S/)</label>
            <input type="number" min="0" step="0.50" value={form.propina} onChange={(e) => setForm((f) => ({ ...f, propina: e.target.value }))} className="input-dark" placeholder="0.00" />
            <p className="text-gray-600 text-xs mt-1">Propina que el cliente deja al barbero. Se incluye en el recibo.</p>
          </div>

          <div>
            <label className="label-dark mb-1 block">Medios de pago *</label>
            <p className="text-gray-600 text-xs mb-3">Puedes combinar varios medios. Ej: Yape S/ 20 + Efectivo S/ 10.</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {MEDIOS_PAGO.map((medio) => {
                const activo = mediosActivos[medio];
                return (
                  <div key={medio} className={`border-2 transition-all duration-200 ${activo ? 'border-gold bg-gold/5' : 'border-dark-4'}`}>
                    <button type="button" onClick={() => toggleMedio(medio)}
                      className={`w-full py-3 text-sm font-bold tracking-widest transition-all duration-200 ${activo ? 'text-gold' : 'text-gray-400 hover:text-gray-200'}`}>
                      {activo ? '✓ ' : ''}{medio}
                    </button>
                    {activo && (
                      <div className="px-3 pb-3">
                        <input
                          type="number" min="0" step="0.50" value={pagos[medio]}
                          onChange={(e) => setPagos((p) => ({ ...p, [medio]: e.target.value }))}
                          className="input-dark text-sm" placeholder="Monto S/"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {form.servicio_id && (
            <div className="bg-dark-3 border border-gold/20 px-4 py-3 space-y-2">
              {propina > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Servicio{form.producto_vendido ? ' + producto' : ''}: {formatPrice(total)}</span>
                  <span className="text-gray-500">Propina: {formatPrice(propina)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold text-sm">Total a cobrar</span>
                <span className="text-gold font-heading font-bold text-xl">{formatPrice(totalCobrar)}</span>
              </div>
              {pagosActivos.length > 0 && (
                <div className="flex justify-between items-center text-xs border-t border-dark-4 pt-2">
                  <span className="text-gray-500">Suma de pagos: {formatPrice(totalPagado)}</span>
                  {Math.abs(diferencia) > 0.01 ? (
                    <span className="text-yellow-400">{diferencia > 0 ? `Falta ${formatPrice(diferencia)}` : `Sobra ${formatPrice(-diferencia)}`}</span>
                  ) : (
                    <span className="text-green-400">✓ Cuadra con el total</span>
                  )}
                </div>
              )}
            </div>
          )}

          {error && <div className="bg-red-900/20 border border-red-700/50 text-red-400 px-4 py-3 text-sm">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setForm(emptyForm); setPagos(emptyPagos); setMediosActivos(emptyMediosActivos); setError(''); setUltimoRegistro(null); }} className="btn-outline-gold text-xs px-8">Limpiar</button>
            <button type="submit" disabled={saving} className={`btn-gold text-xs flex-1 ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}>
              {saving ? 'Registrando...' : 'Registrar y Generar Recibo'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-dark-2 border border-dark-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-4">
          <div>
            <h3 className="font-heading text-lg font-semibold text-white">{verTodos ? 'Todos mis servicios' : 'Servicios de hoy'}</h3>
            <p className="text-gray-600 text-xs mt-0.5">{verTodos ? `${registros.length} registros totales` : `${registrosHoy.length} atenciones hoy`} · Solo el administrador puede editar o eliminar registros</p>
          </div>
          <button onClick={() => setVerTodos(!verTodos)} className="text-gold text-xs uppercase tracking-wide hover:text-gold-light transition-colors">
            {verTodos ? 'Ver solo hoy' : 'Ver todos'}
          </button>
        </div>

        {listaVisible.length === 0 ? (
          <div className="p-10 text-center text-gray-500">{verTodos ? 'Aún no has registrado servicios.' : 'No has registrado servicios hoy.'}</div>
        ) : (
          <div className="divide-y divide-dark-4/50">
            {[...listaVisible].sort((a, b) => (a.fecha_creacion > b.fecha_creacion ? -1 : 1)).map((r) => (
              <div key={r.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-dark-3 transition-colors">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-gold font-heading font-bold text-sm">{r.hora}</span>
                    <span className="text-xs text-gold/60">{r.numero_recibo}</span>
                    {r.fecha !== today && <span className="text-gray-600 text-xs">{r.fecha}</span>}
                  </div>
                  <p className="text-white font-medium text-sm truncate">{r.cliente_nombre}</p>
                  <p className="text-gray-500 text-xs">{r.servicio_nombre}</p>
                  {r.producto_vendido && <p className="text-gray-600 text-xs mt-0.5">+ {r.producto_vendido}</p>}
                  <p className="text-gray-600 text-xs mt-0.5">{describirPago(r)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white font-heading font-bold">{formatPrice(r.total)}</p>
                  {Number(r.propina) > 0 && <p className="text-green-400 text-xs">+ propina {formatPrice(r.propina)}</p>}
                  <button onClick={() => printRecibo(r)} className="text-gold text-xs hover:text-gold-light transition-colors mt-1 uppercase tracking-wide">Recibo</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {listaVisible.length > 0 && (
          <div className="px-6 py-4 border-t border-dark-4 flex justify-between items-center">
            <span className="text-gray-500 text-xs">{verTodos ? 'Total general' : 'Total del día'}</span>
            <div className="text-right">
              <span className="text-gold font-heading font-bold">{formatPrice(listaVisible.reduce((s, r) => s + Number(r.total || 0), 0))}</span>
              {listaVisible.some((r) => Number(r.propina) > 0) && (
                <p className="text-green-400 text-xs mt-0.5">Propinas: {formatPrice(listaVisible.reduce((s, r) => s + Number(r.propina || 0), 0))}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
