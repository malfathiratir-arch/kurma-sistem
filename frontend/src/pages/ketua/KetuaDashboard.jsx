import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatTanggal, getStatusBadge } from '../../utils/helpers';

export default function KetuaDashboard() {
  const { user } = useAuth();
  const [pengajianList, setPengajianList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/pengajian').then(res => setPengajianList(res.data.slice(0, 5))).finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-kurma-600 to-kurma-700 rounded-2xl p-6 mb-6 text-white">
        <p className="text-kurma-100 text-sm mb-1">Selamat datang kembali 👋</p>
        <h1 className="text-2xl font-bold">{user?.nama}</h1>
        <p className="text-kurma-200 text-sm mt-1">Ketua Kelas {user?.kelas}</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link to="/ketua/pengajian" className="card card-hover text-center py-8">
          <div className="text-4xl mb-3">🌙</div>
          <p className="font-bold text-stone-700">Pengajian Malam</p>
          <p className="text-xs text-stone-400 mt-1">Lihat jadwal & komentar</p>
        </Link>
        <Link to="/ketua/gelar-terpal" className="card card-hover text-center py-8">
          <div className="text-4xl mb-3">🏕️</div>
          <p className="font-bold text-stone-700">Gelar Terpal</p>
          <p className="text-xs text-stone-400 mt-1">Info ruangan kelas</p>
        </Link>
      </div>

      {/* Recent pengajian */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title mb-0">Pengajian Terbaru</h2>
          <Link to="/ketua/pengajian" className="text-kurma-600 text-sm font-medium">Lihat Semua →</Link>
        </div>
        {loading ? (
          <div className="py-8 flex justify-center"><div className="loading-spinner text-kurma-600 w-8 h-8 border-4"></div></div>
        ) : pengajianList.length === 0 ? (
          <p className="text-stone-400 text-center py-8 text-sm">Belum ada data pengajian</p>
        ) : (
          <div className="space-y-3">
            {pengajianList.map(p => {
              const status = getStatusBadge(p.status);
              return (
                <div key={p._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-stone-50 transition-colors">
                  <div className="w-10 h-10 bg-kurma-100 text-kurma-600 rounded-xl flex items-center justify-center text-lg flex-shrink-0">🌙</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-700 text-sm truncate">{p.tema}</p>
                    <p className="text-xs text-stone-400">{formatTanggal(p.tanggal)}</p>
                  </div>
                  <span className={`badge ${status.class} flex-shrink-0`}>{status.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="mt-5 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <p className="text-amber-800 text-sm font-semibold mb-1">💬 Peran Anda sebagai Ketua Kelas</p>
        <p className="text-amber-700 text-sm">
          Anda dapat melihat semua informasi pengajian malam dan Gelar Terpal, serta memberikan komentar atau pertanyaan kepada panitia.
        </p>
      </div>
    </div>
  );
}
