import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatTanggal } from '../../utils/helpers';

export default function PanitiaDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ pengajian: 0, users: 0, gelarTerpal: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/pengajian'),
      api.get('/users'),
      api.get('/gelar-terpal'),
    ]).then(([p, u, gt]) => {
      setStats({ pengajian: p.data.length, users: u.data.length, gelarTerpal: gt.data.length });
      setRecent(p.data.slice(0, 4));
    }).finally(() => setLoading(false));
  }, []);

  const cards = [
    { to: '/panitia/pengajian', label: 'Pengajian Malam', icon: '🌙', count: stats.pengajian, desc: 'Jadwal & pembagian ruang', bg: 'from-indigo-500 to-blue-600', shadow: 'shadow-blue-200' },
    { to: '/panitia/gelar-terpal', label: 'Gelar Terpal', icon: '🏕️', count: stats.gelarTerpal, desc: 'Ruangan & petugas', bg: 'from-teal-500 to-emerald-600', shadow: 'shadow-emerald-200' },
    { to: '/panitia/foto', label: 'Kelola Foto', icon: '🖼️', count: '—', desc: 'Upload & atur galeri', bg: 'from-rose-500 to-pink-600', shadow: 'shadow-pink-200' },
    { to: '/panitia/users', label: 'Ketua Kelas', icon: '👥', count: stats.users, desc: 'Daftar akun aktif', bg: 'from-amber-500 to-orange-500', shadow: 'shadow-orange-200' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-sky-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-200">
        <div className="absolute top-0 right-0 w-56 h-56 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-10 -translate-x-10" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">👋 Dashboard Panitia</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{user?.nama || 'Panitia'}</h1>
          <p className="text-blue-200 mt-1 text-sm">Kelola seluruh kegiatan & dokumentasi organisasi</p>
          <div className="flex items-center gap-2 mt-4">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-blue-200 text-xs">Akses panitia aktif</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => (
          <Link key={c.to} to={c.to}
            className={`group relative overflow-hidden bg-gradient-to-br ${c.bg} rounded-2xl p-5 shadow-lg ${c.shadow} hover:scale-[1.03] transition-all duration-200`}>
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-4 translate-x-4" />
            <div className="text-3xl mb-3">{c.icon}</div>
            <div className="text-2xl font-bold text-white mb-0.5">{c.count}</div>
            <p className="text-white/90 text-sm font-semibold">{c.label}</p>
            <p className="text-white/60 text-xs mt-0.5">{c.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent Pengajian */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-50 bg-gradient-to-r from-stone-50 to-white">
          <h2 className="font-bold text-stone-800">🌙 Pengajian Terbaru</h2>
          <Link to="/panitia/pengajian" className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors">Kelola →</Link>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="loading-spinner text-blue-600 w-8 h-8 border-4" />
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">🌙</div>
              <p className="text-stone-400 text-sm font-medium">Belum ada data pengajian</p>
              <Link to="/panitia/pengajian" className="inline-block mt-3 text-blue-600 text-sm font-semibold hover:text-blue-700">Tambah sekarang →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map(p => (
                <div key={p._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-stone-50 transition-colors group">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">🌙</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-700 text-sm truncate">{p.tema}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-xs text-stone-400">{formatTanggal(p.tanggal)}</p>
                      {p.pembagianRuang?.length > 0 && (
                        <span className="text-xs text-blue-500">🏫 {p.pembagianRuang.length} ruang</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {p.komentar?.length > 0 && (
                      <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">💬 {p.komentar.length}</span>
                    )}
                    <span className="text-stone-300 group-hover:text-stone-400 text-sm">→</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
