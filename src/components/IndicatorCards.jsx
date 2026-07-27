import { Beaker, Droplets, Thermometer } from 'lucide-react';

export default function IndicatorCards({ latestData, isOnline }) {
  
  const isSensorOnline = (temp) => {
    return isOnline && temp > -100;
  };

  const StatusBadge = ({ active }) => (
    <span className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-2 transition-colors duration-300 ${active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
      {active ? 'Online (Aktif)' : 'Offline (Terputus)'}
    </span>
  );

  const creamActive = isSensorOnline(latestData.cream_temp);
  const oilActive = isSensorOnline(latestData.oil_temp);
  const waterActive = isSensorOnline(latestData.water_temp);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* ================== KARTU KRIM ================== */}
      <div className={`group bg-white p-6 rounded-3xl shadow-md border hover:-translate-y-1 transition-all duration-300 ${creamActive ? 'shadow-slate-100 border-slate-100/60' : 'shadow-red-50 border-red-100'}`}>
        <div className="flex justify-between items-start mb-4">
          <div className={`p-4 rounded-2xl ${creamActive ? 'bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
            <Beaker size={28} />
          </div>
          <StatusBadge active={creamActive} />
        </div>
        <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-1">Lapisan Krim (Atas)</p>
        <div className="flex items-end gap-2">
          <h2 className={`text-4xl font-black ${creamActive ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-blue-600' : 'text-red-500'}`}>
            {/* Pembulatan 1 angka di belakang koma ada di sini */}
            {creamActive ? Number(latestData.cream_temp).toFixed(1) : 'ERR'}
          </h2>
          {creamActive && <span className="text-xl font-bold text-slate-400 mb-1">°C</span>}
        </div>
      </div>

      {/* ================== KARTU MINYAK ================== */}
      <div className={`group bg-white p-6 rounded-3xl shadow-md border hover:-translate-y-1 transition-all duration-300 ${oilActive ? 'shadow-slate-100 border-slate-100/60' : 'shadow-red-50 border-red-100'}`}>
        <div className="flex justify-between items-start mb-4">
          <div className={`p-4 rounded-2xl ${oilActive ? 'bg-gradient-to-br from-amber-50 to-orange-50 text-amber-500' : 'bg-slate-100 text-slate-400'}`}>
            <Droplets size={28} />
          </div>
          <StatusBadge active={oilActive} />
        </div>
        <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-1">Lapisan Minyak (Tengah)</p>
        <div className="flex items-end gap-2">
          <h2 className={`text-4xl font-black ${oilActive ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500' : 'text-red-500'}`}>
            {/* Pembulatan 1 angka di belakang koma ada di sini */}
            {oilActive ? Number(latestData.oil_temp).toFixed(1) : 'ERR'}
          </h2>
          {oilActive && <span className="text-xl font-bold text-slate-400 mb-1">°C</span>}
        </div>
      </div>

      {/* ================== KARTU AIR ================== */}
      <div className={`group bg-white p-6 rounded-3xl shadow-md border hover:-translate-y-1 transition-all duration-300 ${waterActive ? 'shadow-slate-100 border-slate-100/60' : 'shadow-red-50 border-red-100'}`}>
        <div className="flex justify-between items-start mb-4">
          <div className={`p-4 rounded-2xl ${waterActive ? 'bg-gradient-to-br from-cyan-50 to-sky-50 text-cyan-500' : 'bg-slate-100 text-slate-400'}`}>
            <Thermometer size={28} />
          </div>
          <StatusBadge active={waterActive} />
        </div>
        <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-1">Lapisan Air (Bawah)</p>
        <div className="flex items-end gap-2">
          <h2 className={`text-4xl font-black ${waterActive ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-sky-500' : 'text-red-500'}`}>
            {/* Pembulatan 1 angka di belakang koma ada di sini */}
            {waterActive ? Number(latestData.water_temp).toFixed(1) : 'ERR'}
          </h2>
          {waterActive && <span className="text-xl font-bold text-slate-400 mb-1">°C</span>}
        </div>
      </div>

    </div>
  );
}