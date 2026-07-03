import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '◼', end: true },
  { to: '/admin/reservas', label: 'Reservas', icon: '📋', end: false },
  { to: '/admin/servicios-realizados', label: 'Servicios', icon: '✓', end: false },
  { to: '/admin/trabajadores', label: 'Trabajadores', icon: '✂', end: false },
  { to: '/admin/sedes', label: 'Sedes', icon: '📍', end: false },
  { to: '/admin/catalogo', label: 'Catálogo', icon: '💎', end: false },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-dark-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 border-2 border-gold flex items-center justify-center rotate-45">
            <span className="font-heading font-bold text-gold text-sm -rotate-45">A</span>
          </div>
          <div>
            <span className="font-heading font-bold text-white text-base tracking-wider">ARIAS</span>
            <span className="block text-gold text-xs tracking-widest">Admin Panel</span>
          </div>
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
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
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
            <p className="text-gray-600 text-xs">Administrador</p>
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
      <aside className="hidden lg:flex flex-col w-64 bg-dark-2 border-r border-dark-4 fixed left-0 top-0 bottom-0 z-20">
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
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-dark-2 border-b border-dark-4 px-4 sm:px-8 h-16 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-gold">
            <span className="text-xl">☰</span>
          </button>
          <div className="text-gray-500 text-sm hidden sm:block">
            Panel de Administración — Barbería ARIAS
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" target="_blank" className="text-xs text-gray-500 hover:text-gold transition-colors hidden sm:block">
              Ver sitio web →
            </Link>
            <div className="w-8 h-8 bg-gold flex items-center justify-center text-dark font-bold text-sm">
              {user?.nombre?.charAt(0)}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
