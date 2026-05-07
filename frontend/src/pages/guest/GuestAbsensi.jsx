import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  ClipboardList,
  Users,
  Sparkles,
  Search,
  Filter,
} from "lucide-react";

// helper
const CLASS_ORDER = { X: 0, XI: 1, XII: 2 };

function groupByKelasRombel(data) {
  const map = {};
  data.forEach((item) => {
    const key = `${item.kelas}||${item.rombel}`;
    if (!map[key]) {
      map[key] = { kelas: item.kelas, rombel: item.rombel, students: [] };
    }
    map[key].students.push(item);
  });

  return Object.values(map).sort((a, b) => {
    const ko =
      (CLASS_ORDER[a.kelas] ?? 9) - (CLASS_ORDER[b.kelas] ?? 9);
    return ko !== 0 ? ko : a.rombel.localeCompare(b.rombel);
  });
}

export default function GuestAbsensi() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [kelas, setKelas] = useState("Semua");
  const [gender, setGender] = useState("Semua");
  const [searchRombel, setSearchRombel] = useState("");
  const [searchNama, setSearchNama] = useState("");

  useEffect(() => {
    api
      .get("/absensi")
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const groups = groupByKelasRombel(data)
    .filter((g) => {
      if (kelas !== "Semua" && g.kelas !== kelas) return false;
      if (
        searchRombel &&
        !g.rombel.toLowerCase().includes(searchRombel.toLowerCase())
      )
        return false;
      return true;
    })
    .map((g) => {
      let students = g.students;

      if (gender !== "Semua") {
        students = students.filter((s) => s.gender === gender);
      }

      if (searchNama) {
        students = students.filter((s) =>
          s.nama.toLowerCase().includes(searchNama.toLowerCase())
        );
      }

      return { ...g, students };
    });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* HEADER */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-stone-800 flex items-center justify-center gap-3">
          <ClipboardList className="text-kurma-600" size={36} />
          <div className="uppercase tracking-tighter dark:text-white">
            Data Absensi Siswa
          </div>
        </h1>
        <p className="text-stone-500 mt-2 font-medium">
          Monitoring Kehadiran Siswa
        </p>
      </div>

      {/* FILTER */}
      <div className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm mb-8 space-y-4">
        <div className="flex flex-wrap gap-3">

          {/* Search Rombel */}
          <div className="flex items-center gap-2 bg-stone-50 px-3 py-2 rounded-xl flex-1">
            <Search size={16} className="text-stone-400" />
            <input
              placeholder="Cari rombel..."
              className="bg-transparent outline-none text-sm w-full"
              value={searchRombel}
              onChange={(e) => setSearchRombel(e.target.value)}
            />
          </div>

          {/* Search Nama */}
          <div className="flex items-center gap-2 bg-stone-50 px-3 py-2 rounded-xl flex-1">
            <Search size={16} className="text-stone-400" />
            <input
              placeholder="Cari nama..."
              className="bg-transparent outline-none text-sm w-full"
              value={searchNama}
              onChange={(e) => setSearchNama(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">

          {/* Kelas */}
          {["Semua", "X", "XI", "XII"].map((k) => (
            <button
              key={k}
              onClick={() => setKelas(k)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                kelas === k
                  ? "bg-kurma-600 text-white"
                  : "bg-stone-100 text-stone-500"
              }`}
            >
              {k === "Semua" ? "Semua Kelas" : `Kelas ${k}`}
            </button>
          ))}

          {/* Gender */}
          {[
            { val: "Semua", label: "L + P" },
            { val: "L", label: "Laki" },
            { val: "P", label: "Perempuan" },
          ].map((g) => (
            <button
              key={g.val}
              onClick={() => setGender(g.val)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                gender === g.val
                  ? "bg-stone-800 text-white"
                  : "bg-stone-100 text-stone-500"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin h-8 w-8 border-t-2 border-kurma-600 rounded-full mx-auto"></div>
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center text-stone-400">
          Tidak ada data
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <div
              key={g.kelas + g.rombel}
              className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden"
            >
              {/* HEADER CARD */}
              <div className="bg-stone-50 px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-lg text-stone-800">
                    Kelas {g.kelas} - {g.rombel}
                  </h2>
                  <p className="text-xs text-stone-400">
                    {g.students.length} siswa
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs bg-white px-3 py-1 rounded-full border">
                  <Users size={14} />
                  {g.students.length}
                </div>
              </div>

              {/* LIST SISWA */}
              <div className="p-4 space-y-3">
                {g.students.length === 0 ? (
                  <p className="text-sm text-stone-400 text-center">
                    Tidak ada siswa
                  </p>
                ) : (
                  g.students.map((s, i) => (
                    <div
                      key={s._id}
                      className="flex items-center justify-between p-3 rounded-xl border bg-stone-50"
                    >
                      <div>
                        <p className="font-bold text-sm">{s.nama}</p>
                        <p className="text-xs text-stone-400">
                          {s.rayon}
                        </p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          s.gender === "L"
                            ? "bg-blue-600 text-white"
                            : "bg-rose-600 text-white"
                        }`}
                      >
                        {s.gender === "L" ? "Laki" : "Perempuan"}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* dekor */}
              <div className="absolute right-0 bottom-0 opacity-[0.03] p-4 pointer-events-none">
                <Sparkles size={100} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 