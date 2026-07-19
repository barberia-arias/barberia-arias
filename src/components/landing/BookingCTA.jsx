import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBarberos } from '../../services/db';

export default function BookingCTA() {
  const [numBarberos, setNumBarberos] = useState(null);

  useEffect(() => {
    getBarberos(true).then((b) => setNumBarberos(b.length)).catch(() => {});
  }, []);

  return (
    <section className="py-24 bg-dark-2 relative overflow-hidden">
      {/* Gold accent top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Text */}
          <div>
            <span className="section-subtitle">Agenda ahora</span>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              Tu próxima cita
              <br />
              <span className="text-gold">te está esperando</span>
            </h2>
            <p className="text-gray-400 text-base leading-relaxed mb-8">
              Reserva en menos de 2 minutos. Selecciona tu servicio, elige a tu barbero de confianza, escoge la fecha y la hora que mejor te convenga. Sin complicaciones.
            </p>

            <ul className="space-y-4 mb-10">
              {[
                'Elige el servicio que necesitas',
                'Selecciona a tu barbero preferido',
                'Escoge fecha y hora disponible',
                'Confirma tu reserva al instante',
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-4">
                  <span className="w-7 h-7 border border-gold text-gold text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-gray-400 text-sm">{step}</span>
                </li>
              ))}
            </ul>

            <Link to="/reservar" className="btn-gold text-sm inline-block">
              Reservar mi Cita Ahora
            </Link>
          </div>

          {/* Decorative card */}
          <div className="relative">
            <div className="border border-dark-4 p-8 bg-dark-3">
              <div className="text-center mb-8">
                <img src="/logo.png" alt="Barbershop ARIAS" className="h-16 w-auto object-contain mx-auto mb-4" />
                <p className="text-gold text-xs tracking-widest uppercase mt-1">Reserva Express</p>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Horario', value: 'Lun – Dom: 10:00 am – 9:00 pm' },
                  { label: 'Tiempo promedio', value: '30 – 60 minutos' },
                  { label: 'Barberos disponibles', value: numBarberos ? `${numBarberos} ${numBarberos === 1 ? 'profesional' : 'profesionales'}` : '—' },
                  { label: 'Reservas online', value: 'Disponible 24/7' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-3 border-b border-dark-4 last:border-0">
                    <span className="text-gray-500 text-sm">{item.label}</span>
                    <span className="text-white text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <Link to="/reservar" className="btn-gold text-xs w-full inline-block text-center py-4">
                  Reservar Ahora →
                </Link>
              </div>
            </div>

            {/* Decorative corner */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-gold/30" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    </section>
  );
}
