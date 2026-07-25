import { Beaker, Droplets, Thermometer } from 'lucide-react';

export default function IndicatorCards({ latestData, isOnline }) {
  const StatusBadge = () => (
    <span className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-2 transition-colors duration-300 ${isOnline ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
      {isOnline ? 'Online (Aktif)' : 'Offline (Terputus)'}
    </span>
  );

  return (
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
  );
}