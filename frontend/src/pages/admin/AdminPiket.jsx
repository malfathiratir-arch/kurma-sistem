import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import Swal from "sweetalert2";
import { formatTanggal } from "../../utils/helpers";
import {
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  UserPlusIcon,
  XMarkIcon,
  CheckIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import * as XLSX from "xlsx";

export default function AdminPiket() {
  const [piketGroups, setPiketGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [tanggalPiket, setTanggalPiket] = useState("");
  const [petugasInputs, setPetugasInputs] = useState([
    { nis: "", nama: "", rombel: "", rayon: "", gender: "Ikhwan", tugas: "" },
  ]);

  // --- Fungsi Fetch Data ---
  const fetchPiket = async () => {
    setLoading(true);
    try {
      const response = await api.get("/piket");
      setPiketGroups(response.data);
    } catch (err) {
      console.error("Gagal memuat data piket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPiket();
  }, []);

  // --- Logika Modal & Form ---
  const openModal = (group = null) => {
    if (group) {
      setSelectedId(group._id);
      setTanggalPiket(group.tanggal.split("T")[0]);
      setPetugasInputs(group.petugas);
    } else {
      setSelectedId(null);
      setTanggalPiket("");
      setPetugasInputs([
        { nis: "", nama: "", rombel: "", rayon: "", gender: "Ikhwan", tugas: "" },
      ]);
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (index, event) => {
    const values = [...petugasInputs];
    values[index][event.target.name] = event.target.value;
    setPetugasInputs(values);
  };

  const tambahBaris = () => {
    setPetugasInputs([
      ...petugasInputs,
      { nis: "", nama: "", rombel: "", rayon: "", gender: "Ikhwan", tugas: "" },
    ]);
  };

  const hapusBaris = (index) => {
    const values = [...petugasInputs];
    values.splice(index, 1);
    setPetugasInputs(values);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { tanggal: tanggalPiket, petugas: petugasInputs };

    try {
      if (selectedId) {
        await api.put(`/piket/${selectedId}`, payload);
        Swal.fire("Berhasil", "Paket piket diperbarui", "success");
      } else {
        await api.post("/piket", payload);
        Swal.fire("Berhasil", "Paket piket ditambahkan", "success");
      }
      setIsModalOpen(false);
      fetchPiket();
    } catch (err) {
      Swal.fire("Error", "Gagal menyimpan data", "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Hapus Paket?",
      text: "Seluruh daftar petugas dalam paket ini akan terhapus!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7c3aed",
      confirmButtonText: "Ya, Hapus",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/piket/${id}`);
        Swal.fire("Terhapus", "Paket berhasil dihapus", "success");
        fetchPiket();
      } catch (err) {
        Swal.fire("Gagal", "Gagal menghapus data", "error");
      }
    }
  };

  const exportToExcel = () => {
  // 1. Siapkan data yang akan di-export
  // Kita perlu meratakan (flatten) data karena 1 grup punya banyak petugas
  const rows = piketGroups.flatMap((group) =>
    group.petugas.map((p) => ({
      Tanggal: group.tanggal.split("T")[0],
      NIS: p.nis,
      Nama: p.nama,
      Tugas: p.tugas || "Umum",
      Rombel: p.rombel,
      Rayon: p.rayon,
      Gender: p.gender,
    }))
  );

  // 2. Buat worksheet dari data JSON
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // 3. Buat workbook baru
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Jadwal Piket");

  // 4. Generate file Excel dan download
  XLSX.writeFile(workbook, `Jadwal_Piket_${new Date().toISOString().split('T')[0]}.xlsx`);
};

  
  return (
    <div className="animate-fade-in space-y-6 pb-10 w-full px-4 sm:px-0">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Manajemen Paket Piket
          </h1>
          <p className="text-purple-200 mt-1 text-sm">
            Kelola kelompok piket Masjid AL-Ikram
          </p>
        </div>
        <button
    onClick={exportToExcel}
    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl flex items-center justify-center gap-2 transition-all font-semibold shadow-lg"
  >
    <ArrowDownTrayIcon className="w-5 h-5" /> Export Excel
  </button>
        <button
          onClick={() => openModal()}
          className="w-full sm:w-auto bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 px-5 py-2.5 rounded-2xl flex items-center justify-center gap-2 transition-all font-semibold"
        >
          <PlusIcon className="w-5 h-5" /> Tambah Paket
        </button>
      </div>

      {/* List Paket Piket */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <p className="text-center col-span-full py-10 text-gray-400 italic">
            Memuat data...
          </p>
        ) : (
          piketGroups.map((group) => (
            <div
              key={group._id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  {/* Menampilkan format tanggal jika ada fungsi formatTanggal, jika tidak, pakai group.tanggal */}
                  <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">Tanggal Piket</span>
                  <h3 className="text-lg font-bold text-gray-800">{group.tanggal.split('T')[0]}</h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openModal(group)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(group._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

             {/* Cari bagian group.petugas.map di dalam List Paket Piket */}
<div className="space-y-3">
  {group.petugas.map((p, idx) => (
    <div
      key={idx}
      className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 border border-gray-100 rounded-2xl gap-2 sm:gap-0"
    >
      <div className="flex flex-col">
        {/* MENAMPILKAN NIS DAN NAMA */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
            {p.nis || "N/A"}
          </span>
          <span className="font-bold text-gray-700">{p.nama}</span>
        </div>
        
        <span className="text-gray-500 text-xs mt-0.5">
          {p.rombel} • {p.rayon} ({p.gender === "Ikhwan" ? "Ik" : "Ak"})
        </span>
      </div>

      {/* LABEL TUGAS */}
      <div className="mt-1 sm:mt-0">
        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold border border-orange-200 inline-block shadow-sm">
          🧹 {p.tugas || "Umum"}
        </span>
      </div>
    </div>
  ))}
</div>
            </div>
          ))
        )}
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-up">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {selectedId ? "✏️ Edit Paket" : "✨ Paket Baru"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto p-6 space-y-6"
            >
              <div className="w-full sm:w-1/3">
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={tanggalPiket}
                  onChange={(e) => setTanggalPiket(e.target.value)}
                  required
                  className="w-full p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-violet-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-700 uppercase text-xs tracking-widest">
                    Daftar Santri Petugas
                  </h3>
                  <button
                    type="button"
                    onClick={tambahBaris}
                    className="text-sm text-violet-600 font-bold flex items-center gap-1 hover:text-violet-800 transition-colors"
                  >
                    <UserPlusIcon className="w-5 h-5" /> Tambah Baris
                  </button>
                </div>

                <div className="space-y-3">
                  {petugasInputs.map((input, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100"
                    >
                      <div className="hidden sm:block sm:col-span-1 text-center font-bold text-gray-300">
                        {index + 1}
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          name="nis"
                          placeholder="NIS"
                          value={input.nis}
                          onChange={(e) => handleInputChange(index, e)}
                          className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-violet-200 outline-none"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <input
                          name="nama"
                          placeholder="Nama Lengkap"
                          value={input.nama}
                          onChange={(e) => handleInputChange(index, e)}
                          className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-violet-200 outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          name="tugas"
                          placeholder="Tugas (Nyapu, dll)"
                          value={input.tugas}
                          onChange={(e) => handleInputChange(index, e)}
                          className="w-full p-2 rounded-lg border border-orange-200 bg-orange-50 focus:ring-2 focus:ring-orange-200 outline-none font-medium"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          name="rombel"
                          placeholder="Rombel"
                          value={input.rombel}
                          onChange={(e) => handleInputChange(index, e)}
                          className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-violet-200 outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          name="rayon"
                          placeholder="Rayon"
                          value={input.rayon}
                          onChange={(e) => handleInputChange(index, e)}
                          className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-violet-200 outline-none"
                        />
                      </div>
                      <div className="sm:col-span-1 text-right">
                        {petugasInputs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => hapusBaris(index)}
                            className="text-red-400 hover:text-red-600 p-2"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <button
                  type="submit"
                  className="flex-1 bg-violet-600 text-white py-3.5 rounded-2xl font-bold hover:bg-violet-700 transition-all flex justify-center items-center gap-2 shadow-lg shadow-violet-200"
                >
                  <CheckIcon className="w-5 h-5" /> Simpan Paket
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-600 py-3.5 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}