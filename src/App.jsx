import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import BookingPage from './pages/BookingPage';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageWorkers from './pages/admin/ManageWorkers';
import ManageServices from './pages/admin/ManageServices';
import AdminReservations from './pages/admin/AdminReservations';
import ManageSedes from './pages/admin/ManageSedes';
import AdminServiciosRealizados from './pages/admin/AdminServiciosRealizados';
import AdminClientes from './pages/admin/AdminClientes';

// Barber pages
import BarberLayout from './pages/barber/BarberLayout';
import BarberDashboard from './pages/barber/BarberDashboard';
import BarberAppointments from './pages/barber/BarberAppointments';
import BarberRegistrarServicio from './pages/barber/BarberRegistrarServicio';

function PrivateRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen bg-dark"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.rol !== requiredRole) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reservar" element={<BookingPage />} />

      {/* Admin routes */}
      <Route path="/admin" element={
        <PrivateRoute requiredRole="admin">
          <AdminLayout />
        </PrivateRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="reservas" element={<AdminReservations />} />
        <Route path="servicios-realizados" element={<AdminServiciosRealizados />} />
        <Route path="clientes" element={<AdminClientes />} />
        <Route path="trabajadores" element={<ManageWorkers />} />
        <Route path="sedes" element={<ManageSedes />} />
        <Route path="catalogo" element={<ManageServices />} />
      </Route>

      {/* Barber routes */}
      <Route path="/barbero" element={
        <PrivateRoute requiredRole="barbero">
          <BarberLayout />
        </PrivateRoute>
      }>
        <Route index element={<BarberDashboard />} />
        <Route path="citas" element={<BarberAppointments />} />
        <Route path="registrar" element={<BarberRegistrarServicio />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
