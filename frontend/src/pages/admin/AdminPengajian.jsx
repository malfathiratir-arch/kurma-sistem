import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { formatTanggal, getStatusBadge } from "../../utils/helpers";
import toast from "react-hot-toast";

const getEmptyForm = () => ({
  tanggal: "",
  tema: "",
  lokasi: "Aula Utama",
  status: "upcoming",
  daftarKelas: "",
  jadwal: [],
  panitia: [],
  petugas: [],
  pendamping: [],
  pembimbing: [],
  pembagianRuang: [],
});
const ListInput = ({
  items,
  field,
  input,
  setInput,
  fields,
  addItem,
  removeItem,
}) => (
  <div>
    <div className="space-y-1.5 mb-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-2 bg-stone-50 border border-stone-100 rounded-xl p-2.5 text-sm"
        >
          <span className="flex-1 font-medium text-stone-700">
            {item.nama || item.kegiatan || item.namaRuang}
          </span>
          <span className="text-stone-400 text-xs">
            {item.jabatan || item.tugas || item.keterangan || item.kelas}
          </span>
          {item.pendamping && (
            <span className="text-stone-400 text-xs">· {item.pendamping}</span>
          )}
          <button
            type="button"
            onClick={() => removeItem(field, i)}
            className="text-red-400 hover:text-red-600 text-xs ml-1"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
    <div className="flex gap-2">
      {fields.map((f) => (
        <input
          key={f.key}
          type={f.type || "text"}
          className={`input-field text-sm ${f.width || "flex-1"}`}
          placeholder={f.placeholder}
          value={input[f.key] || ""} // Tambahkan fallback string kosong
          onChange={(e) =>
            setInput((prev) => ({ ...prev, [f.key]: e.target.value }))
          }
        />
      ))}
      <button
        type="button"
        onClick={() =>
          addItem(field, input, () =>
            setInput(Object.fromEntries(fields.map((f) => [f.key, ""]))),
          )
        }
        className="btn-secondary px-3 text-lg"
      >
        +
      </button>
    </div>
  </div>
);
export default function AdminPengajian() {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(getEmptyForm());
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  const [jadwalInput, setJadwalInput] = useState({
    waktu: "",
    kegiatan: "",
    keterangan: "",
  });
  const [panitiaInput, setPanitiaInput] = useState({
    nama: "",
    kelas: "",
    jabatan: "",
  });
  const [petugasInput, setPetugasInput] = useState({
    nama: "",
    kelas: "",
    tugas: "",
  });
  const [pendampingInput, setPendampingInput] = useState({
    nama: "",
    jabatan: "",
  });
  const [pembimbingInput, setPembimbingInput] = useState({
    nama: "",
    jabatan: "",
  });
  const [ruangInput, setRuangInput] = useState({
    namaRuang: "",
    kelas: "",
    pendamping: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/pengajian");
      setList(res.data);
      if (res.data.length > 0 && !selected) setSelected(res.data[0]);
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

  const openCreate = () => {
    setForm(getEmptyForm()); // Tambahkan tanda kurung ()
    setEditMode(false);
    setActiveTab("info");
    setShowForm(true);
  };

 const openEdit = (p) => {
  setForm({
    ...p,
    // Pastikan format tanggal YYYY-MM-DD agar input type="date" muncul
    tanggal: p.tanggal ? p.tanggal.split("T")[0] : "",
    
    // Ubah array ['X', 'Y'] jadi string "X, Y" agar bisa diedit di textarea/input
    daftarKelas: Array.isArray(p.daftarKelas) ? p.daftarKelas.join(", ") : p.daftarKelas || "",

    // PROTEKSI: Pastikan semua field array diinisialisasi sebagai array kosong 
    // jika data dari database ternyata null/undefined
    jadwal: p.jadwal || [],
    panitia: p.panitia || [],
    petugas: p.petugas || [],
    pendamping: p.pendamping || [],
    pembimbing: p.pembimbing || [],
    pembagianRuang: p.pembagianRuang || [],
  });
  
  setEditMode(true);
  setActiveTab("info");
  setShowForm(true);
};

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.tanggal || !form.tema)
      return toast.error("Tanggal dan Tema wajib diisi!");

    setSaving(true);
    try {
      // Sanitasi daftarKelas agar lebih bersih
      const kelasArray =
        typeof form.daftarKelas === "string"
          ? form.daftarKelas
              .split(",")
              .map((k) => k.trim())
              .filter((k) => k !== "")
          : Array.isArray(form.daftarKelas)
            ? form.daftarKelas
            : [];

      const payload = { ...form, daftarKelas: kelasArray };

      if (editMode) {
        await api.put(`/pengajian/${form._id}`, payload);
        toast.success("Pengajian diperbarui!");
      } else {
        const { _id, ...newPayload } = payload;
        const res = await api.post("/pengajian", newPayload);
        toast.success("Pengajian ditambahkan!");
        // Opsional: Langsung pilih item yang baru dibuat
        if (res.data) setSelected(res.data);
      }

      setShowForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus pengajian ini?")) return;
    try {
      await api.delete(`/pengajian/${id}`);
      toast.success("Pengajian dihapus");
      setSelected(null);
      fetchData();
    } catch {
      toast.error("Gagal menghapus");
    }
  };

  const addItem = (field, item, reset) => {
    // Cek apakah minimal ada satu field yang diisi
    if (Object.values(item).every((v) => v === "")) {
      return toast.error("Isi data terlebih dahulu");
    }

    setForm((f) => ({
      ...f,
      // Gunakan (f[field] || []) agar tidak error saat spread
      [field]: [...(f[field] || []), { ...item }],
    }));

    reset(); // Ini akan menjalankan setInput ke kosong kembali
  };

  const removeItem = (field, idx) =>
    setForm((f) => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));

  const tabs = [
    { id: "info", label: "📋 Info Dasar" },
    { id: "ruang", label: "🏫 Pembagian Ruang" },
    { id: "jadwal", label: "⏰ Jadwal" },
    { id: "panitia", label: "👔 Panitia & Petugas" },
    { id: "pendamping", label: "👤 Pendamping" },
  ];

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="loading-spinner text-purple-600 w-10 h-10 border-4" />
        <p className="text-stone-400 text-sm">Memuat data...</p>
      </div>
    );

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">
            🌙 Pengajian Malam
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Kelola semua data pengajian termasuk pembagian ruang, pendamping &
            pembimbing
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          + Tambah
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-800">
                {editMode ? "✏️ Edit" : "➕ Tambah"} Pengajian
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-stone-400 hover:text-stone-700 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 transition-all"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-stone-100 px-6 gap-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all -mb-px ${
                    activeTab === t.id
                      ? "border-violet-500 text-violet-700"
                      : "border-transparent text-stone-400 hover:text-stone-600"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSave}>
              <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
                {/* Tab: Info Dasar */}
                {activeTab === "info" && (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Tanggal *</label>
                        <input
                          type="date"
                          className="input-field"
                          value={form.tanggal}
                          onChange={(e) =>
                            setForm({ ...form, tanggal: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Status</label>
                        <select
                          className="input-field"
                          value={form.status}
                          onChange={(e) =>
                            setForm({ ...form, status: e.target.value })
                          }
                        >
                          <option value="upcoming">Akan Datang</option>
                          <option value="ongoing">Berlangsung</option>
                          <option value="selesai">Selesai</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="label">Tema *</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Tema pengajian malam ini..."
                        value={form.tema}
                        onChange={(e) =>
                          setForm({ ...form, tema: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Lokasi Utama</label>
                      <input
                        type="text"
                        className="input-field"
                        value={form.lokasi}
                        onChange={(e) =>
                          setForm({ ...form, lokasi: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="label">Daftar Kelas (pisah koma)</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="XI IPA 1, XI IPA 2, XI IPS 1"
                        value={form.daftarKelas}
                        onChange={(e) =>
                          setForm({ ...form, daftarKelas: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}

               {/* Tab: Pembagian Ruang */}
{activeTab === "ruang" && (
  <div className="space-y-3">
    {/* Menggunakan p-3 di HP dan p-4 di Desktop agar lebih lega */}
    <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 sm:p-4">
      <div className="mb-3">
        <p className="text-xs font-semibold text-violet-700 mb-1">
          🏫 Pembagian Ruang Pengajian Malam
        </p>
        <p className="text-[10px] sm:text-xs text-violet-500">
          Tentukan kelas mana yang berada di ruang mana beserta
          pendampingnya
        </p>
      </div>

      {/* Kontainer Responsif: 
          1. Di HP, jika input terlalu lebar, akan bisa di-scroll ke samping.
          2. Menghilangkan scrollbar agar tetap rapi. 
      */}
      <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
        <div className="min-w-[450px] sm:min-w-full">
          <ListInput
            items={form.pembagianRuang}
            field="pembagianRuang"
            input={ruangInput}
            setInput={setRuangInput}
            addItem={addItem} 
            removeItem={removeItem} 
            fields={[
              {
                key: "namaRuang",
                placeholder: "Nama ruang (mis: Aula A)",
                // Tetap mempertahankan fleksibilitas lebar
              },
              { 
                key: "kelas", 
                placeholder: "Kelas", 
                width: "w-24 sm:w-32" // Lebih ramping di HP
              },
              {
                key: "pendamping",
                placeholder: "Pendamping",
                width: "w-28 sm:w-36", // Lebih ramping di HP
              },
            ]}
          />
        </div>
      </div>
      
      {/* Label bantuan khusus HP jika tabel bisa di-scroll */}
      <p className="text-[9px] text-stone-400 mt-2 block sm:hidden">
        * Geser ke samping untuk melihat kolom lainnya
      </p>
    </div>
  </div>
)}

                {/* Tab: Jadwal */}
                {activeTab === "jadwal" && (
                  <div>
                    <label className="label">📋 Jadwal Kegiatan</label>
                    <div className="space-y-1.5 mb-3">
                      {form.jadwal.map((j, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 bg-stone-50 border border-stone-100 rounded-xl p-2.5 text-sm"
                        >
                          <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded-lg font-mono text-xs font-bold">
                            {j.waktu}
                          </span>
                          <span className="flex-1 text-stone-700">
                            {j.kegiatan}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem("jadwal", i)}
                            className="text-red-400 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="time"
                        className="input-field w-28 text-sm"
                        value={jadwalInput.waktu}
                        onChange={(e) =>
                          setJadwalInput({
                            ...jadwalInput,
                            waktu: e.target.value,
                          })
                        }
                      />
                      <input
                        type="text"
                        className="input-field flex-1 text-sm"
                        placeholder="Nama kegiatan"
                        value={jadwalInput.kegiatan}
                        onChange={(e) =>
                          setJadwalInput({
                            ...jadwalInput,
                            kegiatan: e.target.value,
                          })
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          addItem("jadwal", jadwalInput, () =>
                            setJadwalInput({
                              waktu: "",
                              kegiatan: "",
                              keterangan: "",
                            }),
                          )
                        }
                        className="btn-secondary px-3 text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab: Panitia & Petugas */}
                {activeTab === "panitia" && (
                  <div className="space-y-5">
                    {/* BAGIAN PANITIA */}
                    <div className="card-input">
                      <label className="label">👔 Panitia</label>
                      <ListInput
                        items={form.panitia}
                        field="panitia"
                        input={panitiaInput}
                        setInput={setPanitiaInput}
                        addItem={addItem} // <--- TAMBAHKAN INI
                        removeItem={removeItem} // <--- TAMBAHKAN INI
                        fields={[
                          { key: "nama", placeholder: "Nama panitia" },
                          {
                            key: "jabatan",
                            placeholder: "Jabatan",
                            width: "w-36",
                          },
                        ]}
                      />
                    </div>

                    {/* BAGIAN PETUGAS */}
                    <div className="card-input">
                      <label className="label">🛠️ Petugas</label>
                      <ListInput
                        items={form.petugas}
                        field="petugas"
                        input={petugasInput}
                        setInput={setPetugasInput}
                        addItem={addItem}
                        removeItem={removeItem}
                        fields={[
                          { key: "nama", placeholder: "Nama petugas" },
                          { key: "tugas", placeholder: "Tugas", width: "w-36" },
                        ]}
                      />
                    </div>
                  </div>
                )}

                {/* Tab: Pendamping (Admin Only) */}
                {activeTab === "pendamping" && (
                  <div className="space-y-5">
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                      <label className="label text-purple-700">
                        👤 Pendamping{" "}
                        <span className="text-xs font-normal text-purple-400 ml-1">
                          (Hanya Admin)
                        </span>
                      </label>
                      <ListInput
                        items={form.pendamping}
                        addItem={addItem}
                        removeItem={removeItem}
                        field="pendamping"
                        input={pendampingInput}
                        setInput={setPendampingInput}
                        fields={[
                          { key: "nama", placeholder: "Nama pendamping" },
                          {
                            key: "jabatan",
                            placeholder: "Jabatan",
                            width: "w-36",
                          },
                        ]}
                      />
                    </div>
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                      <label className="label text-purple-700">
                        📖 Pembimbing{" "}
                        <span className="text-xs font-normal text-purple-400 ml-1">
                          (Hanya Admin)
                        </span>
                      </label>
                      <ListInput
                        items={form.pembimbing}
                        addItem={addItem}
                        removeItem={removeItem}
                        field="pembimbing"
                        input={pembimbingInput}
                        setInput={setPembimbingInput}
                        fields={[
                          { key: "nama", placeholder: "Nama pembimbing" },
                          {
                            key: "jabatan",
                            placeholder: "Jabatan",
                            width: "w-36",
                          },
                        ]}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center gap-3 p-6 border-t border-stone-100 bg-stone-50/50">
                <div className="flex gap-1">
                  {tabs.map((t, i) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                      className={`w-2 h-2 rounded-full transition-all ${activeTab === t.id ? "bg-violet-500 w-5" : "bg-stone-300"}`}
                    />
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-secondary"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <span className="loading-spinner w-4 h-4 border-2" />
                    ) : editMode ? (
                      "💾 Simpan"
                    ) : (
                      "➕ Tambah"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm text-center py-20">
          <div className="text-6xl mb-4">🌙</div>
          <p className="text-stone-500 mb-4 font-medium">Belum ada pengajian</p>
          <button onClick={openCreate} className="btn-primary">
            + Tambah Pengajian
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* List */}
          <div className="space-y-3">
            {list.map((p) => {
              const status = getStatusBadge(p.status);
              return (
                <button
                  key={p._id}
                  onClick={() => handleSelect(p)}
                  className={`w-full text-left bg-white rounded-2xl border p-4 transition-all shadow-sm hover:shadow-md ${
                    selected?._id === p._id
                      ? "ring-2 ring-violet-400 border-violet-200 bg-violet-50/50"
                      : "border-stone-100 hover:border-stone-200"
                  }`}
                >
                  <span className={`badge ${status.class} mb-2`}>
                    {status.label}
                  </span>
                  <p className="font-bold text-stone-800 text-sm leading-tight">
                    {p.tema}
                  </p>
                  <p className="text-xs text-stone-400 mt-1.5">
                    📅 {formatTanggal(p.tanggal)}
                  </p>
                  {p.pembagianRuang?.length > 0 && (
                    <p className="text-xs text-violet-500 mt-1">
                      🏫 {p.pembagianRuang.length} ruang
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Detail */}
          {selected && (
            <div className="md:col-span-2 animate-fade-in">
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <span
                      className={`badge ${getStatusBadge(selected.status).class} mb-2`}
                    >
                      {getStatusBadge(selected.status).label}
                    </span>
                    <h2 className="text-xl font-bold text-stone-800 leading-tight">
                      {selected.tema}
                    </h2>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-stone-500 text-sm">
                        📅 {formatTanggal(selected.tanggal)}
                      </p>
                      <p className="text-stone-400 text-sm">
                        📍 {selected.lokasi}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(selected)}
                      className="btn-secondary text-sm py-1.5 px-3"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(selected._id)}
                      className="btn-danger text-sm py-1.5 px-3"
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </div>

                {selected.daftarKelas?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {selected.daftarKelas.map((k, i) => (
                      <span
                        key={i}
                        className="bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1 rounded-full"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                )}

                {/* Pembagian Ruang */}
                {selected.pembagianRuang?.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">
                      🏫 Pembagian Ruang
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {selected.pembagianRuang.map((r, i) => (
                        <div
                          key={i}
                          className="bg-violet-50 border border-violet-100 rounded-xl p-3"
                        >
                          <p className="font-bold text-violet-800 text-sm">
                            {r.namaRuang}
                          </p>
                          {r.kelas && (
                            <p className="text-xs text-violet-600 mt-0.5">
                              👥 {r.kelas}
                            </p>
                          )}
                          {r.pendamping && (
                            <p className="text-xs text-violet-500 mt-0.5">
                              👤 {r.pendamping}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  {selected.pendamping?.length > 0 && (
                    <div className="bg-purple-50 rounded-xl p-3">
                      <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-2">
                        Pendamping
                      </p>
                      {selected.pendamping.map((pd, i) => (
                        <p
                          key={i}
                          className="text-sm text-stone-700 font-medium"
                        >
                          {pd.nama}
                          {pd.jabatan && (
                            <span className="text-stone-400 font-normal">
                              {" "}
                              · {pd.jabatan}
                            </span>
                          )}
                        </p>
                      ))}
                    </div>
                  )}
                  {selected.pembimbing?.length > 0 && (
                    <div className="bg-purple-50 rounded-xl p-3">
                      <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-2">
                        Pembimbing
                      </p>
                      {selected.pembimbing.map((pb, i) => (
                        <p
                          key={i}
                          className="text-sm text-stone-700 font-medium"
                        >
                          {pb.nama}
                          {pb.jabatan && (
                            <span className="text-stone-400 font-normal">
                              {" "}
                              · {pb.jabatan}
                            </span>
                          )}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {selected.jadwal?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                      ⏰ Jadwal Kegiatan
                    </p>
                    <div className="space-y-1.5">
                      {selected.jadwal.map((j, i) => (
                        <div
                          key={i}
                          className="flex gap-3 items-center text-sm"
                        >
                          <span className="bg-violet-100 text-violet-700 px-2.5 py-1 rounded-lg text-xs font-mono font-bold">
                            {j.waktu}
                          </span>
                          <span className="text-stone-700">{j.kegiatan}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  {selected.panitia?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                        👔 Panitia ({selected.panitia.length})
                      </p>
                      {selected.panitia.map((p, i) => (
                        <p key={i} className="text-sm text-stone-700">
                          {p.nama}{" "}
                          <span className="text-stone-400">· {p.jabatan}</span>
                        </p>
                      ))}
                    </div>
                  )}
                  {selected.petugas?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                        🛠️ Petugas ({selected.petugas.length})
                      </p>
                      {selected.petugas.map((p, i) => (
                        <p key={i} className="text-sm text-stone-700">
                          {p.nama}{" "}
                          <span className="text-stone-400">· {p.tugas}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {selected.komentar?.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-stone-100">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">
                      💬 Komentar ({selected.komentar.length})
                    </p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selected.komentar.map((k, i) => (
                        <div
                          key={i}
                          className="bg-stone-50 rounded-xl p-3 text-sm flex items-start justify-between gap-2"
                        >
                          <div>
                            <p className="text-stone-700">{k.isi}</p>
                            <p className="text-xs text-stone-400 mt-1">
                              {k.nama} · {k.kelas}
                            </p>
                          </div>
                          <button
                            onClick={async () => {
                              try {
                                await api.delete(
                                  `/komentar/${selected._id}/${k._id}`,
                                );
                                setSelected((prev) => ({
                                  ...prev,
                                  komentar: prev.komentar.filter(
                                    (c) => c._id !== k._id,
                                  ),
                                }));
                                toast.success("Komentar dihapus");
                              } catch {
                                toast.error("Gagal");
                              }
                            }}
                            className="text-red-400 hover:text-red-600 text-xs flex-shrink-0"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
