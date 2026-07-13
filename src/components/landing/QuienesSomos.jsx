const VALORES = [
  'Responsabilidad',
  'Respeto',
  'Puntualidad',
  'Profesionalismo',
  'Honestidad',
  'Honradez',
  'Calidad de trabajo',
];

export default function QuienesSomos() {
  return (
    <section id="nosotros" className="py-24 bg-dark relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="section-subtitle">Nuestra Historia</span>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">¿Quiénes Somos?</h2>
          <div className="section-divider mx-auto" />
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start mb-16">
          {/* Historia */}
          <div>
            <p className="text-gray-400 text-base leading-relaxed mb-6">
              Somos una barbería clásica fundada el año <span className="text-gold font-semibold">2020</span>, un año
              difícil para la mayoría de las personas en los tiempos de covid, donde se aperturó la primera sede{' '}
              <span className="text-white font-semibold">BARBERSHOP ARIAS</span> en el norte del país,{' '}
              <span className="text-gold">Carabayllo</span>, adecuándonos al momento y con el objetivo de brindar un
              servicio diferente y de calidad para cada uno de nuestros clientes.
            </p>
            <p className="text-gray-400 text-base leading-relaxed mb-6">
              La acogida de nuestros clientes nos impulsó a seguir mejorando y, gracias a cada uno de ellos, en el año{' '}
              <span className="text-gold font-semibold">2025</span> contamos con tres sedes en Lima Metropolitana:{' '}
              <span className="text-white">Comas</span>, <span className="text-white">Carabayllo</span> y{' '}
              <span className="text-white">Los Olivos</span>.
            </p>
            <p className="text-gray-400 text-base leading-relaxed">
              Tenemos el objetivo claro de seguir aperturando sucursales y servir a todos los clientes para
              complementar su apariencia y autoestima.
            </p>
          </div>

          {/* Misión y Visión */}
          <div className="space-y-6">
            <div className="border border-dark-4 bg-dark-2 p-8 relative">
              <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
              <h3 className="font-heading text-xl font-bold text-gold mb-3">Misión</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Brindar un servicio de calidad y eficaz para satisfacer las expectativas y necesidades de los clientes.
              </p>
            </div>
            <div className="border border-dark-4 bg-dark-2 p-8 relative">
              <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
              <h3 className="font-heading text-xl font-bold text-gold mb-3">Visión</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Posicionarnos como una de las mejores cadenas de barberías clásicas a nivel nacional, desarrollando
                servicios de alta calidad y con las últimas tendencias en moda y estilo, satisfaciendo las necesidades
                y comodidad de cada uno de nuestros clientes.
              </p>
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="text-center">
          <h3 className="font-heading text-2xl font-bold text-white mb-3">Nuestros Valores</h3>
          <p className="text-gray-500 text-sm mb-8 max-w-xl mx-auto">
            Nuestra política de calidad en el servicio se caracteriza por los siguientes valores:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {VALORES.map((valor) => (
              <span
                key={valor}
                className="border border-gold/40 text-gray-300 text-sm px-5 py-2.5 tracking-wide hover:border-gold hover:text-gold transition-all duration-200"
              >
                <span className="text-gold mr-2">◆</span>
                {valor}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    </section>
  );
}
