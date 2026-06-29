import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  const dashboardPath = user?.rol === 'admin' ? '/admin' : '/barbero';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-dark-2/95 backdrop-blur-sm shadow-lg shadow-black/40' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="Barbershop Arias"
              className="h-14 w-auto object-contain"
            />
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="/#servicios" className="text-gray-300 hover:text-gold transition-colors duration-200 text-sm tracking-wide uppercase font-medium">Servicios</a>
            <a href="/#barberos" className="text-gray-300 hover:text-gold transition-colors duration-200 text-sm tracking-wide uppercase font-medium">Equipo</a>
            <a href="/#contacto" className="text-gray-300 hover:text-gold transition-colors duration-200 text-sm tracking-wide uppercase font-medium">Contacto</a>

            {user ? (
              <div className="flex items-center gap-4">
                <Link to={dashboardPath} className="text-gold text-sm font-medium tracking-wide hover:text-gold-light transition-colors">
                  {user.nombre.split(' ')[0]}
                </Link>
                <button onClick={logout} className="text-gray-400 hover:text-white text-xs tracking-wide uppercase border border-dark-4 hover:border-gold px-4 py-2 transition-all">
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-300 hover:text-gold text-sm font-medium tracking-wide uppercase transition-colors">
                  Ingresar
                </Link>
                <Link to="/reservar" className="btn-gold text-xs">
                  Reservar Cita
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col gap-1.5 p-2">
            <span className={`block w-6 h-0.5 bg-gold transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-gold transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-gold transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-dark-2 border-t border-dark-4 py-4 flex flex-col gap-4 px-4">
            <a href="/#servicios" className="text-gray-300 hover:text-gold text-sm tracking-wide uppercase font-medium py-2">Servicios</a>
            <a href="/#barberos" className="text-gray-300 hover:text-gold text-sm tracking-wide uppercase font-medium py-2">Equipo</a>
            <a href="/#contacto" className="text-gray-300 hover:text-gold text-sm tracking-wide uppercase font-medium py-2">Contacto</a>
            {user ? (
              <>
                <Link to={dashboardPath} className="text-gold text-sm font-medium py-2">Panel — {user.nombre}</Link>
                <button onClick={logout} className="text-left text-gray-400 text-sm py-2">Cerrar sesión</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 text-sm py-2">Iniciar sesión</Link>
                <Link to="/reservar" className="btn-gold text-center text-xs mt-2">Reservar Cita</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
