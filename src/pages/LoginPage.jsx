import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(correo.trim(), password);
      if (user.rol === 'admin') navigate('/admin');
      else navigate('/barbero');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-heading font-bold text-[50vw] text-white/[0.02] select-none leading-none">A</span>
        </div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex flex-col items-center gap-3 group">
            <div className="w-14 h-14 border-2 border-gold flex items-center justify-center rotate-45 group-hover:rotate-0 transition-transform duration-500">
              <span className="font-heading font-bold text-gold text-xl -rotate-45 group-hover:rotate-0 transition-transform duration-500">A</span>
            </div>
            <div>
              <span className="font-heading font-bold text-white text-2xl tracking-wider block">ARIAS</span>
              <span className="text-gold text-xs tracking-widest uppercase">Barbería — Acceso Interno</span>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-dark-2 border border-dark-4 p-8 sm:p-10">
          <h2 className="font-heading text-2xl text-white mb-1">Iniciar Sesión</h2>
          <p className="text-gray-500 text-sm mb-8">Accede a tu panel de control</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-dark">Correo electrónico</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="tu@barberia-arias.com"
                required
                className="input-dark"
              />
            </div>
            <div>
              <label className="label-dark">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input-dark"
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-700/50 text-red-400 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`btn-gold w-full text-sm py-4 text-center ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Verificando...' : 'Ingresar al Sistema'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 border-t border-dark-4 pt-6">
            <p className="text-gray-600 text-xs mb-3 tracking-wide uppercase font-medium">Credenciales de demostración:</p>
            <div className="space-y-2">
              <div className="bg-dark-3 px-4 py-2.5 text-xs">
                <span className="text-gold font-semibold">Admin:</span>
                <span className="text-gray-400 ml-2">admin@barberia-arias.com</span>
                <span className="text-gray-600 ml-2">/ Admin2024*</span>
              </div>
              <div className="bg-dark-3 px-4 py-2.5 text-xs">
                <span className="text-gold font-semibold">Barbero:</span>
                <span className="text-gray-400 ml-2">carlos@barberia-arias.com</span>
                <span className="text-gray-600 ml-2">/ Carlos2024*</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-gray-600 hover:text-gray-400 text-xs tracking-wide transition-colors">
            ← Volver a la página principal
          </Link>
        </div>
      </div>
    </div>
  );
}
