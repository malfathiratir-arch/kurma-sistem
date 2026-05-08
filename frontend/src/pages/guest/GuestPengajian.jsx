import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { formatTanggal, getStatusBadge } from '../../utils/helpers';

export default function GuestPengajian() {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pengajian');
      setList(res.data);
      if (res.data && res.data.length > 0) {
        setSelected(res.data[0]);
      }
    } catch (err) {
      console.error("Error fetching pengajian:", err);
      setError("Gagal memuat data jadwal pengajian.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950 transition-colors duration-300">
      <div className="loading-spinner text-kurma-600 w-12 h-12 border-4 border-t-kurma-600 border-stone-200 dark:border-stone-800 rounded-full animate-spin"></div>
      <p className="mt-4 text-stone-500 dark:text-stone-400 animate-pulse font-medium">Memuat jadwal pengajian...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
      <div className="text-center p-8 bg-white dark:bg-stone-900 shadow-xl rounded-3xl border border-stone-200 dark:border-stone-800">
        <p className="text-red-500 dark:text-red-400 mb-4 font-medium">{error}</p>
        <button 
          onClick={fetchData} 
          className="px-6 py-2.5 bg-kurma-600 hover:bg-kurma-700 text-white rounded-xl transition-all shadow-lg shadow-kurma-200 dark:shadow-none"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Header Section */}
        <div className="page-header mb-10 border-b border-stone-200 dark:border-stone-800 pb-6">
          <h1 className="page-title text-4xl font-black text-stone-800 dark:text-white flex items-center gap-3">
            <span className="text-kurma-600">🌙</span> Pengajian Malam
          </h1>
          <p className="page-subtitle text-stone-500 dark:text-stone-400 text-lg mt-2">
            Pusat informasi dan jadwal lengkap kegiatan pengajian rutin malam.
          </p>
        </div>

        {list.length === 0 ? (
          <div className="card bg-white dark:bg-stone-900 shadow-sm border border-stone-200 dark:border-stone-800 text-center py-24 rounded-3xl">
            <div className="text-7xl mb-6">📅</div>
            <h3 className="text-2xl font-bold text-stone-700 dark:text-stone-200 mb-2">Belum Ada Jadwal</h3>
            <p className="text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
              Saat ini belum ada jadwal pengajian yang tersedia. Silakan cek kembali di lain waktu.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* SIDEBAR: Daftar Jadwal */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em] px-2">Daftar Kegiatan</h3>
              <div className="space-y-3 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                {list.map((p) => {
                  const status = getStatusBadge(p.status);
                  const isActive = selected?._id === p._id;
                  return (
                    <button
                      key={p._id}
                      onClick={() => setSelected(p)}
                      className={`w-full text-left p-5 rounded-2xl transition-all duration-300 border ${
                        isActive 
                        ? 'bg-kurma-50 dark:bg-kurma-900/20 border-kurma-300 dark:border-kurma-500 ring-2 ring-kurma-200 dark:ring-kurma-900/30 shadow-md' 
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-kurma-200 dark:hover:border-kurma-800 hover:shadow-lg shadow-sm'
                      }`}
                    >
                      <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase mb-3 ${status.class}`}>
                        {status.label}
                      </span>
                      <p className={`font-bold leading-tight ${isActive ? 'text-kurma-900 dark:text-kurma-400' : 'text-stone-800 dark:text-stone-200'}`}>
                        {p.tema}
                      </p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-stone-400 dark:text-stone-500">
                        <span>📅 {formatTanggal(p.tanggal)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MAIN DETAIL: Detail Kegiatan */}
            <div className="lg:col-span-8">
              {selected ? (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Card Utama: Informasi Dasar */}
                  <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                      <div>
                        <span className={`badge ${getStatusBadge(selected.status).class} mb-3`}>
                          {getStatusBadge(selected.status).label}
                        </span>
                        <h2 className="text-3xl font-black text-stone-800 dark:text-white leading-tight">{selected.tema}</h2>
                        <div className="mt-4 space-y-2">
                          <p className="text-stone-500 dark:text-stone-400 flex items-center gap-3">
                            <span className="w-8 h-8 flex items-center justify-center bg-stone-100 dark:bg-stone-800 rounded-full">📅</span> 
                            {formatTanggal(selected.tanggal)}
                          </p>
                          <p className="text-kurma-600 dark:text-kurma-400 font-bold flex items-center gap-3">
                            <span className="w-8 h-8 flex items-center justify-center bg-kurma-50 dark:bg-kurma-900/30 rounded-full">📍</span> 
                            {selected.lokasi}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Pembagian Ruang */}
                    {selected.pembagianRuang?.length > 0 && (
                      <div className="mt-8 p-5 bg-stone-50 dark:bg-stone-950/50 rounded-2xl border border-stone-100 dark:border-stone-800">
                        <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-4">📍 Lokasi Ruangan</p>
                        <div className="flex flex-wrap gap-3">
                          {selected.pembagianRuang.map((r, i) => (
                            <div key={i} className="text-sm bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-4 py-2.5 rounded-xl shadow-sm border border-stone-200 dark:border-stone-700">
                              <span className="font-bold text-kurma-600 dark:text-kurma-400">🏢 {r.namaRuang}:</span>
                              <span className="ml-2">{r.kelas?.join(', ')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gallery Foto */}
                    {selected.foto?.length > 0 && (
                      <div className="mt-8">
                        <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-3">Dokumentasi / Poster</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {selected.foto.map((f, i) => (
                            <img 
                              key={i} 
                              src={f} 
                              alt={`Dokumentasi ${i}`} 
                              className="rounded-2xl h-32 w-full object-cover hover:scale-[1.02] transition-transform cursor-pointer border border-stone-100 dark:border-stone-800" 
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card: Peserta & Pemateri */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 p-6">
                      <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-5">👥 Peserta (Kelas)</h3>
                      <div className="flex flex-wrap gap-2">
                        {selected.daftarKelas?.map((k, i) => (
                          <span key={i} className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold px-4 py-2 rounded-full border border-stone-200 dark:border-stone-700">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 p-6 space-y-6">
                      {selected.pendamping?.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-4">🎤 Pemateri</h3>
                          {selected.pendamping.map((pd, i) => (
                            <div key={i} className="flex items-center gap-3 py-1">
                              <div className="w-2 h-2 rounded-full bg-kurma-400"></div>
                              <p className="text-stone-700 dark:text-stone-300 font-bold">{pd.nama} <span className="font-normal text-stone-400 dark:text-stone-500 text-xs">({pd.jabatan})</span></p>
                            </div>
                          ))}
                        </div>
                      )}
                      {selected.pembimbing?.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-4">🛡️ Pendamping</h3>
                          {selected.pembimbing.map((pb, i) => (
                            <div key={i} className="flex items-center gap-3 py-1">
                              <div className="w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-600"></div>
                              <p className="text-stone-700 dark:text-stone-300 font-bold">{pb.nama} <span className="font-normal text-stone-400 dark:text-stone-500 text-xs">({pb.jabatan})</span></p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card: Jadwal Acara */}
                  {selected.jadwal?.length > 0 && (
                    <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 p-6 md:p-8">
                      <h3 className="text-xl font-bold text-stone-800 dark:text-white mb-8 flex items-center gap-2">
                        <span>📋</span> Rundown Acara
                      </h3>
                      <div className="relative border-l-2 border-stone-100 dark:border-stone-800 ml-4 space-y-8">
                        {selected.jadwal.map((j, i) => (
                          <div key={i} className="relative pl-8">
                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white dark:bg-stone-900 border-2 border-kurma-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]"></div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                              <span className="inline-block bg-kurma-100 dark:bg-kurma-900/40 text-kurma-700 dark:text-kurma-400 text-[10px] font-black px-3 py-1 rounded-lg border border-kurma-200 dark:border-kurma-800">
                                {j.waktu}
                              </span>
                              <p className="text-stone-800 dark:text-stone-200 font-bold">{j.kegiatan}</p>
                            </div>
                            {j.keterangan && <p className="text-stone-400 dark:text-stone-500 text-sm mt-1">{j.keterangan}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Card: Panitia & Petugas */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 p-6">
                      <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-5">👔 Struktur Panitia</h3>
                      <div className="divide-y divide-stone-50 dark:divide-stone-800">
                        {selected.panitia?.map((p, i) => (
                          <div key={i} className="py-3.5 flex justify-between items-center">
                            <span className="font-bold text-stone-700 dark:text-stone-300">{p.nama}</span>
                            <span className="text-[10px] text-stone-400 dark:text-stone-500 bg-stone-50 dark:bg-stone-800 px-2.5 py-1 rounded-lg uppercase font-medium">{p.jabatan}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 p-6">
                      <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-5">🛠️ Petugas Teknis</h3>
                      <div className="divide-y divide-stone-50 dark:divide-stone-800">
                        {selected.petugas?.map((p, i) => (
                          <div key={i} className="py-3.5 flex justify-between items-center">
                            <span className="font-bold text-stone-700 dark:text-stone-300">{p.nama}</span>
                            <span className="text-[10px] text-kurma-600 dark:text-kurma-400 font-black uppercase tracking-wider">{p.tugas}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-stone-900 rounded-3xl border-2 border-dashed border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-600 italic">
                  <span className="text-4xl mb-4">👈</span>
                  Pilih salah satu jadwal untuk melihat detail lengkap
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}