import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nama: '', kelas: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api.get('/auth/register-status').then(res => {
      setRegisterOpen(res.data.registerTerbuka);
    }).catch(() => {
      setRegisterOpen(false);
    }).finally(() => setChecking(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Registrasi berhasil! Tunggu aktivasi dari admin.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="loading-spinner text-kurma-600 w-8 h-8 border-4"></div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-kurma-600 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-3">
            <img src="/Screenshot 2026-04-08 090722.png" alt="" />
          </div>
          <h1 className="text-2xl font-bold text-stone-800">Daftar Ketua Kelas</h1>
          <p className="text-stone-500 text-sm mt-1">Buat akun sebagai perwakilan kelas</p>
        </div>

        {!registerOpen ? (
          <div className="card text-center py-10">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-lg font-bold text-stone-700 mb-2">Pendaftaran Ditutup</h3>
            <p className="text-stone-500 text-sm mb-6">
              Saat ini pendaftaran ketua kelas sedang ditutup. Hubungi admin atau panitia untuk informasi lebih lanjut.
            </p>
            <Link to="/login" className="btn-primary text-sm">Kembali ke Login</Link>
          </div>
        ) : (
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nama Lengkap</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Nama lengkap Anda"
                  value={form.nama}
                  onChange={e => setForm({ ...form, nama: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Kelas</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Contoh: XI IPA 1"
                  value={form.kelas}
                  onChange={e => setForm({ ...form, kelas: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Username</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Buat username unik"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Min. 6 karakter"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? <span className="loading-spinner"></span> : 'Daftar'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link to="/login" className="text-sm text-stone-400 hover:text-stone-600">
                Sudah punya akun? Masuk
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
