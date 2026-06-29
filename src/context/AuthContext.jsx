import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { login as dbLogin, logout as dbLogout, getCurrentUser } from '../services/db';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setUser(null);
      } else {
        const u = await getCurrentUser();
        setUser(u);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (correo, password) => {
    const found = await dbLogin(correo, password);
    setUser(found);
    return found;
  };

  const logout = async () => {
    await dbLogout();
    setUser(null);
  };

  const isAdmin = () => user?.rol === 'admin';
  const isBarber = () => user?.rol === 'barbero';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isBarber }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
