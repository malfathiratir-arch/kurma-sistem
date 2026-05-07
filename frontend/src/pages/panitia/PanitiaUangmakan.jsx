import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import * as XLSX from 'xlsx';

export default function AdminUangmakan() {
  const [allData, setAllData] = useState([]);

  useEffect(() => {
    api.get('/uang-makan').then(res => setAllData(res.data));
  }, []);

 const downloadExcel = () => {
  // Susun data agar rapi di kolom excel
  const dataExport = allData.map((item, index) => ({
    No: index + 1,
    Tanggal: new Date(item.tanggal).toLocaleDateString('id-ID'),
    Kelas: item.kelas,
    Nama_Siswa: item.nama, // Sekarang ini pasti cuma 1 nama per baris
    Nominal: item.nominal,
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Uang Makan");
  XLSX.writeFile(workbook, "Laporan_Uang_Makan.xlsx");
};

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
        <h2 className="font-bold text-xl">Rekap Uang Makan</h2>
        <button onClick={downloadExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold">
          📊 Export ke Excel
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
            <tr>
              <th className="p-4">Kelas</th>
              <th className="p-4">Nama</th>
              <th className="p-4">Nominal</th>
              <th className="p-4">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {allData.map(item => (
              <tr key={item._id}>
                <td className="p-4 font-bold text-orange-600">{item.kelas}</td>
                <td className="p-4">{item.nama}</td>
                <td className="p-4 font-bold">Rp {item.nominal.toLocaleString()}</td>
                <td className="p-4"><button className="text-red-500">Hapus</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}