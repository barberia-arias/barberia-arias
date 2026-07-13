import { useState, useEffect } from 'react';
import { getClientes } from '../../services/db';

export default function AdminClientes() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setClientes(await getClientes());
      } catch (err) {
        setError('No se pudo cargar la lista de clientes: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const q = busqueda.trim().toLowerCase();
  const filtered = clientes
    .filter((c) =>
      !q ||
      `${c.nombres} ${c.apellidos}`.toLowerCase().includes(q) ||
      (c.dni || '').includes(q) ||
      (c.telefono || '').includes(q)
    )
    .sort((a, b) => (a.fecha_creacion > b.fecha_creacion ? -1 : 1));

  const formatFecha = (f) => {
    if (!f) return '—';
    const [y, m, d] = f.split('T')[0].split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-white mb-1">Clientes</h1>
        <p className="text-gray-500 text-sm">
          Base de datos de clientes registrados en reservas y atenciones · {clientes.length} total
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-dark w-full sm:w-80 text-sm"
          placeholder="Buscar por nombre, DNI o teléfono..."
        />
        {busqueda && (
          <button onClick={() => setBusqueda('')} className="text-xs text-gray-500 hover:text-gold transition-colors px-3 py-2 border border-dark-4">
            Limpiar
          </button>
        )}
      </div>

      {error && <div className="bg-red-900/20 border border-red-700/50 text-red-400 px-4 py-3 text-sm mb-6">{error}</div>}

      <div className="bg-dark-2 border border-dark-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-4">
                {['Nombres', 'Apellidos', 'DNI', 'F. Nacimiento', 'Teléfono', 'Registrado'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-gray-600 text-xs tracking-widest uppercase font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-dark-4/50 hover:bg-dark-3 transition-colors">
                  <td className="px-5 py-3 text-white font-medium">{c.nombres}</td>
                  <td className="px-5 py-3 text-gray-400">{c.apellidos || '—'}</td>
                  <td className="px-5 py-3 text-gray-400">{c.dni || '—'}</td>
                  <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{formatFecha(c.fecha_nacimiento)}</td>
                  <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{c.telefono || '—'}</td>
                  <td className="px-5 py-3 text-gray-600 text-xs whitespace-nowrap">{formatFecha(c.fecha_creacion)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              {clientes.length === 0 ? 'Aún no hay clientes registrados. Se agregan automáticamente al crear reservas o registrar servicios.' : 'No hay clientes que coincidan con la búsqueda.'}
            </div>
          )}
          {loading && <div className="p-12 text-center text-gray-500">Cargando clientes...</div>}
        </div>
      </div>
    </div>
  );
}
