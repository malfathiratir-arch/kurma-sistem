import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatTanggal, formatWaktu, getStatusBadge } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function KetuaPengajian() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [komentar, setKomentar] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/pengajian');
      setList(res.data);
      if (res.data.length > 0) {
        setSelected(res.data[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (p) => {
    try {
      const res = await api.get(`/pengajian/${p._id}`);
      setSelected(res.data);
    } catch {
      setSelected(p);
    }
  };

  const handleKomentar = async (e) => {
    e.preventDefault();
    if (!komentar.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/pengajian/${selected._id}/komentar`, { isi: komentar });
      setSelected(prev => ({
        ...prev,
        komentar: [...(prev.komentar || []), res.data.komentar]
      }));
      setKomentar('');
      toast.success('Komentar terkirim!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim komentar');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="loading-spinner text-kurma-600 w-10 h-10 border-4"></div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🌙 Pengajian Malam</h1>
        <p className="page-subtitle">Jadwal dan informasi lengkap kegiatan pengajian</p>
      </div>

      {list.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🌙</div>
          <p className="text-stone-500">Belum ada jadwal pengajian</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* List */}
          <div className="space-y-3">
            {list.map(p => {
              const status = getStatusBadge(p.status);
              return (
                <button
                  key={p._id}
                  onClick={() => handleSelect(p)}
                  className={`w-full text-left card card-hover ${selected?._id === p._id ? 'ring-2 ring-kurma-400 bg-kurma-50' : ''}`}
                >
                  <span className={`badge ${status.class} mb-2`}>{status.label}</span>
                  <p className="font-bold text-stone-800 text-sm">{p.tema}</p>
                  <p className="text-xs text-stone-400 mt-1">{formatTanggal(p.tanggal)}</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    💬 {p.komentar?.length || 0} komentar
                  </p>
                </button>
              );
            })}
          </div>

          {/* Detail */}
          {selected && (
            <div className="md:col-span-2 space-y-5 animate-fade-in">
              {/* Info utama */}
              <div className="card">
                <span className={`badge ${getStatusBadge(selected.status).class} mb-3`}>
                  {getStatusBadge(selected.status).label}
                </span>
                <h2 className="text-xl font-bold text-stone-800">{selected.tema}</h2>
                <p className="text-stone-500 text-sm mt-1">{formatTanggal(selected.tanggal)}</p>
                <p className="text-stone-400 text-sm">📍 {selected.lokasi}</p>

                {selected.foto?.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {selected.foto.map((f, i) => (
                      <img key={i} src={f} alt="" className="rounded-xl h-24 w-full object-cover" />
                    ))}
                  </div>
                )}

                {selected.daftarKelas?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Kelas Peserta</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.daftarKelas.map((k, i) => (
                        <span key={i} className="bg-stone-100 text-stone-700 text-xs font-medium px-3 py-1 rounded-full">{k}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  {selected.pendamping?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Pendamping</p>
                      {selected.pendamping.map((pd, i) => (
                        <p key={i} className="text-sm text-stone-700"><span className="font-medium">{pd.nama}</span>{pd.jabatan && ` · ${pd.jabatan}`}</p>
                      ))}
                    </div>
                  )}
                  {selected.pembimbing?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Pembimbing</p>
                      {selected.pembimbing.map((pb, i) => (
                        <p key={i} className="text-sm text-stone-700"><span className="font-medium">{pb.nama}</span>{pb.jabatan && ` · ${pb.jabatan}`}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Jadwal */}
              {selected.jadwal?.length > 0 && (
                <div className="card">
                  <h3 className="section-title">📋 Jadwal Kegiatan</h3>
                  <div className="space-y-3">
                    {selected.jadwal.map((j, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <span className="bg-kurma-100 text-kurma-700 text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0 min-w-[52px] text-center">
                          {j.waktu}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-stone-700">{j.kegiatan}</p>
                          {j.keterangan && <p className="text-xs text-stone-400">{j.keterangan}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Panitia & Petugas */}
              {(selected.panitia?.length > 0 || selected.petugas?.length > 0) && (
                <div className="grid sm:grid-cols-2 gap-5">
                  {selected.panitia?.length > 0 && (
                    <div className="card">
                      <h3 className="section-title">👔 Panitia</h3>
                      <div className="space-y-2">
                        {selected.panitia.map((p, i) => (
                          <div key={i} className="flex justify-between items-center text-sm">
                            <span className="font-medium text-stone-700">{p.nama}</span>
                            <span className="text-stone-400 text-xs">{p.jabatan}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selected.petugas?.length > 0 && (
                    <div className="card">
                      <h3 className="section-title">🛠️ Petugas</h3>
                      <div className="space-y-2">
                        {selected.petugas.map((p, i) => (
                          <div key={i} className="flex justify-between items-center text-sm">
                            <span className="font-medium text-stone-700">{p.nama}</span>
                            <span className="text-stone-400 text-xs">{p.tugas}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Komentar */}
              <div className="card">
                <h3 className="section-title">💬 Komentar & Pertanyaan</h3>
                <div className="space-y-3 mb-5 max-h-60 overflow-y-auto">
                  {(selected.komentar || []).length === 0 ? (
                    <p className="text-stone-400 text-sm text-center py-4">Belum ada komentar. Jadilah yang pertama!</p>
                  ) : (
                    selected.komentar.map((k, i) => (
                      <div key={i} className={`flex gap-3 ${k.userId === user?._id ? 'flex-row-reverse' : ''}`}>
                        <div className="w-8 h-8 bg-kurma-100 text-kurma-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {k.nama?.charAt(0)}
                        </div>
                        <div className={`max-w-xs ${k.userId === user?._id ? 'items-end' : ''} flex flex-col`}>
                          <div className={`rounded-2xl px-3 py-2 text-sm ${k.userId === user?._id ? 'bg-kurma-500 text-white rounded-tr-sm' : 'bg-stone-100 text-stone-700 rounded-tl-sm'}`}>
                            {k.isi}
                          </div>
                          <p className="text-xs text-stone-400 mt-1">{k.nama} · {k.kelas}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={handleKomentar} className="flex gap-2">
                  <input
                    type="text"
                    className="input-field flex-1"
                    placeholder="Tulis komentar atau pertanyaan..."
                    value={komentar}
                    onChange={e => setKomentar(e.target.value)}
                  />
                  <button type="submit" className="btn-primary px-4" disabled={submitting || !komentar.trim()}>
                    {submitting ? '⏳' : '➤'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
