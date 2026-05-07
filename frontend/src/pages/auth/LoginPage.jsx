import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.username, form.password);
      toast.success(`Selamat datang, ${user.nama}!`);
      const map = { admin: '/admin', panitia: '/panitia', ketua_kelas: '/ketua' };
      navigate(map[user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 hero-bg items-center justify-center p-12">
        <div className="text-center text-white max-w-md">
          <div className="text-7xl mb-6 ornament">☪</div>
          <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Amiri, serif' }}>
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
          </h1>
          <p className="text-xl text-kurma-100 mb-2">Sistem Organisasi Kurma</p>
          <p className="text-kurma-200 text-sm leading-relaxed">
            Platform pengelolaan kegiatan pengajian malam, Gelar Terpal, dan seluruh aktivitas organisasi.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-kurma-600 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-3">
              <img src="/Screenshot 2026-04-08 090722.png" alt="" />
            </div>
            <h1 className="text-xl font-bold text-stone-800">Kurma</h1>
            <p className="text-sm text-stone-400">Sistem Organisasi</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-stone-800">Masuk</h2>
            <p className="text-stone-500 mt-1 text-sm">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Username</label>
              <input
                type="text"
                className="input-field"
                placeholder="Masukkan username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="Masukkan password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-sm"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <span className="loading-spinner"></span> : 'Masuk'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/register" className="text-sm text-kurma-600 hover:text-kurma-700 font-medium">
              Daftar sebagai Ketua Kelas →
            </Link>
          </div>

          <div className="mt-8 border-t border-stone-100 pt-6">
            <Link to="/" className="text-sm text-stone-400 hover:text-stone-600 flex items-center gap-1 justify-center">
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
