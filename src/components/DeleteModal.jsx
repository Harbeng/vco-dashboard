import { Trash2, X, AlertTriangle } from 'lucide-react';

export default function DeleteModal({ 
  isOpen, 
  onClose, 
  deleteType, 
  setDeleteType, 
  deleteDate, 
  setDeleteDate, 
  isDeleting, 
  executeDelete 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Trash2 className="text-red-500" /> Konfirmasi Hapus Data
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          <div 
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${deleteType === 'date' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
            onClick={() => setDeleteType('date')}
          >
            <label className="flex items-center gap-3 cursor-pointer font-bold text-slate-700">
              <input type="radio" checked={deleteType === 'date'} readOnly className="w-5 h-5 text-indigo-600 accent-indigo-600" />
              Hapus Berdasarkan Tanggal
            </label>
            {deleteType === 'date' && (
              <div className="mt-4 ml-8">
                <input 
                  type="date" 
                  value={deleteDate}
                  onChange={(e) => setDeleteDate(e.target.value)}
                  className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2 text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          <div 
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${deleteType === 'all' ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-slate-300'}`}
            onClick={() => setDeleteType('all')}
          >
            <label className="flex items-center gap-3 cursor-pointer font-bold text-red-600">
              <input type="radio" checked={deleteType === 'all'} readOnly className="w-5 h-5 text-red-600 accent-red-600" />
              Hapus SEMUA Data (Reset Total)
            </label>
            {deleteType === 'all' && (
              <div className="mt-3 ml-8 p-3 bg-red-100 rounded-lg border border-red-200">
                <p className="text-xs text-red-700 flex items-start gap-1 font-semibold">
                  <AlertTriangle size={16} className="shrink-0" />
                  PERINGATAN: Tindakan ini permanen. Seluruh data riwayat di grafik dan tabel akan hilang.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
            Batal
          </button>
          <button 
            onClick={executeDelete} 
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-red-200"
          >
            {isDeleting ? 'Menghapus...' : 'Ya, Hapus Permanen'}
          </button>
        </div>
      </div>
    </div>
  );
}