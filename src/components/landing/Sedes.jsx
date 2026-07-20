import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSedes } from '../../services/db';

export default function Sedes() {
  const [sedes, setSedes] = useState([]);

  useEffect(() => {
    setSedes(getSedes(true));
  }, []);

  if (sedes.length === 0) return null;

  return (
    <section id="sedes" className="py-24 bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <span className="section-subtitle">Dónde encontrarnos</span>
          <h2 className="section-title">Nuestras Sedes</h2>
          <div className="section-divider mx-auto" />
          <p className="text-gray-500 max-w-xl mx-auto mt-6 text-sm leading-relaxed">
            Tres locales estratégicamente ubicados para estar siempre cerca de ti.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-dark-4">
          {sedes.map((sede, idx) => (
            <div
              key={sede.id}
              className="group bg-dark-2 hover:bg-dark-3 transition-colors duration-300 flex flex-col"
            >
              {/* Foto */}
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4 / 3' }}>
                {sede.foto ? (
                  <img
                    src={sede.foto}
                    alt={sede.nombre}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-3 gap-3">
                    <span
                      className="font-heading font-bold text-dark-4"
                      style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}
                    >
                      {sede.nombre.charAt(0).toUpperCase()}
                    </span>
                    <div className="w-8 h-px bg-dark-4" />
                    <span className="text-dark-4 text-xs tracking-widest uppercase">Sede {idx + 1}</span>
                  </div>
                )}
                {/* Gold corner accent */}
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold group-hover:w-full transition-all duration-500" />
              </div>

              {/* Info */}
              <div className="p-6 flex flex-col flex-1">
                <p className="text-gold text-xs tracking-widest uppercase mb-2">Sede {idx + 1}</p>
                <h3 className="font-heading text-3xl font-bold text-white uppercase tracking-wider mb-3">
                  {sede.nombre}
                </h3>
                <div className="flex items-start gap-3 mb-auto">
                  <span className="text-gold mt-0.5 flex-shrink-0">📍</span>
                  <p className="text-gray-500 text-sm leading-relaxed">{sede.direccion}</p>
                </div>
                <div className="mt-6 pt-5 border-t border-dark-4">
                  <Link
                    to="/reservar"
                    className="text-gold text-xs tracking-widest uppercase hover:text-white transition-colors duration-300"
                  >
                    Reservar en esta sede →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
