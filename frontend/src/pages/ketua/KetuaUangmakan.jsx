import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Swal from 'sweetalert2';

export default function KetuaUangmakan() {
  const HARGA = 18000;

  const hitungJumlahOrang = (text) => {
    return text
      .split('\n')
      .filter(line => line.trim() !== '' && line.match(/^\d+\./)).length;
  };

  const [list, setList] = useState([]);
  const [form, setForm] = useState({ nama: '1. ', nominal: '', kelas: '' }); 
  const [isEditing, setIsEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};

  const fetchData = async () => {
    try {
      const res = await api.get('/uang-makan');
      setList(res.data);
    } catch (err) { 
      console.error("Gagal ambil data", err); 
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const myDataOnly = list.filter(item => item.userId === currentUser._id);
  const totalUang = myDataOnly.reduce((acc, curr) => acc + (Number(curr.nominal) || 0), 0);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      const lines = value.substring(0, start).split('\n');
      const lastLine = lines[lines.length - 1];
      const match = lastLine.match(/^(\d+)\. /); 

      let nextNumber = "\n1. "; 
      if (match) {
        nextNumber = `\n${parseInt(match[1]) + 1}. `;
      }

      const newValue = value.substring(0, start) + nextNumber + value.substring(end);
      
      // Hitung otomatis nominal berdasarkan jumlah baris bernomor
      const jumlahOrang = hitungJumlahOrang(newValue);
      const totalNominal = jumlahOrang * HARGA;

      setForm({ 
        ...form, 
        nama: newValue,
        nominal: totalNominal 
      });

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + nextNumber.length;
      }, 0);
    }
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataSimpan = {
        ...form,
        nama: form.nama.trim(),
        nominal: Number(form.nominal),
        userId: currentUser._id 
      };

      if (isEditing) {
        await api.put(`/uang-makan/${isEditing}`, dataSimpan);
        Swal.fire('Berhasil!', 'Data diperbarui', 'success');
      } else {
        await api.post('/uang-makan', dataSimpan);
        Swal.fire('Berhasil!', 'Data dicatat', 'success');
      }

      setForm({ nama: '1. ', nominal: '', kelas: '' }); 
      setIsEditing(null);
      fetchData();
    } catch (err) {
      Swal.fire('Gagal', 'Terjadi kesalahan saat menyimpan', 'error');
    } finally { 
      setLoading(false); 
    }
  };

  const handleEdit = (item) => {
    setForm({ nama: item.nama, nominal: item.nominal, kelas: item.kelas });
    setIsEditing(item._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHapus = async (id) => {
    const confirm = await Swal.fire({
      title: 'Yakin hapus?',
      text: "Data yang dihapus tidak bisa dikembalikan",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/uang-makan/${id}`);
        fetchData();
        Swal.fire('Terhapus!', 'Data riwayat Anda telah dihapus.', 'success');
      } catch (err) {
        Swal.fire('Gagal', 'Terjadi kesalahan saat menghapus', 'error');
      }
    }
  };

  return (
    <div className="p-4 space-y-6 pb-20 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-50">
        <h2 className="font-bold text-gray-700 mb-4">
          {isEditing ? '📝 Edit Data Riwayat' : '➕ Tambah Uang Makan'}
        </h2>
        <form onSubmit={handleSimpan} className="space-y-4">
          <input 
            placeholder="Kelas" 
            className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-orange-200" 
            value={form.kelas} 
            onChange={e => setForm({...form, kelas: e.target.value})} 
            required 
          />
          <textarea 
            placeholder="Ketik nama-nama siswa (Enter untuk nomor otomatis)..." 
            className="w-full p-3 bg-gray-50 rounded-xl min-h-[150px] font-mono outline-none focus:ring-2 ring-orange-200" 
            value={form.nama} 
            onKeyDown={handleKeyDown} 
            onChange={e => setForm({...form, nama: e.target.value})} 
            required 
          />
          <div className="relative">
            <input 
              type="number" 
              placeholder="Nominal (Total)" 
              className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-orange-200" 
              value={form.nominal} 
              onChange={e => setForm({...form, nominal: e.target.value})} 
              required 
            />
            <span className="absolute right-3 top-3 text-[10px] text-orange-500 font-bold">Rp {HARGA}/org</span>
          </div>
          <button 
            disabled={loading} 
            className={`w-full py-4 rounded-xl font-bold text-white shadow-md transition-all active:scale-95 ${isEditing ? 'bg-blue-600' : 'bg-orange-600'}`}
          >
            {loading ? 'Menyimpan...' : (isEditing ? 'Perbarui Data' : 'Simpan ke Riwayat Saya')}
          </button>
          {isEditing && (
            <button 
              type="button" 
              onClick={() => { setIsEditing(null); setForm({nama: '1. ', nominal: '', kelas: ''}); }} 
              className="w-full py-2 text-gray-400 text-sm hover:underline"
            >
              Batal Edit
            </button>
          )}
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-80">Riwayat Kelolaan Saya</p>
            <p className="text-xs">{myDataOnly.length} Data tersimpan</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold opacity-80">Total Uang</p>
            <p className="text-xl font-black">Rp {totalUang.toLocaleString('id-ID')}</p>
          </div>
        </div>

        <div className="divide-y max-h-[500px] overflow-y-auto">
          {myDataOnly.length > 0 ? (
            myDataOnly.map((item, index) => (
              <div key={item._id} className="p-4 flex justify-between items-start hover:bg-blue-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded mt-1">{index + 1}</span>
                    <div>
                      <p className="font-bold text-gray-800 text-sm whitespace-pre-line leading-relaxed">
                        {item.nama}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase">
                          {item.kelas}
                        </span>
                      </div>
                      <p className="text-sm text-indigo-600 font-black mt-1">
                        Rp {Number(item.nominal).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-1">
                  <button onClick={() => handleEdit(item)} className="text-blue-500 hover:scale-125 transition-all p-1">✏️</button>
                  <button onClick={() => handleHapus(item._id)} className="text-red-400 hover:scale-125 transition-all p-1">🗑️</button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-gray-400 text-sm italic">
              Belum ada data yang Anda tambahkan.
            </div>
          )}
        </div>
        
        <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
          <span className="text-sm font-bold text-gray-600">Total Keseluruhan</span>
          <span className="text-sm font-black text-indigo-600">Rp {totalUang.toLocaleString('id-ID')}</span>
        </div>
      </div>
    </div>
  );
}