import { useState, useEffect } from 'react';
import { auth as authApi } from './apiClient';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hk_token');
    if (token) {
      authApi.me().then(u => { setUser(u); setLoading(false); }).catch(() => { localStorage.removeItem('hk_token'); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await authApi.login({ username, password });
    localStorage.setItem('hk_token', res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('hk_token');
    setUser(null);
  };

  return { user, loading, login, logout };
}
