import { useState, useEffect } from 'react';
import { getServiciosRealizados, getBarberos, getSedes } from '../../services/db';
import { printRecibo } from '../../utils/recibo';

const formatPrice = (p) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 2 }).format(p);

export default function AdminServiciosRealizados() {
  const [registros, setRegistros] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [filterBarbero, setFilterBarbero] = useState('todos');
  const [filterSede, setFilterSede] = useState('todos');
  const [filterFecha, setFilterFecha] = useState('');

  useEffect(() => {
    (async () => {
      const [r, b, s] = await Promise.all([getServiciosRealizados(), getBarberos(), getSedes()]);
      setRegistros(r);
      setBarberos(b);
      setSedes(s);
    })();
  }, []);

  const filtered = registros
    .filter((r) => filterBarbero === 'todos' || r.barbero_id === filterBarbero)
    .filter((r) => filterSede === 'todos' || r.sede_id === filterSede)
    .filter((r) => !filterFecha || r.fecha === filterFecha)
    .sort((a, b) => (a.fecha_creacion > b.fecha_creacion ? -1 : 1));

  const totalFiltrado = filtered.reduce((sum, r) => sum + Number(r.total || 0), 0);
  const hasFilters = filterBarbero !== 'todos' || filterSede !== 'todos' || filterFecha;

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
          {['EFECTIVO', 'YAPE', 'PLIN'].map((medio) => {
            const items = filtered.filter((r) => (r.medio_pago || 'EFECTIVO') === medio);
            return (
              <div key={medio} className="bg-dark-2 border border-dark-4 p-4 text-center">
                <div className={`font-heading text-xl font-bold ${medio === 'YAPE' ? 'text-purple-400' : medio === 'PLIN' ? 'text-green-400' : 'text-white'}`}>
                  {formatPrice(items.reduce((s, r) => s + Number(r.total || 0), 0))}
                </div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mt-1">{medio} ({items.length})</p>
              </div>
            );
          })}
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
                    <span className={`text-xs font-bold tracking-wide px-2 py-1 border ${r.medio_pago === 'YAPE' ? 'border-purple-500/50 text-purple-400' : r.medio_pago === 'PLIN' ? 'border-green-500/50 text-green-400' : 'border-dark-4 text-gray-400'}`}>
                      {r.medio_pago || 'EFECTIVO'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{formatPrice(r.total)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => printRecibo(r)} className="text-gold hover:text-gold-light text-xs font-medium uppercase tracking-wide transition-colors whitespace-nowrap">
                      Ver Recibo
                    </button>
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
    </div>
  );
}
