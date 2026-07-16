import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/barbero', label: 'Mi Dashboard', icon: '◼', end: true },
  { to: '/barbero/citas', label: 'Mis Citas', icon: '📋', end: false },
  { to: '/barbero/registrar', label: 'Registrar Servicio', icon: '✓', end: false },
];

export default function BarberLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-dark-4">
        <Link to="/" className="flex flex-col items-start gap-2">
          <img src="/logo.png" alt="Barbershop ARIAS" className="h-10 w-auto object-contain" />
          <span className="text-gold text-xs tracking-widest uppercase">Mi Panel</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4">
        <p className="px-4 text-gray-700 text-xs tracking-widest uppercase font-medium mb-2">Menú</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
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
        <button onClick={handleLogout} className="w-full text-left text-gray-500 hover:text-red-400 text-xs transition-colors py-1.5 flex items-center gap-2">
          <span>⏏</span> Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-dark-2 border-r border-dark-4 fixed left-0 top-0 bottom-0 z-20">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-dark-2 border-r border-dark-4 flex flex-col">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-dark-2 border-b border-dark-4 px-4 sm:px-8 h-16 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-gold">
            <span className="text-xl">☰</span>
          </button>
          <span className="text-gray-500 text-sm hidden sm:block">Panel del Barbero — Barbería ARIAS</span>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm truncate max-w-[140px] sm:max-w-none">{user?.nombre}</span>
            <div className="w-8 h-8 bg-gold flex items-center justify-center text-dark font-bold text-sm flex-shrink-0">
              {user?.nombre?.charAt(0)}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
