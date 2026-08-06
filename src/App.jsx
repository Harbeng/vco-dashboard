import { useEffect, useState, useRef } from 'react';
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
  
  const [realtimeData, setRealtimeData] = useState({ cream_temp: 0, oil_temp: 0, water_temp: 0 });
  
  const lastSeenRef = useRef(0);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState('date'); 
  const [deleteDate, setDeleteDate] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  // MENGAMBIL SELURUH DATA TANPA BATAS (UNLIMITED)
  const fetchSensorData = async () => {
    const { data: sensorData } = await supabase
      .from('sensor_readings')
      .select('*')
      .order('created_at', { ascending: true }); // .limit() dihapus total
    if (sensorData) setData(sensorData);
  };

  useEffect(() => {
    fetchSensorData();
    
    const fetchStatusAndRealtime = async () => {
      const { data: statusData } = await supabase.from('kontrol_alat').select('*').eq('id', 1).single();
      if (statusData) {
        setIsRecording(statusData.is_recording);
        setRealtimeData({
          cream_temp: statusData.cream_temp || 0,
          oil_temp: statusData.oil_temp || 0,
          water_temp: statusData.water_temp || 0
        });
        // Kita tidak menset lastSeenRef di sini agar tidak terjadi "Online Palsu" saat di-refresh
      }
    };
    fetchStatusAndRealtime();

    const historySubscription = supabase
      .channel('sensor_readings_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_readings' }, (payload) => {
        // DATA BARU DITAMBAHKAN TANPA DIPOTONG (.slice dihapus total)
        setData((currentData) => [...currentData, payload.new]);
      })
      .subscribe();

    const realtimeSubscription = supabase
      .channel('kontrol_alat_channel')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'kontrol_alat' }, (payload) => {
        setIsRecording(payload.new.is_recording);
        setRealtimeData({
          cream_temp: payload.new.cream_temp,
          oil_temp: payload.new.oil_temp,
          water_temp: payload.new.water_temp
        });
        
        lastSeenRef.current = Date.now();
        setIsOnline(true); 
      })
      .subscribe();

    return () => {
      supabase.removeChannel(historySubscription);
      supabase.removeChannel(realtimeSubscription);
    };
  }, []);

  // MESIN PENGAWAS ONLINE/OFFLINE: Mengecek detak jantung tiap 3 Detik
  useEffect(() => {
    const checkOnlineStatus = () => {
      if (lastSeenRef.current === 0) {
        setIsOnline(false);
        return;
      }
      const isAlive = (Date.now() - lastSeenRef.current) < 15000;
      setIsOnline(isAlive);
    };
    
    const interval = setInterval(checkOnlineStatus, 3000); 
    return () => clearInterval(interval);
  }, []);

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

  // AKSI TOMBOL HIJAU/MERAH
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

  const exportToExcel = (displayedData) => {
    const dataToProcess = (Array.isArray(displayedData) && displayedData.length > 0) 
      ? displayedData 
      : filteredData;

    if (dataToProcess.length === 0) { 
      showToast("Tidak ada data untuk diekspor.", "error"); 
      return; 
    }

    const dataToExport = dataToProcess.map(item => ({
      "Waktu Tersimpan": new Date(item.created_at).toLocaleString(),
      "Suhu Krim (°C)": Number(item.cream_temp).toFixed(1),
      "Suhu Minyak (°C)": Number(item.oil_temp).toFixed(1),
      "Suhu Air (°C)": Number(item.water_temp).toFixed(1)
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Sensor");
    
    const fileName = filterDate ? `Laporan_${filterDate}.xlsx` : `Laporan_Data_Sensor.xlsx`;
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