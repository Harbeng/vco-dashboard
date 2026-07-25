import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function ToastNotification({ show, message, type, onClose }) {
  if (!show) return null;

  return (
    <div 
      className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl transition-all duration-300 min-w-[320px] justify-between animate-bounce"
      style={{ 
        backgroundColor: type === 'success' ? '#10b981' : '#ef4444', 
        color: 'white' 
      }}
    >
      <div className="flex items-center gap-3">
        {type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
        <span className="font-semibold text-sm sm:text-base">{message}</span>
      </div>
      <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
        <X size={20} />
      </button>
    </div>
  );
}