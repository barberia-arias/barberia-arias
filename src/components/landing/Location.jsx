export default function Location() {
  return (
    <section id="contacto" className="py-24 bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <span className="section-subtitle">Encuéntranos</span>
          <h2 className="section-title">Ubicación & Contacto</h2>
          <div className="section-divider mx-auto" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* Contact info */}
          <div className="space-y-8">
            <p className="text-gray-400 text-base leading-relaxed">
              Estamos ubicados en el corazón de la ciudad, con fácil acceso en transporte público y zona de parqueo disponible. Te esperamos.
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: '📍',
                  title: 'Dirección',
                  lines: ['Calle Principal 123, Local 4', 'Centro Histórico, Tu Ciudad'],
                },
                {
                  icon: '📞',
                  title: 'Teléfono',
                  lines: ['+57 300 000 0000', 'WhatsApp disponible'],
                },
                {
                  icon: '✉️',
                  title: 'Correo',
                  lines: ['info@barberia-arias.com'],
                },
                {
                  icon: '🕐',
                  title: 'Horario de Atención',
                  lines: ['Lunes a Sábado: 9:00 – 19:00', 'Domingo: Bajo cita previa'],
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-5 group">
                  <div className="w-12 h-12 border border-dark-4 group-hover:border-gold flex items-center justify-center text-xl flex-shrink-0 transition-all duration-300">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-1">{item.title}</h4>
                    {item.lines.map((l, i) => (
                      <p key={i} className="text-gray-500 text-sm">{l}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map placeholder */}
          <div className="relative">
            <div className="w-full h-80 lg:h-96 bg-dark-3 border border-dark-4 flex items-center justify-center overflow-hidden">
              {/* Grid pattern */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'linear-gradient(#C9A84C 1px, transparent 1px), linear-gradient(90deg, #C9A84C 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />
              {/* Pin */}
              <div className="relative flex flex-col items-center">
                <div className="w-16 h-16 bg-gold/20 border-2 border-gold rounded-full flex items-center justify-center mb-3 animate-pulse">
                  <span className="text-gold text-2xl">📍</span>
                </div>
                <div className="bg-dark-2 border border-dark-4 px-5 py-3 text-center">
                  <p className="font-heading text-white font-semibold">Barbería ARIAS</p>
                  <p className="text-gray-500 text-xs mt-1">Calle Principal 123</p>
                </div>
              </div>
            </div>
            <div className="mt-3 text-center">
              <a
                href="#"
                className="text-gold text-xs tracking-widest uppercase hover:text-gold-light transition-colors"
              >
                Ver en Google Maps →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
