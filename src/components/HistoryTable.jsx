export default function HistoryTable({ filteredData }) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-md shadow-slate-100 border border-slate-100/60 overflow-hidden">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-800">Tabel Riwayat Data</h3>
        <p className="text-slate-500 text-sm mt-1">Detail pencatatan suhu per 1 menit</p>
      </div>

      <div className="overflow-x-auto h-[400px] overflow-y-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm text-left text-slate-500 relative">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th scope="col" className="px-6 py-4">Waktu Tersimpan</th>
              <th scope="col" className="px-6 py-4">Suhu Krim (°C)</th>
              <th scope="col" className="px-6 py-4">Suhu Minyak (°C)</th>
              <th scope="col" className="px-6 py-4">Suhu Air (°C)</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              [...filteredData].reverse().map((item, index) => (
                <tr key={item.id || index} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">{item.cream_temp}</td>
                  <td className="px-6 py-4">{item.oil_temp}</td>
                  <td className="px-6 py-4">{item.water_temp}</td>
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