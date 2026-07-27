import { Calendar, Download, Trash2, ListFilter } from 'lucide-react';
import { useState } from 'react';

export default function HistoryTable({ 
  filteredData, 
  filterDate, 
  setFilterDate, 
  exportToExcel, 
  openDeleteModal 
}) {
  // State baru untuk mengatur batas jumlah data yang ditampilkan
  const [limit, setLimit] = useState(50); 

  // Membalik data (terbaru di atas) lalu memotongnya sesuai limit yang dipilih
  const reversedData = [...filteredData].reverse();
  const displayedData = limit === 'all' ? reversedData : reversedData.slice(0, limit);

  return (
    <div className="bg-white p-4 md:p-8 rounded-3xl shadow-md shadow-slate-100 border border-slate-100/60 overflow-hidden">
      
      {/* HEADER TABEL BESERTA KUMPULAN TOMBOL */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-5 mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Tabel Riwayat Data</h3>
          <p className="text-slate-500 text-sm mt-1">Menampilkan {displayedData.length} data terbaru</p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full xl:w-auto">
          
          {/* Tombol Pilihan Jumlah Data */}
          <div className="flex-1 sm:flex-none flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 w-full sm:w-auto">
            <ListFilter size={18} className="text-slate-400 mr-2 shrink-0" />
            <select 
              value={limit} 
              onChange={(e) => setLimit(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-transparent border-none outline-none text-slate-600 font-medium text-sm w-full cursor-pointer appearance-none"
            >
              <option value={10}>10 Baris Terakhir</option>
              <option value={25}>25 Baris Terakhir</option>
              <option value={50}>50 Baris Terakhir</option>
              <option value={100}>100 Baris Terakhir</option>
              <option value="all">Semua Data</option>
            </select>
          </div>

          {/* Tombol Filter Tanggal */}
          <div className="flex-1 sm:flex-none flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 w-full sm:w-auto">
            <Calendar size={18} className="text-slate-400 mr-2 shrink-0" />
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-600 font-medium text-sm w-full cursor-pointer"
            />
            {filterDate && (
              <button onClick={() => setFilterDate("")} className="ml-2 text-xs text-red-500 hover:text-red-700 font-bold shrink-0">Batal</button>
            )}
          </div>

          {/* Tombol Export & Hapus */}
          <div className="flex gap-3 w-full sm:w-auto mt-2 sm:mt-0">
            <button 
              // PERBAIKAN: Mengirimkan hanya data yang sedang TAMPIL ke fungsi Export
              onClick={() => exportToExcel(displayedData)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-xl"
            >
              <Download size={18} />
              <span className="inline">Export</span>
            </button>

            <button 
              onClick={openDeleteModal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 active:scale-95 text-red-600 px-5 py-3 rounded-xl font-semibold transition-all duration-200 border border-red-200"
            >
              <Trash2 size={18} />
              <span className="inline">Hapus</span>
            </button>
          </div>
        </div>
      </div>

      {/* TABEL DATA */}
      {/* PERBAIKAN HP: h-[65vh] membuat tinggi tabel menyesuaikan 65% tinggi layar HP agar lebih panjang/full */}
      <div className="overflow-x-auto h-[65vh] min-h-[400px] md:h-[500px] overflow-y-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm text-left text-slate-500 relative">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th scope="col" className="px-4 md:px-6 py-4">Waktu Tersimpan</th>
              <th scope="col" className="px-4 md:px-6 py-4">Suhu Krim (°C)</th>
              <th scope="col" className="px-4 md:px-6 py-4">Suhu Minyak (°C)</th>
              <th scope="col" className="px-4 md:px-6 py-4">Suhu Air (°C)</th>
            </tr>
          </thead>
          <tbody>
            {displayedData.length > 0 ? (
              displayedData.map((item, index) => (
                <tr key={item.id || index} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 md:px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                  {/* Pembulatan 1 angka di belakang koma untuk tabel */}
                  <td className="px-4 md:px-6 py-4">{Number(item.cream_temp).toFixed(1)}</td>
                  <td className="px-4 md:px-6 py-4">{Number(item.oil_temp).toFixed(1)}</td>
                  <td className="px-4 md:px-6 py-4">{Number(item.water_temp).toFixed(1)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-slate-400">
                  Tidak ada data riwayat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}