import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark-2 border-t border-dark-4 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 border-2 border-gold flex items-center justify-center rotate-45">
                <span className="font-heading font-bold text-gold text-sm -rotate-45">A</span>
              </div>
              <div>
                <span className="font-heading font-bold text-white text-xl tracking-wider">ARIAS</span>
                <span className="block text-gold text-xs tracking-widest uppercase">Barbería</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              Más de una década refinando el arte del corte masculino. Tu imagen, nuestra pasión.
            </p>
            <div className="flex gap-3">
              {['IG', 'FB', 'TT'].map((s) => (
                <a key={s} href="#" className="w-9 h-9 border border-dark-4 hover:border-gold flex items-center justify-center text-gray-500 hover:text-gold transition-all text-xs font-bold">
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-widest uppercase mb-5">Navegación</h4>
            <ul className="space-y-3">
              {[
                { label: 'Inicio', href: '/' },
                { label: 'Servicios', href: '/#servicios' },
                { label: 'Nuestro Equipo', href: '/#barberos' },
                { label: 'Reservar Cita', href: '/reservar' },
                { label: 'Contacto', href: '/#contacto' },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-gray-500 hover:text-gold text-sm transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-gold inline-block" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-widest uppercase mb-5">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="text-gold mt-0.5">📍</span>
                <span className="text-gray-500 text-sm">Calle Principal 123, Centro<br />Tu Ciudad</span>
              </li>
              <li className="flex gap-3">
                <span className="text-gold mt-0.5">📞</span>
                <span className="text-gray-500 text-sm">+57 300 000 0000</span>
              </li>
              <li className="flex gap-3">
                <span className="text-gold mt-0.5">✉️</span>
                <span className="text-gray-500 text-sm">info@barberia-arias.com</span>
              </li>
              <li className="flex gap-3">
                <span className="text-gold mt-0.5">🕐</span>
                <div className="text-gray-500 text-sm">
                  <p>Lun–Sáb: 9:00 – 19:00</p>
                  <p>Dom: Bajo cita previa</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-4 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-xs">© 2024 Barbería ARIAS. Todos los derechos reservados.</p>
          <Link to="/login" className="text-gray-700 hover:text-gray-500 text-xs transition-colors">
            Acceso interno
          </Link>
        </div>
      </div>
    </footer>
  );
}
