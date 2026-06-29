import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function BarberLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-dark-2 border-r border-dark-4 fixed left-0 top-0 bottom-0 z-20">
        <div className="px-6 py-6 border-b border-dark-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 border-2 border-gold flex items-center justify-center rotate-45">
              <span className="font-heading font-bold text-gold text-sm -rotate-45">A</span>
            </div>
            <div>
              <span className="font-heading font-bold text-white text-base tracking-wider">ARIAS</span>
              <span className="block text-gold text-xs tracking-widest">Mi Panel</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 py-4">
          <p className="px-4 text-gray-700 text-xs tracking-widest uppercase font-medium mb-2">Menú</p>
          {[
            { to: '/barbero', label: 'Mi Dashboard', icon: '◼', end: true },
            { to: '/barbero/citas', label: 'Mis Citas', icon: '📋', end: false },
            { to: '/barbero/registrar', label: 'Registrar Servicio', icon: '✓', end: false },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-dark-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gold flex items-center justify-center text-dark font-bold text-sm">
              {user?.nombre?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.nombre}</p>
              <p className="text-gray-600 text-xs">Barbero</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 text-xs transition-colors flex items-center gap-2">
            <span>⏏</span> Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        <header className="bg-dark-2 border-b border-dark-4 px-4 sm:px-8 h-16 flex items-center justify-between">
          <span className="text-gray-500 text-sm">Panel del Barbero — Barbería ARIAS</span>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">{user?.nombre}</span>
            <button onClick={handleLogout} className="text-gray-600 hover:text-red-400 text-xs transition-colors lg:hidden">Salir</button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
