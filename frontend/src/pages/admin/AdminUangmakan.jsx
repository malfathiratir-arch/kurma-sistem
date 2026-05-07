import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

export default function AdminUangmakan() {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fungsi ambil data dari server
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/uang-makan');
      setAllData(res.data);
    } catch (err) {
      console.error("Gagal ambil data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // FITUR 1: Hapus Satu Per Satu
  const handleHapus = async (id) => {
    const confirm = await Swal.fire({
      title: 'Yakin hapus data ini?',
      text: "Data akan hilang permanen dari rekap.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/uang-makan/${id}`);
        fetchData(); // Refresh tabel
        Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success');
      } catch (err) {
        Swal.fire('Gagal', 'Gagal menghapus data satuan.', 'error');
      }
    }
  };

  // FITUR 2: Hapus Semua (Bulk Delete)
  const handleHapusSemua = async () => {
    const { value: confirmText } = await Swal.fire({
      title: 'KOSONGKAN SEMUA DATA?',
      text: "Tindakan ini tidak bisa dibatalkan. Ketik 'HAPUS' untuk mengonfirmasi.",
      icon: 'danger',
      input: 'text',
      inputPlaceholder: 'Ketik HAPUS di sini...',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'KOSONGKAN SEKARANG',
      cancelButtonText: 'Batal',
    });

    if (confirmText === 'HAPUS') {
      try {
        // Sesuaikan endpoint backend kamu (biasanya /all atau /bulk)
        await api.delete('/uang-makan/all/bulk'); 
        fetchData();
        Swal.fire('Bersih!', 'Semua data rekap telah dihapus.', 'success');
      } catch (err) {
        Swal.fire('Gagal', 'Server menolak permintaan hapus masal.', 'error');
      }
    } else if (confirmText !== undefined) {
      Swal.fire('Gagal', 'Kata konfirmasi tidak sesuai.', 'error');
    }
  };

  // FITUR 3: Export ke Excel
  const downloadExcel = () => {
    if (allData.length === 0) return Swal.fire('Kosong', 'Tidak ada data untuk di-export', 'info');

    const dataExport = allData.map((item, index) => ({
      No: index + 1,
      Tanggal: new Date(item.createdAt || Date.now()).toLocaleDateString('id-ID'),
      Kelas: item.kelas,
      Nama_Siswa: item.nama,
      Nominal: item.nominal,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Uang Makan");
    XLSX.writeFile(workbook, `Laporan_Uang_Makan_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      {/* Header & Tombol Aksi */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl shadow-sm gap-4 border border-gray-50">
        <div>
          <h2 className="font-black text-2xl text-gray-800 tracking-tight">Rekap Keuangan</h2>
          <p className="text-sm text-gray-400 font-medium">Total: {allData.length} data tersimpan</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          {allData.length > 0 && (
            <button 
              onClick={handleHapusSemua} 
              className="flex-1 md:flex-none bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2.5 rounded-2xl font-bold transition-all text-sm flex items-center justify-center gap-2"
            >
              🗑️ Hapus Semua
            </button>
          )}
          <button 
            onClick={downloadExcel} 
            className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-100"
          >
            📊 Export Excel
          </button>
        </div>
      </div>

      {/* Tabel Data */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-[11px] uppercase text-gray-400 font-black tracking-widest border-b border-gray-50">
              <tr>
                <th className="p-5 text-center w-16">No</th>
                <th className="p-5">Kelas</th>
                <th className="p-5">Rincian Nama Siswa</th>
                <th className="p-5">Total Nominal</th>
                <th className="p-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-gray-100 border-t-emerald-500 rounded-full animate-spin" />
                      <p className="text-sm text-gray-400 font-bold animate-pulse">Sinkronisasi Data...</p>
                    </div>
                  </td>
                </tr>
              ) : allData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center text-gray-400 italic text-sm">
                    Belum ada riwayat uang makan yang tersimpan.
                  </td>
                </tr>
              ) : (
                allData.map((item, index) => (
                  <tr key={item._id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="p-5 text-center text-gray-400 font-medium text-sm">{index + 1}</td>
                    <td className="p-5">
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-xl text-xs font-black uppercase">
                        {item.kelas}
                      </span>
                    </td>
                    <td className="p-5">
                      <p className="text-gray-700 text-sm font-bold whitespace-pre-line leading-relaxed">
                        {item.nama}
                      </p>
                    </td>
                    <td className="p-5">
                      <p className="font-black text-gray-900">
                        Rp {item.nominal.toLocaleString('id-ID')}
                      </p>
                    </td>
                    <td className="p-5 text-center">
                      <button 
                        onClick={() => handleHapus(item._id)}
                        className="bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white p-2.5 rounded-xl transition-all active:scale-90"
                        title="Hapus Data"
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
      
      <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">
        Panel Admin • Kurma System 2026
      </p>
    </div>
  );
}