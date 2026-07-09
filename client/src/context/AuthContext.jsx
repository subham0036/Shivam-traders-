import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('st_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  const saveUser = (userData) => {
    setUser(userData);
    localStorage.setItem('st_user', JSON.stringify(userData));
    if (userData?.token) localStorage.setItem('st_token', userData.token);
  };

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('st_user');
    localStorage.removeItem('st_token');
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    saveUser(data.data);
    return data.data;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    saveUser(data.data);
    return data.data;
  };

  useEffect(() => {
    const token = localStorage.getItem('st_token');
    if (token) {
      authAPI.getMe()
        .then(({ data }) => setUser((prev) => ({ ...prev, ...data.data })))
        .catch(logout)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, saveUser, isAdmin: user?.role === 'admin', isStaff: user?.role === 'staff' || user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
