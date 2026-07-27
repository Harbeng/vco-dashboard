import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import * as XLSX from 'xlsx';

import DeleteModal from './components/DeleteModal';
import Header from './components/Header';
import IndicatorCards from './components/IndicatorCards';
import TemperatureChart from './components/TemperatureChart';
import HistoryTable from './components/HistoryTable';
import ToastNotification from './components/ToastNotification';

export default function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  
  const [isOnline, setIsOnline] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // State baru untuk menampung data suhu Real-time (yang diupdate tiap 10 detik)
  const [realtimeData, setRealtimeData] = useState({ cream_temp: 0, oil_temp: 0, water_temp: 0 });
  const [lastSeen, setLastSeen] = useState(0); 

  // Modal & Toast State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState('date'); 
  const [deleteDate, setDeleteDate] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  const fetchSensorData = async () => {
    const { data: sensorData } = await supabase
      .from('sensor_readings')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(500);
    if (sensorData) setData(sensorData);
  };

  useEffect(() => {
    fetchSensorData();
    
    // Ambil status saklar sekaligus suhu real-time saat ini saat web baru dibuka
    const fetchStatusAndRealtime = async () => {
      const { data: statusData } = await supabase.from('kontrol_alat').select('*').eq('id', 1).single();
      if (statusData) {
        setIsRecording(statusData.is_recording);
        setRealtimeData({
          cream_temp: statusData.cream_temp || 0,
          oil_temp: statusData.oil_temp || 0,
          water_temp: statusData.water_temp || 0
        });
      }
    };
    fetchStatusAndRealtime();

    // 1. Telinga Supabase untuk Tabel Riwayat Grafik (Hanya bunyi jika sedang Merekam)
    const historySubscription = supabase
      .channel('sensor_readings_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_readings' }, (payload) => {
        setData((currentData) => [...currentData, payload.new].slice(-500));
      })
      .subscribe();

    // 2. Telinga Supabase untuk Tabel Real-time (Selalu bunyi tiap 10 detik selama alat nyala)
    const realtimeSubscription = supabase
      .channel('kontrol_alat_channel')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'kontrol_alat' }, (payload) => {
        setIsRecording(payload.new.is_recording);
        setRealtimeData({
          cream_temp: payload.new.cream_temp,
          oil_temp: payload.new.oil_temp,
          water_temp: payload.new.water_temp
        });
        // Karena ada data masuk, berarti alat terbukti menyala! Catat waktunya.
        setLastSeen(Date.now());
      })
      .subscribe();

    return () => {
      supabase.removeChannel(historySubscription);
      supabase.removeChannel(realtimeSubscription);
    };
  }, []);

  // LOGIKA ONLINE: Jika ada denyut data real-time dalam 15 detik terakhir, maka Online.
  useEffect(() => {
    const checkOnlineStatus = () => {
      const isAlive = (Date.now() - lastSeen) < 15000;
      setIsOnline(isAlive);
    };
    
    checkOnlineStatus();
    const interval = setInterval(checkOnlineStatus, 5000); 
    return () => clearInterval(interval);
  }, [lastSeen]);

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

  const toggleRecording = async () => {
    const newStatus = !isRecording;
    setIsRecording(newStatus); 
    await supabase.from('kontrol_alat').update({ is_recording: newStatus }).eq('id', 1);
  };

  const executeDelete = async () => {
    if (deleteType === 'date' && !deleteDate) { 
      showToast("Gagal: Pilih tanggal terlebih dahulu!", "error"); 
      return; 
    }
    setIsDeleting(true);
    try {
      if (deleteType === 'all') {
        const { error } = await supabase.from('sensor_readings').delete().gte('created_at', '2000-01-01');
        if (error) throw error;
      } else {
        const startOfDay = new Date(`${deleteDate}T00:00:00.000Z`).toISOString();
        const endOfDay = new Date(`${deleteDate}T23:59:59.999Z`).toISOString();
        const { error } = await supabase.from('sensor_readings').delete().gte('created_at', startOfDay).lte('created_at', endOfDay);
        if (error) throw error;
      }
      showToast("Data sensor berhasil dihapus!", "success");
      setIsDeleteModalOpen(false); 
      setDeleteDate(""); 
      fetchSensorData(); 
    } catch (error) {
      showToast("Error: Gagal menghapus data dari database.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const exportToExcel = () => {
    if (filteredData.length === 0) { 
      showToast("Tidak ada data untuk diekspor pada tanggal ini.", "error"); 
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Sensor");
    const fileName = filterDate ? `Laporan_${filterDate}.xlsx` : `Laporan_Semua.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-4 sm:p-8 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      <ToastNotification show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />

      <DeleteModal 
        isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}
        deleteType={deleteType} setDeleteType={setDeleteType} deleteDate={deleteDate} setDeleteDate={setDeleteDate}
        isDeleting={isDeleting} executeDelete={executeDelete}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        <Header isRecording={isRecording} toggleRecording={toggleRecording} />
        
        {/* Sekarang IndicatorCards memakai realtimeData, bukan data dari riwayat tabel! */}
        <IndicatorCards latestData={realtimeData} isOnline={isOnline} />
        
        <TemperatureChart filteredData={filteredData} filterDate={filterDate} isRecording={isRecording} />
        <HistoryTable 
          filteredData={filteredData} filterDate={filterDate} setFilterDate={setFilterDate}
          exportToExcel={exportToExcel} openDeleteModal={() => setIsDeleteModalOpen(true)}
        />
      </div>
    </div>
  );
}