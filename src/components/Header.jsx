import { Activity, Calendar, Play, Square, Download, Trash2 } from 'lucide-react';

export default function Header({ 
  isRecording, 
  toggleRecording, 
  filterDate, 
  setFilterDate, 
  exportToExcel, 
  openDeleteModal 
}) {
  return (
    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-white/70 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-sm border border-white/80 gap-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
          <Activity size={28} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Dashboard Fermentor VCO</h1>
          <p className="text-slate-500 text-sm md:text-base mt-1 font-medium">Pemantauan Suhu Multi-Lapisan</p>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
        <button 
          onClick={toggleRecording}
          className={`flex-1 sm:flex-none items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition-all duration-200 shadow-md flex text-white ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 shadow-red-200' 
              : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
          }`}
        >
          {isRecording ? <Square size={18} /> : <Play size={18} />}
          <span className="hidden sm:inline">{isRecording ? 'Berhenti Merekam' : 'Mulai Merekam'}</span>
        </button>

        <div className="flex-1 sm:flex-none flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
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

        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={exportToExcel}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-xl"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button 
            onClick={openDeleteModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 active:scale-95 text-red-600 px-5 py-3 rounded-xl font-semibold transition-all duration-200 border border-red-200"
          >
            <Trash2 size={18} />
            <span className="hidden sm:inline">Hapus Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}