import { createContext, useEffect, useMemo, useState } from 'react';
import { getToken, getUser, login as loginService, logout as logoutService } from '../services/authService';

export const AuthContext = createContext({
  user: null,
  token: null,
  loading: false,
  error: null,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setToken(getToken());
    setUser(getUser());
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await loginService(email, password);
      setToken(result.token);
      setUser(result.user);
      setLoading(false);
      return true;
    } catch (e) {
      setError(e.message || 'Erreur authentification');
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    logoutService();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      login,
      logout,
      isAuthenticated: Boolean(token),
    }),
    [user, token, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
