import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatTanggal } from '../../utils/helpers';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ pengajian: 0, users: 0, gelarTerpal: 0 });
  const [recent, setRecent] = useState([]);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/pengajian'),
      api.get('/users'),
      api.get('/gelar-terpal'),
      api.get('/dashboard'),
    ]).then(([p, u, gt, d]) => {
      setStats({ pengajian: p.data.length, users: u.data.length, gelarTerpal: gt.data.length });
      setRecent(p.data.slice(0, 5));
      setRegisterOpen(d.data.registerTerbuka);
    }).finally(() => setLoading(false));
  }, []);

  const toggleRegister = async () => {
    setToggling(true);
    try {
      const res = await api.patch('/dashboard/toggle-register');
      setRegisterOpen(res.data.registerTerbuka);
    } catch { } finally { setToggling(false); }
  };

  const statCards = [
    { to: '/admin/pengajian', label: 'Pengajian', value: stats.pengajian, icon: '🌙', bg: 'from-violet-500 to-purple-600', shadow: 'shadow-purple-200' },
    { to: '/admin/gelar-terpal', label: 'Gelar Terpal', value: stats.gelarTerpal, icon: '🏕️', bg: 'from-sky-500 to-blue-600', shadow: 'shadow-blue-200' },
    { to: '/admin/users', label: 'Pengguna', value: stats.users, icon: '👥', bg: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-200' },
    { to: '/admin/settings', label: 'Pengaturan', value: '⚙️', icon: null, bg: 'from-amber-500 to-orange-500', shadow: 'shadow-orange-200' },
  ];

  const quickActions = [
    { to: '/admin/pengajian', icon: '🌙', label: 'Tambah Pengajian Malam', desc: 'Buat jadwal & pembagian ruang baru', color: 'bg-violet-50 hover:bg-violet-100 border-violet-100' },
    { to: '/admin/gelar-terpal', icon: '🏕️', label: 'Atur Gelar Terpal', desc: 'Kelola ruangan & pendamping', color: 'bg-sky-50 hover:bg-sky-100 border-sky-100' },
    { to: '/admin/users', icon: '👥', label: 'Kelola Pengguna', desc: 'Tambah/edit akun ketua kelas', color: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-100' },
    { to: '/admin/settings', icon: '⚙️', label: 'Pengaturan Sistem', desc: 'Motto, galeri, kontak organisasi', color: 'bg-amber-50 hover:bg-amber-100 border-amber-100' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 rounded-3xl p-8 text-white shadow-xl shadow-purple-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">🛡️ Super Admin</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{user?.nama || 'Admin'}</h1>
          <p className="text-purple-200 mt-1 text-sm">Kontrol penuh sistem organisasi Kurma</p>
          <div className="flex items-center gap-2 mt-4">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-purple-200 text-xs">Sistem aktif & berjalan normal</span>
          </div>
        </div>
      </div>

      {/* Register Toggle Banner */}
      <div className={`rounded-2xl p-5 flex items-center justify-between border-2 transition-all ${
        registerOpen
          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
          : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
            registerOpen ? 'bg-emerald-100' : 'bg-red-100'
          }`}>
            {registerOpen ? '🔓' : '🔒'}
          </div>
          <div>
            <p className={`font-bold text-base ${registerOpen ? 'text-emerald-800' : 'text-red-800'}`}>
              {registerOpen ? 'Pendaftaran Dibuka' : 'Pendaftaran Ditutup'}
            </p>
            <p className={`text-sm mt-0.5 ${registerOpen ? 'text-emerald-600' : 'text-red-500'}`}>
              {registerOpen ? 'Ketua kelas bisa mendaftar secara mandiri' : 'Hanya admin/panitia yang bisa menambahkan akun'}
            </p>
          </div>
        </div>
        <button
          onClick={toggleRegister}
          disabled={toggling}
          className={`font-semibold px-5 py-2.5 rounded-xl transition-all text-sm shadow-sm ${
            registerOpen
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200'
          }`}
        >
          {toggling ? '⏳' : (registerOpen ? 'Tutup Pendaftaran' : 'Buka Pendaftaran')}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(s => (
          <Link key={s.to} to={s.to}
            className={`group relative overflow-hidden bg-gradient-to-br ${s.bg} rounded-2xl p-5 shadow-lg ${s.shadow} hover:scale-[1.03] transition-all duration-200`}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
            <div className="text-3xl mb-3">{s.icon || s.value}</div>
            {s.icon && <div className="text-3xl font-bold text-white mb-0.5">{s.value}</div>}
            <p className="text-white/80 text-sm font-medium">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Pengajian */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-50">
            <h2 className="font-bold text-stone-800">🌙 Pengajian Terbaru</h2>
            <Link to="/admin/pengajian" className="text-purple-600 text-sm font-semibold hover:text-purple-700">Kelola →</Link>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="loading-spinner text-purple-600 w-7 h-7 border-4" />
              </div>
            ) : recent.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">🌙</div>
                <p className="text-stone-400 text-sm">Belum ada data pengajian</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recent.map(p => (
                  <div key={p._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors group">
                    <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center text-base flex-shrink-0">🌙</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-700 truncate">{p.tema}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{formatTanggal(p.tanggal)}</p>
                    </div>
                    <span className="text-stone-300 group-hover:text-stone-400 text-sm">→</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-50">
            <h2 className="font-bold text-stone-800">⚡ Aksi Cepat Admin</h2>
          </div>
          <div className="p-4 space-y-2">
            {quickActions.map(a => (
              <Link key={a.to} to={a.to}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all group ${a.color}`}>
                <span className="text-2xl">{a.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-stone-800 text-sm">{a.label}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{a.desc}</p>
                </div>
                <span className="text-stone-300 group-hover:text-stone-500 transition-colors text-sm">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
