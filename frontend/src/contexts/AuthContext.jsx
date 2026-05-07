import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('kurma_token');
    localStorage.removeItem('kurma_user');
    localStorage.removeItem('last_active'); // Hapus catatan waktu
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('kurma_token');
    const savedUser = localStorage.getItem('kurma_user');
    const lastActive = localStorage.getItem('last_active');

    if (token && savedUser) {
      // --- LOGIKA CEK WAKTU SAAT BARU DIBUKA ---
      if (lastActive) {
        const now = Date.now();
        const diffInMinutes = (now - parseInt(lastActive)) / (1000 * 60);

        if (diffInMinutes > 1) { // Jika sudah ditinggal lebih dari 1 menit
          alert('Sesi habis karena Anda sudah keluar lebih dari 1 menit.');
          logout();
          setLoading(false);
          return;
        }
      }
      // ----------------------------------------

      try {
        setUser(JSON.parse(savedUser));
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  // --- LOGIKA UPDATE WAKTU SELAMA DI DALAM ---
  useEffect(() => {
    let interval;
    if (user) {
      // Selama user ada di dalam (tab terbuka), kita update waktu terus
      // supaya sistem tahu user "masih di sini"
      interval = setInterval(() => {
        localStorage.setItem('last_active', Date.now().toString());
      }, 5000); // Update setiap 5 detik
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user]);
  // ------------------------------------------

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const { token, user: userData } = res.data;
    
    // Set waktu awal saat login
    localStorage.setItem('last_active', Date.now().toString());
    localStorage.setItem('kurma_token', token);
    localStorage.setItem('kurma_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logoutManual = () => {
    logout();
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      const updatedUser = res.data.user;
      localStorage.setItem('kurma_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch {
      logout();
    }
  };

  const isAdmin = user?.role === 'admin';
  const isPanitia = user?.role === 'panitia';
  const isKetuaKelas = user?.role === 'ketua_kelas';
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout: logoutManual, refreshUser,
      isAdmin, isPanitia, isKetuaKelas, isLoggedIn
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};