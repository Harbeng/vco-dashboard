import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Thermometer, Droplets, Beaker, Activity, Calendar, Play, Square } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [isRecording, setIsRecording] = useState(false); // State untuk tombol Rekam

  // 1. Mengambil data suhu & status tombol dari Supabase
  useEffect(() => {
    const fetchData = async () => {
      const { data: sensorData } = await supabase
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(500);

      if (sensorData) setData(sensorData);

      // Mengambil status tombol rekam saat web pertama kali dibuka
      const { data: statusData } = await supabase
        .from('kontrol_alat')
        .select('is_recording')
        .eq('id', 1)
        .single();
        
      if (statusData) setIsRecording(statusData.is_recording);
    };

    fetchData();

    // Supabase Realtime Listener untuk tabel sensor
    const subscription = supabase
      .channel('sensor_readings_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_readings' }, (payload) => {
        setData((currentData) => [...currentData, payload.new].slice(-500));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // 2. Logika Detak Jantung
  useEffect(() => {
    const checkOnlineStatus = () => {
      if (data.length === 0) {
        setIsOnline(false);
        return;
      }
      
      const latestRecordTime = new Date(data[data.length - 1].created_at).getTime();
      const currentTime = new Date().getTime();
      
      // Jika alat sedang merekam dan data macet > 30 detik = Offline
      // Jika alat sedang tidak merekam (Standby), kita anggap Online selama alat nyala (meski tidak kirim data)
      if (isRecording) {
        setIsOnline((currentTime - latestRecordTime) < 30000);
      } else {
        setIsOnline(true); 
      }
    };

    checkOnlineStatus();
    const interval = setInterval(checkOnlineStatus, 5000); 

    return () => clearInterval(interval);
  }, [data, isRecording]);

  // 3. Logika Filter Tanggal
  useEffect(() => {
    if (!filterDate) {
      setFilteredData(data);
    } else {
      const filtered = data.filter(item => {
        const itemDate = new Date(item.created_at);
        const offset = itemDate.getTimezoneOffset();
        const localDate = new Date(itemDate.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
        return localDate === filterDate;
      });
      setFilteredData(filtered);
    }
  }, [data, filterDate]);

  // 4. Fungsi Mengubah Status Merekam di Database
  const toggleRecording = async () => {
    const newStatus = !isRecording;
    setIsRecording(newStatus); // Update di layar seketika
    
    // Kirim perintah perubahan ke database Supabase
    await supabase
      .from('kontrol_alat')
      .update({ is_recording: newStatus })
      .eq('id', 1);
  };

  // 5. Fungsi Export ke Excel
  const exportToExcel = () => {
    if (filteredData.length === 0) {
      alert("Tidak ada data untuk diekspor pada tanggal ini.");
      return;
    }
    const dataToExport = filteredData.map(item => ({
      "Waktu Tersimpan": new Date(item.created_at).toLocaleString(),
      "Suhu Krim (°C)": item.cream_temp,
      "Suhu Minyak (°C)": item.oil_temp,
      "Suhu Air (°C)": item.water_temp
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Sensor VCO");
    
    const fileName = filterDate ? `Laporan_VCO_${filterDate}.xlsx` : `Laporan_VCO_Semua_Data.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const latestData = data.length > 0 ? data[data.length - 1] : { cream_temp: 0, oil_temp: 0, water_temp: 0 };

  const StatusBadge = () => (
    <span className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-2 transition-colors duration-300 ${isOnline ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
      {isOnline ? 'Online (Aktif)' : 'Offline (Terputus)'}
    </span>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-4 sm:p-8 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section & Filter */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white/70 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-sm border border-white/80 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
              <Activity size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Dashboard Fermentor VCO</h1>
              <p className="text-slate-500 text-sm md:text-base mt-1 font-medium">Pemantauan Suhu Multi-Lapisan</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full lg:w-auto items-stretch sm:items-center gap-4">
            
            {/* TOMBOL REKAM BARU */}
            <button 
              onClick={toggleRecording}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-md whitespace-nowrap text-white ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 hover:shadow-red-200 shadow-red-200' 
                  : 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-emerald-200 shadow-emerald-200'
              }`}
            >
              {isRecording ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              {isRecording ? 'Berhenti Merekam' : 'Mulai Merekam'}
            </button>

            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <Calendar size={18} className="text-slate-400 mr-2" />
              <input 
                type="date" 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-600 font-medium text-sm w-full cursor-pointer"
              />
              {filterDate && (
                <button onClick={() => setFilterDate("")} className="ml-2 text-xs text-red-500 hover:text-red-700 font-semibold">Batal</button>
              )}
            </div>

            <button 
              onClick={exportToExcel}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-slate-200 whitespace-nowrap"
            >
              <Download size={18} />
              Export Data
            </button>
          </div>
        </div>

        {/* Kartu Indikator Suhu Saat Ini */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group bg-white p-6 rounded-3xl shadow-md shadow-slate-100 border border-slate-100/60 hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600 rounded-2xl">
                <Beaker size={28} />
              </div>
              <StatusBadge />
            </div>
            <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-1">Lapisan Krim (Atas)</p>
            <div className="flex items-end gap-2">
              <h2 className={`text-4xl font-black ${isOnline ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-blue-600' : 'text-slate-400'}`}>
                {latestData.cream_temp}
              </h2>
              <span className="text-xl font-bold text-slate-400 mb-1">°C</span>
            </div>
          </div>

          <div className="group bg-white p-6 rounded-3xl shadow-md shadow-slate-100 border border-slate-100/60 hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-500 rounded-2xl">
                <Droplets size={28} />
              </div>
              <StatusBadge />
            </div>
            <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-1">Lapisan Minyak (Tengah)</p>
            <div className="flex items-end gap-2">
              <h2 className={`text-4xl font-black ${isOnline ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500' : 'text-slate-400'}`}>
                {latestData.oil_temp}
              </h2>
              <span className="text-xl font-bold text-slate-400 mb-1">°C</span>
            </div>
          </div>

          <div className="group bg-white p-6 rounded-3xl shadow-md shadow-slate-100 border border-slate-100/60 hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-4 bg-gradient-to-br from-cyan-50 to-sky-50 text-cyan-500 rounded-2xl">
                <Thermometer size={28} />
              </div>
              <StatusBadge />
            </div>
            <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-1">Lapisan Air (Bawah)</p>
            <div className="flex items-end gap-2">
              <h2 className={`text-4xl font-black ${isOnline ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-sky-500' : 'text-slate-400'}`}>
                {latestData.water_temp}
              </h2>
              <span className="text-xl font-bold text-slate-400 mb-1">°C</span>
            </div>
          </div>
        </div>

        {/* Grafik Sejarah Suhu */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-md shadow-slate-100 border border-slate-100/60">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Tren Suhu Fermentasi</h3>
              <p className="text-slate-500 text-sm mt-1">
                Menampilkan {filteredData.length} data {filterDate ? `pada tanggal ${filterDate}` : 'terakhir'}
              </p>
            </div>
            {/* Indikator Status di Atas Grafik */}
            <div className={`px-4 py-2 rounded-lg font-bold text-sm ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
              {isRecording ? '🔴 SEDANG MEREKAM...' : '⏸️ MODE STANDBY'}
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            {filteredData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="created_at" 
                    tickFormatter={(time) => new Date(time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    domain={['auto', 'auto']}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                  />
                  <Tooltip 
                    labelFormatter={(label) => new Date(label).toLocaleString()}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px 16px', fontWeight: '500' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '24px', paddingBottom: '8px' }} />
                  <Line type="monotone" name="Krim" dataKey="cream_temp" stroke="#4f46e5" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Line type="monotone" name="Minyak" dataKey="oil_temp" stroke="#f59e0b" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Line type="monotone" name="Air" dataKey="water_temp" stroke="#06b6d4" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">Tidak ada data untuk tanggal yang dipilih.</div>
            )}
          </div>
        </div>

        {/* Tabel Riwayat Data */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-md shadow-slate-100 border border-slate-100/60 overflow-hidden">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-800">Tabel Riwayat Data</h3>
            <p className="text-slate-500 text-sm mt-1">Detail pencatatan suhu per 10 detik</p>
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

      </div>
    </div>
  );
}