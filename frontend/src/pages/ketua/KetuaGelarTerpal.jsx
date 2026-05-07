import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { formatTanggal } from '../../utils/helpers';

export default function KetuaGelarTerpal() {
  const [pengajianList, setPengajianList] = useState([]);
  const [selectedPengajian, setSelectedPengajian] = useState(null);
  const [gelarList, setGelarList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingGelar, setLoadingGelar] = useState(false);

  useEffect(() => {
    api.get('/pengajian').then(res => {
      setPengajianList(res.data);
      if (res.data.length > 0) {
        handleSelectPengajian(res.data[0]);
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSelectPengajian = async (p) => {
    setSelectedPengajian(p);
    setLoadingGelar(true);
    try {
      const res = await api.get(`/gelar-terpal?pengajianId=${p._id}`);
      setGelarList(res.data);
    } finally {
      setLoadingGelar(false);
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
        <h1 className="page-title">🏕️ Gelar Terpal</h1>
        <p className="page-subtitle">Informasi pembagian ruangan dan petugas setiap kelas</p>
      </div>

      {pengajianList.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🏕️</div>
          <p className="text-stone-500">Belum ada data Gelar Terpal</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Pilih pengajian */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide px-1">Pilih Pengajian</p>
            {pengajianList.map(p => (
              <button
                key={p._id}
                onClick={() => handleSelectPengajian(p)}
                className={`w-full text-left card card-hover ${selectedPengajian?._id === p._id ? 'ring-2 ring-kurma-400 bg-kurma-50' : ''}`}
              >
                <p className="font-bold text-stone-800 text-sm">{p.tema}</p>
                <p className="text-xs text-stone-400 mt-1">{formatTanggal(p.tanggal)}</p>
              </button>
            ))}
          </div>

          {/* Gelar Terpal detail */}
          <div className="md:col-span-2">
            {loadingGelar ? (
              <div className="flex justify-center py-16">
                <div className="loading-spinner text-kurma-600 w-8 h-8 border-4"></div>
              </div>
            ) : gelarList.length === 0 ? (
              <div className="card text-center py-16">
                <div className="text-4xl mb-3">🏕️</div>
                <p className="text-stone-500 text-sm">Belum ada data Gelar Terpal untuk pengajian ini</p>
              </div>
            ) : (
              <div className="space-y-5">
                {gelarList.map(gt => (
                  <div key={gt._id} className="card animate-fade-in">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-stone-800">Kelas {gt.kelas}</h3>
                        <p className="text-stone-500 text-sm">📍 {gt.lokasi}</p>
                      </div>
                    </div>

                    {gt.foto?.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {gt.foto.map((f, i) => (
                          <img key={i} src={f} alt="" className="rounded-xl h-24 w-full object-cover" />
                        ))}
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      {gt.pendamping?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Pendamping</p>
                          {gt.pendamping.map((pd, i) => (
                            <p key={i} className="text-sm text-stone-700 font-medium">{pd.nama}{pd.jabatan && ` · ${pd.jabatan}`}</p>
                          ))}
                        </div>
                      )}
                      {gt.pembimbing?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Pembimbing</p>
                          {gt.pembimbing.map((pb, i) => (
                            <p key={i} className="text-sm text-stone-700 font-medium">{pb.nama}{pb.jabatan && ` · ${pb.jabatan}`}</p>
                          ))}
                        </div>
                      )}
                      {gt.panitia?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Panitia</p>
                          {gt.panitia.map((p, i) => (
                            <p key={i} className="text-sm text-stone-700">{p.nama} <span className="text-stone-400">({p.jabatan})</span></p>
                          ))}
                        </div>
                      )}
                      {gt.petugas?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Petugas</p>
                          {gt.petugas.map((p, i) => (
                            <p key={i} className="text-sm text-stone-700">{p.nama} <span className="text-stone-400">({p.tugas})</span></p>
                          ))}
                        </div>
                      )}
                    </div>

                    {gt.catatan && (
                      <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3">
                        <p className="text-xs font-semibold text-amber-700 mb-1">📝 Catatan</p>
                        <p className="text-sm text-amber-800">{gt.catatan}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
