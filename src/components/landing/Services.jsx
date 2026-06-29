import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getServicios } from '../../services/db';

const icons = ['✂', '✂', '⚡', '🪒', '🪒', '💆'];

export default function Services() {
  const [servicios, setServicios] = useState([]);

  useEffect(() => {
    getServicios(true).then(setServicios);
  }, []);

  const formatPrice = (p) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p);

  return (
    <section id="servicios" className="py-24 bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-16">
          <span className="section-subtitle">Lo que ofrecemos</span>
          <h2 className="section-title">Nuestros Servicios</h2>
          <div className="section-divider mx-auto" />
          <p className="text-gray-500 max-w-xl mx-auto mt-6 text-sm leading-relaxed">
            Cada servicio es ejecutado con técnica profesional, productos premium y la atención al detalle que solo Barbería ARIAS puede ofrecer.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicios.map((servicio, idx) => (
            <div key={servicio.id} className="card-dark group relative overflow-hidden p-8">
              {/* Number decoration */}
              <span className="absolute top-4 right-6 font-heading text-6xl font-bold text-white/[0.03] select-none group-hover:text-gold/5 transition-colors">
                {String(idx + 1).padStart(2, '0')}
              </span>

              {/* Icon */}
              <div className="w-14 h-14 border border-dark-4 group-hover:border-gold flex items-center justify-center text-2xl mb-6 transition-all duration-300">
                {icons[idx % icons.length]}
              </div>

              <h3 className="font-heading text-xl font-semibold text-white mb-3 group-hover:text-gold transition-colors duration-300">
                {servicio.nombre}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                {servicio.descripcion}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-dark-4">
                <div>
                  <span className="text-gold font-bold text-lg font-heading">{formatPrice(servicio.precio)}</span>
                </div>
                <span className="text-gray-600 text-xs">{servicio.duracion_minutos} min</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/reservar" className="btn-gold text-sm">Reservar Ahora</Link>
        </div>
      </div>
    </section>
  );
}
