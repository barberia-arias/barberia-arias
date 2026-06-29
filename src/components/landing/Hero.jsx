import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #111111 100%)',
      }}
    >
      {/* Decorative background lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-gold/10 to-transparent" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-gold/10 to-transparent" />

        {/* Large decorative logo watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <img
            src="/logo_a.png"
            alt=""
            aria-hidden="true"
            className="w-[55vw] max-w-3xl object-contain"
            style={{ opacity: 0.04, filter: 'grayscale(1) brightness(0.5)' }}
          />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32">
        {/* Badge */}
        <div className="inline-flex items-center gap-3 border border-gold/40 px-5 py-2 mb-10">
          <span className="w-1 h-1 bg-gold rounded-full" />
          <span className="text-gold text-xs tracking-widest uppercase font-semibold">Excelencia desde 2012</span>
          <span className="w-1 h-1 bg-gold rounded-full" />
        </div>

        {/* Main heading */}
        <h1 className="font-heading text-5xl sm:text-7xl lg:text-8xl font-bold text-white mb-6 leading-none tracking-tight">
          El Arte del
          <br />
          <span className="text-gold italic">Corte Perfecto</span>
        </h1>

        <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-light">
          Barbería ARIAS — donde cada corte es una obra de precisión.
          Más de una década perfeccionando el estilo masculino con las técnicas y productos más exclusivos.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/reservar" className="btn-gold text-sm px-10 py-4 w-full sm:w-auto text-center">
            Reservar mi Cita
          </Link>
          <a href="#servicios" className="btn-outline-gold text-sm px-10 py-4 w-full sm:w-auto text-center">
            Ver Servicios
          </a>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-12 mt-20 pt-12 border-t border-dark-4">
          {[
            { value: '12+', label: 'Años de Experiencia' },
            { value: '5K+', label: 'Clientes Satisfechos' },
            { value: '3', label: 'Maestros Barberos' },
            { value: '100%', label: 'Satisfacción Garantizada' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-heading text-3xl font-bold text-gold mb-1">{stat.value}</div>
              <div className="text-gray-500 text-xs tracking-widest uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-gray-600 text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-gold/60 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
