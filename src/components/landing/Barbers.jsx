import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBarberosBySede, getSedes } from '../../services/db';

const avatarColors = ['#C9A84C', '#8B6914', '#D4AF37'];
const initials = (name) => name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

export default function Barbers() {
  const [sedes, setSedes] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [selectedSede, setSelectedSede] = useState(null);

  useEffect(() => {
    getSedes(true).then((s) => {
      setSedes(s);
      if (s.length > 0) {
        setSelectedSede(s[0].id);
        getBarberosBySede(s[0].id, true).then(setBarberos);
      }
    });
  }, []);

  const handleSedeChange = (sedeId) => {
    setSelectedSede(sedeId);
    getBarberosBySede(sedeId, true).then(setBarberos);
  };

  return (
    <section id="barberos" className="py-24 bg-dark-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <span className="section-subtitle">Maestros del oficio</span>
          <h2 className="section-title">Nuestro Equipo</h2>
          <div className="section-divider mx-auto" />
          <p className="text-gray-500 max-w-xl mx-auto mt-6 text-sm leading-relaxed">
            Profesionales apasionados por el detalle, cada uno con su propio sello artístico y años de formación especializada.
          </p>
        </div>

        {/* Sede selector con foto */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-dark-4 mb-20">
          {sedes.map((sede) => (
            <button
              key={sede.id}
              onClick={() => handleSedeChange(sede.id)}
              className="group relative overflow-hidden text-left focus:outline-none"
            >
              {/* Foto */}
              <div className="relative w-full" style={{ aspectRatio: '4 / 3' }}>
                {sede.foto ? (
                  <img
                    src={sede.foto}
                    alt={sede.nombre}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-dark-3">
                    <span
                      className="font-heading font-bold text-dark-4"
                      style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
                    >
                      {sede.nombre.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {/* Overlay oscuro siempre presente, más intenso al seleccionar */}
                <div
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    selectedSede === sede.id
                      ? 'bg-dark/60 opacity-100'
                      : 'bg-dark/30 opacity-100 group-hover:bg-dark/50'
                  }`}
                />
                {/* Línea dorada inferior al seleccionar */}
                <div
                  className={`absolute bottom-0 left-0 h-0.5 bg-gold transition-all duration-500 ${
                    selectedSede === sede.id ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </div>
              {/* Nombre */}
              <div
                className={`px-5 py-4 transition-colors duration-300 ${
                  selectedSede === sede.id ? 'bg-gold' : 'bg-dark-2 group-hover:bg-dark-3'
                }`}
              >
                <p
                  className={`font-heading text-sm font-bold uppercase tracking-widest ${
                    selectedSede === sede.id ? 'text-dark' : 'text-gray-300'
                  }`}
                >
                  {sede.nombre}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Barbers zigzag layout */}
        <div>
          {barberos.length === 0 ? (
            <p className="text-center text-gray-500 py-16">
              No hay barberos disponibles en esta sede.
            </p>
          ) : (
            barberos.map((barbero, idx) => (
              <div
                key={barbero.id}
                className={`flex flex-col ${
                  idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } items-stretch border-b border-dark-4 last:border-0`}
              >
                {/* Photo side */}
                <div
                  className="relative group w-full md:w-5/12 overflow-hidden"
                  style={{ aspectRatio: '3 / 4' }}
                >
                  {barbero.foto ? (
                    <>
                      <img
                        src={barbero.foto}
                        alt={barbero.nombre}
                        className="absolute inset-0 w-full h-full object-cover object-top"
                      />
                      {barbero.foto_hover && (
                        <img
                          src={barbero.foto_hover}
                          alt={barbero.nombre}
                          className="absolute inset-0 w-full h-full object-cover object-top opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                      )}
                    </>
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center font-heading font-bold text-dark-2"
                      style={{
                        backgroundColor: avatarColors[idx % avatarColors.length],
                        fontSize: 'clamp(3rem, 8vw, 6rem)',
                      }}
                    >
                      {initials(barbero.nombre)}
                      <div className="absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-dark-2/30" />
                      <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-dark-2/30" />
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-dark/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-5">
                    <p className="font-heading text-2xl font-bold text-white tracking-wide text-center px-4">
                      {barbero.nombre}
                    </p>
                    <p className="text-gold text-xs tracking-widest uppercase">{barbero.especialidad}</p>
                    <Link to="/reservar" className="btn-gold text-xs px-10 mt-2">
                      Reservar Cita
                    </Link>
                  </div>
                </div>

                {/* Text side */}
                <div className="w-full md:w-7/12 flex items-center px-6 py-12 md:px-12 md:py-16">
                  <div className="max-w-lg">
                    <h3 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2 uppercase tracking-wider">
                      {barbero.nombre}
                    </h3>
                    <p className="text-gold text-xs tracking-widest uppercase mb-6">
                      {barbero.especialidad}
                    </p>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-px bg-gold" />
                      <div className="w-8 h-px bg-dark-4" />
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                      {barbero.descripcion}
                    </p>
                    <p className="text-gray-600 text-xs tracking-wider mb-8">
                      Horario: {barbero.horario_inicio} – {barbero.horario_fin}
                    </p>
                    <Link to="/reservar" className="btn-outline-gold text-xs">
                      Reservar Cita
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-20">
          <Link to="/reservar" className="btn-outline-gold text-sm">
            Reserva Tu Cita Ahora
          </Link>
        </div>
      </div>
    </section>
  );
}
