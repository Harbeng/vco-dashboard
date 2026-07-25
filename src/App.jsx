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

  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState('date'); 
  const [deleteDate, setDeleteDate] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Custom Toast Notification State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    // Otomatis hilang setelah 3.5 detik
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
    const fetchStatus = async () => {
      const { data: statusData } = await supabase.from('kontrol_alat').select('is_recording').eq('id', 1).single();
      if (statusData) setIsRecording(statusData.is_recording);
    };
    fetchStatus();

    const subscription = supabase
      .channel('sensor_readings_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_readings' }, (payload) => {
        setData((currentData) => [...currentData, payload.new].slice(-500));
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  // PERBAIKAN 1: Logika Detak Jantung Ketat (Realtime Murni)
  // Status Offline akan otomatis muncul jika tidak ada data baru dalam 2.5 menit terakhir, apa pun kondisinya.
  useEffect(() => {
    const checkOnlineStatus = () => {
      if (data.length === 0) { 
        setIsOnline(false); 
        return; 
      }
      const latestRecordTime = new Date(data[data.length - 1].created_at).getTime();
      const currentTime = new Date().getTime();
      
      // Jika data terakhir dikirim kurang dari 150.000ms (2.5 menit) yang lalu, maka Online.
      setIsOnline((currentTime - latestRecordTime) < 150000);
    };
    
    checkOnlineStatus();
    const interval = setInterval(checkOnlineStatus, 5000); 
    return () => clearInterval(interval);
  }, [data]);

  // Logika Filter
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

  // PERBAIKAN 2 & 3: Eksekusi Hapus Data tanpa window.confirm dan filter Supabase yang aman
  const executeDelete = async () => {
    if (deleteType === 'date' && !deleteDate) { 
      showToast("Gagal: Pilih tanggal terlebih dahulu!", "error"); 
      return; 
    }

    setIsDeleting(true);
    try {
      if (deleteType === 'all') {
        // Trik aman Supabase: Menghapus dengan filter waktu yang pasti lebih besar dari tahun 2000
        const { error } = await supabase
          .from('sensor_readings')
          .delete()
          .gte('created_at', '2000-01-01');
          
        if (error) throw error;
      } else {
        const startOfDay = new Date(`${deleteDate}T00:00:00.000Z`).toISOString();
        const endOfDay = new Date(`${deleteDate}T23:59:59.999Z`).toISOString();
        const { error } = await supabase
          .from('sensor_readings')
          .delete()
          .gte('created_at', startOfDay)
          .lte('created_at', endOfDay);
          
        if (error) throw error;
      }
      
      // PERBAIKAN 4: Menggunakan Custom Toast untuk pemberitahuan sukses
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

  const latestData = data.length > 0 ? data[data.length - 1] : { cream_temp: 0, oil_temp: 0, water_temp: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-4 sm:p-8 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Panggilan Komponen Toast Notification */}
      <ToastNotification 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, show: false })} 
      />

      {/* Panggilan Komponen Modal Hapus Data */}
      <DeleteModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)}
        deleteType={deleteType} setDeleteType={setDeleteType}
        deleteDate={deleteDate} setDeleteDate={setDeleteDate}
        isDeleting={isDeleting} executeDelete={executeDelete}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        <Header 
          isRecording={isRecording} toggleRecording={toggleRecording}
          filterDate={filterDate} setFilterDate={setFilterDate}
          exportToExcel={exportToExcel} openDeleteModal={() => setIsDeleteModalOpen(true)}
        />
        <IndicatorCards latestData={latestData} isOnline={isOnline} />
        <TemperatureChart filteredData={filteredData} filterDate={filterDate} isRecording={isRecording} />
        <HistoryTable filteredData={filteredData} />
      </div>
    </div>
  );
}