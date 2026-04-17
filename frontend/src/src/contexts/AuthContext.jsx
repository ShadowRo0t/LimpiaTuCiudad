import { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers } from '../data/mockData';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('ltc_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('ltc_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const foundUser = mockUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('ltc_user', JSON.stringify(userWithoutPassword));
      return { success: true, user: userWithoutPassword };
    }

    return { success: false, error: 'Email o contraseña incorrectos' };
  };

  const register = (userData) => {
    // En producción, esto se enviaría al backend
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      return { success: false, error: 'El email ya está registrado' };
    }

    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      role: 'ciudadano',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('ltc_user', JSON.stringify(userWithoutPassword));
    return { success: true, user: userWithoutPassword };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ltc_user');
  };

  const isAuthenticated = !!user;
  const isCiudadano = user?.role === 'ciudadano';
  const isMunicipalidad = user?.role === 'municipalidad';
  const isCuadrilla = user?.role === 'cuadrilla';

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isCiudadano,
    isMunicipalidad,
    isCuadrilla
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
