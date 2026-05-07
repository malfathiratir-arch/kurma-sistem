import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';
import { formatTanggal } from '../../utils/helpers'; // Pastikan helper ini ada

export default function AdminUangsumbangan() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ nama: '', nominal: '', tipe: 'Infaq' });
  const [sumbanganList, setSumbanganList] = useState([]); // State untuk list
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const kategoriConfig = {
    Takziah: { 
      bg: 'from-stone-600 to-stone-800', 
      light: 'bg-stone-50 border-stone-100 text-stone-700', 
      icon: '🖤',
      desc: 'Sumbangan uang duka / bela sungkawa'
    },
    Infaq: { 
      bg: 'from-emerald-500 to-teal-600', 
      light: 'bg-emerald-50 border-emerald-100 text-emerald-700', 
      icon: '🕌',
      desc: 'Infaq rutin masjid / sedekah umum'
    },
    Acara: { 
      bg: 'from-sky-500 to-blue-600', 
      light: 'bg-sky-50 border-sky-100 text-blue-700', 
      icon: '🎊',
      desc: 'Sumbangan khusus (Maulid, Rajaban, dll)'
    }
  };

  // 1. Fungsi Ambil Data dari Backend
  const fetchSumbangan = async () => {
    try {
      const res = await api.get('/sumbangan');
      setSumbanganList(res.data);
    } catch (error) {
      console.error("Gagal mengambil data sumbangan");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSumbangan();
  }, []);

  // 2. Fungsi Hapus Data
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Apakah anda yakin?',
      text: "Data yang dihapus tidak bisa dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/sumbangan/${id}`);
        Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success');
        fetchSumbangan(); // Refresh list setelah hapus
      } catch (error) {
        Swal.fire('Gagal!', 'Gagal menghapus data.', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/sumbangan', formData);
      if (res.status === 201 || res.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil Dicatat!',
          text: `Uang ${formData.tipe} sudah masuk sistem.`,
          timer: 2000,
          showConfirmButton: false,
        });
        setFormData({ nama: '', nominal: '', tipe: 'Infaq' });
        fetchSumbangan(); // Refresh list setelah input baru
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Simpan',
        text: error.response?.data?.message || 'Terjadi kesalahan'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 rounded-3xl p-8 text-white shadow-xl">
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Uang Sumbangan</h1>
          <p className="text-purple-200 mt-1 text-sm">Input dan kelola riwayat sumbangan warga</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Kolom Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <h2 className="font-bold text-stone-800 mb-6 flex items-center gap-2"><span>📝</span> Form Pencatatan</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                {Object.keys(kategoriConfig).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData({ ...formData, tipe: key })}
                    className={`p-4 rounded-2xl border-2 transition-all text-left ${
                      formData.tipe === key ? `${kategoriConfig[key].light} border-current ring-2 ring-purple-100` : 'bg-white border-stone-50 text-stone-400 opacity-60'
                    }`}
                  >
                    <div className="text-2xl mb-1">{kategoriConfig[key].icon}</div>
                    <div className="font-bold text-sm uppercase">{key}</div>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <input 
                  type="text" required value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  className="w-full bg-stone-50 p-4 rounded-xl border border-stone-100 outline-none"
                  placeholder="Nama Pemberi"
                />
                <div className="relative">
                  <span className="absolute left-4 top-4 font-bold text-stone-400">Rp</span>
                  <input 
                    type="number" required value={formData.nominal}
                    onChange={(e) => setFormData({...formData, nominal: e.target.value})}
                    className="w-full bg-stone-50 p-4 pl-12 rounded-xl border border-stone-100 outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              <button disabled={loading} className={`w-full py-4 rounded-2xl text-white font-bold bg-gradient-to-r ${kategoriConfig[formData.tipe].bg}`}>
                {loading ? 'Memproses...' : `Simpan Sumbangan ${formData.tipe}`}
              </button>
            </form>
          </div>

          {/* TABLE LIST SUMBANGAN */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-stone-50 flex justify-between items-center">
              <h2 className="font-bold text-stone-800">Riwayat Masuk</h2>
              <span className="text-xs font-medium text-stone-400">{sumbanganList.length} Data tercatat</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-stone-50 text-stone-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Pemberi</th>
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4">Nominal</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50 text-sm">
                  {fetching ? (
                    <tr><td colSpan="4" className="text-center py-10 text-stone-400">Loading data...</td></tr>
                  ) : sumbanganList.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-10 text-stone-400">Belum ada data.</td></tr>
                  ) : (
                    sumbanganList.map((item) => (
                      <tr key={item._id} className="hover:bg-stone-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-stone-800">
                          {item.nama}
                          <div className="text-[10px] text-stone-400 font-normal">{formatTanggal(item.tanggal)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${kategoriConfig[item.tipe]?.light || 'bg-gray-100 text-gray-600'}`}>
                            {item.tipe}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600">Rp {item.nominal.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleDelete(item._id)}
                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className={`rounded-2xl p-6 border-2 transition-all ${kategoriConfig[formData.tipe].light}`}>
            <div className="text-3xl mb-3">{kategoriConfig[formData.tipe].icon}</div>
            <h3 className="font-bold text-lg uppercase">Info Kategori</h3>
            <p className="text-sm mt-2 opacity-80">{kategoriConfig[formData.tipe].desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}