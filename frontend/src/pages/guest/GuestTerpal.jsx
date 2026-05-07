import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { formatTanggal } from '../../utils/helpers';
import { 
  Search, MapPin, UserCheck, BookOpen, 
  Users, ClipboardList, Tent, Calendar 
} from 'lucide-react';

export default function GuestTerpal() {
  const [pengajianList, setPengajianList] = useState([]);
  const [selectedPengajian, setSelectedPengajian] = useState(null);
  const [gelarList, setGelarList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const res = await api.get('/pengajian');
      setPengajianList(res.data);
      if (res.data.length > 0) {
        handleSelectPengajian(res.data[0]);
      }
    } catch (err) {
      console.error("Gagal memuat data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPengajian = async (pengajian) => {
    setSelectedPengajian(pengajian);
    setLoading(true);
    try {
      const res = await api.get(`/gelar-terpal?pengajianId=${pengajian._id}`);
      setGelarList(res.data);
    } catch (err) {
      setGelarList([]);
    } finally {
      setLoading(false);
    }
  };

  // Logika Pencarian: Filter berdasarkan Kelas atau Lokasi
  const filteredGelar = gelarList.filter(item => 
    item.kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.lokasi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && pengajianList.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-kurma-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-stone-800 flex items-center justify-center gap-3">
          <Tent className="text-kurma-600" size={32} /> <div className='dark:text-white'>info gelar terpal</div>
        </h1>
        <p className="text-stone-500 mt-2">Cek lokasi dan petugas pendamping pengajianmu</p>
      </div>

      {/* Pengajian Selector (Horizontal Scroll on Mobile) */}
      <div className="flex overflow-x-auto gap-3 pb-4 mb-8 no-scrollbar">
        {pengajianList.map((p) => (
          <button
            key={p._id}
            onClick={() => handleSelectPengajian(p)}
            className={`flex-shrink-0 px-5 py-3 rounded-2xl border transition-all ${
              selectedPengajian?._id === p._id
                ? 'bg-kurma-600 text-white border-kurma-600 shadow-lg shadow-kurma-200'
                : 'bg-white text-stone-600 border-stone-200 hover:border-kurma-300'
            }`}
          >
            <p className="text-sm font-bold">{p.tema}</p>
            <div className={`text-[10px] mt-1 flex items-center gap-1 ${selectedPengajian?._id === p._id ? 'text-kurma-100' : 'text-stone-400'}`}>
              <Calendar size={12} /> {formatTanggal(p.tanggal)}
            </div>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
        <input
          type="text"
          placeholder="Cari kelasmu (misal: XI IPA 1)..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-stone-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-kurma-500 focus:border-transparent outline-none transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin inline-block rounded-full h-8 w-8 border-t-2 border-kurma-600 mb-2"></div>
          <p className="text-stone-400 text-sm">Memperbarui data...</p>
        </div>
      ) : filteredGelar.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {filteredGelar.map((gt) => (
            <div key={gt._id} className="bg-white rounded-3xl p-6 border border-stone-50 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              {/* Dekorasi Background */}
              <div className="absolute -right-4 -top-4 text-stone-50 group-hover:text-kurma-50 transition-colors">
                <Tent size={100} />
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="bg-kurma-100 text-kurma-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      Kelas
                    </span>
                    <h2 className="text-2xl font-black text-stone-800 mt-1">{gt.kelas}</h2>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-kurma-600 font-bold justify-end">
                      <MapPin size={18} />
                      <span>Lokasi</span>
                    </div>
                    <p className="text-stone-600 font-medium">{gt.lokasi}</p>
                    {gt.tanggalHari && (
    <p className="text-kurma-600 text-[11px] font-bold mt-1 uppercase tracking-wider">
      📅 {gt.tanggalHari}
    </p>
  )}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Bagian Utama: Pendamping & Pembimbing */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-purple-50 rounded-2xl p-3 border border-purple-100">
                      <p className="text-[10px] font-bold text-purple-500 uppercase flex items-center gap-1 mb-2">
                        <UserCheck size={12} /> Pendamping
                      </p>
                      {gt.pendamping?.map((p, i) => (
                        <p key={i} className="text-sm font-semibold text-stone-700 truncate">{p.nama}</p>
                      ))}
                    </div>
                    <div className="bg-blue-50 rounded-2xl p-3 border border-blue-100">
                      <p className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1 mb-2">
                        <BookOpen size={12} /> Pembimbing
                      </p>
                      {gt.pembimbing?.map((p, i) => (
                        <p key={i} className="text-sm font-semibold text-stone-700 truncate">{p.nama}</p>
                      ))}
                    </div>
                  </div>

                  {/* Bagian Sekunder: Panitia & Petugas */}
                  <div className="border-t border-stone-100 pt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase flex items-center gap-1 mb-2">
                        <Users size={12} /> Panitia
                      </p>
                      {gt.panitia?.slice(0, 2).map((p, i) => (
                        <div key={i} className="mb-1">
                          <p className="text-xs font-medium text-stone-700 leading-none">{p.nama}</p>
                          <p className="text-[9px] text-stone-400 italic">{p.jabatan}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase flex items-center gap-1 mb-2">
                        <ClipboardList size={12} /> Petugas
                      </p>
                      {gt.petugas?.slice(0, 2).map((p, i) => (
                        <div key={i} className="mb-1">
                          <p className="text-xs font-medium text-stone-700 leading-none">{p.nama}</p>
                          <p className="text-[9px] text-stone-400 italic">{p.tugas}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {gt.catatan && (
                    <div className="bg-amber-50 rounded-xl p-3 text-[11px] text-amber-800 border border-amber-100 italic">
                      " {gt.catatan} "
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-200">
          <p className="text-stone-400">Data tidak ditemukan atau belum diinput oleh Admin.</p>
        </div>
      )}
    </div>
  );
}