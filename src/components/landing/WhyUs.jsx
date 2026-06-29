const reasons = [
  {
    icon: '✂',
    title: 'Maestros Certificados',
    desc: 'Cada barbero ha completado formación avanzada y actualiza sus técnicas constantemente con las últimas tendencias globales.',
  },
  {
    icon: '🏆',
    title: 'Productos Premium',
    desc: 'Solo utilizamos marcas de primera línea: cremas, aceites y herramientas seleccionadas para el mejor resultado posible.',
  },
  {
    icon: '📱',
    title: 'Reserva Online 24/7',
    desc: 'Agenda tu cita en cualquier momento desde cualquier dispositivo. Sin llamadas, sin esperas innecesarias.',
  },
  {
    icon: '⏱',
    title: 'Puntualidad Garantizada',
    desc: 'Respetamos tu tiempo. Tu cita comienza exactamente a la hora acordada, sin demoras ni improvisaciones.',
  },
  {
    icon: '🎯',
    title: 'Atención Personalizada',
    desc: 'Escuchamos lo que quieres y lo adaptamos a tu tipo de cabello, rasgos y estilo de vida. Tu corte, tu identidad.',
  },
  {
    icon: '💎',
    title: 'Ambiente Premium',
    desc: 'Un espacio diseñado para tu comodidad: ambiente cuidado, música selecta y atención de primer nivel.',
  },
];

export default function WhyUs() {
  return (
    <section className="py-24 bg-dark relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-gold/30 to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-gold/20 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="section-subtitle">¿Por qué elegirnos?</span>
          <h2 className="section-title">La Diferencia ARIAS</h2>
          <div className="section-divider mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((item, idx) => (
            <div key={idx} className="flex gap-5 group">
              <div className="flex-shrink-0 w-12 h-12 border border-dark-4 group-hover:border-gold flex items-center justify-center text-xl transition-all duration-300 mt-1">
                {item.icon}
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-white mb-2 group-hover:text-gold transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div className="mt-20 border border-dark-4 p-10 text-center relative">
          <div className="absolute -top-px left-1/2 -translate-x-1/2 w-24 h-px bg-gold" />
          <span className="font-heading text-5xl text-gold/30 leading-none block mb-4">"</span>
          <blockquote className="font-heading text-xl sm:text-2xl text-white italic max-w-3xl mx-auto leading-relaxed">
            Un buen corte no es solo apariencia — es confianza, carácter y la primera impresión que el mundo tiene de ti.
          </blockquote>
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-gold" />
            <span className="text-gold text-xs tracking-widest uppercase">Jharold Arias</span>
            <span className="w-8 h-px bg-gold" />
          </div>
        </div>
      </div>
    </section>
  );
}
