import { Activity, Play, Square } from 'lucide-react';

export default function Header({ isRecording, toggleRecording }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/70 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-sm border border-white/80 gap-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
          <Activity size={28} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Dashboard Fermentor VCO</h1>
          <p className="text-slate-500 text-sm md:text-base mt-1 font-medium">Pemantauan Suhu Multi-Lapisan</p>
        </div>
      </div>
      
      <button 
        onClick={toggleRecording}
        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-md text-white ${
          isRecording 
            ? 'bg-red-500 hover:bg-red-600 shadow-red-200' 
            : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
        }`}
      >
        {isRecording ? <Square size={18} /> : <Play size={18} />}
        <span>{isRecording ? 'Berhenti Merekam' : 'Mulai Merekam'}</span>
      </button>
    </div>
  );
}