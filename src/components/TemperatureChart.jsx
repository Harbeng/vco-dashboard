import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TemperatureChart({ filteredData, filterDate, isRecording }) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-md shadow-slate-100 border border-slate-100/60">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Tren Suhu Fermentasi</h3>
          <p className="text-slate-500 text-sm mt-1">
            Menampilkan {filteredData.length} data {filterDate ? `pada tanggal ${filterDate}` : 'terakhir'}
          </p>
        </div>
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
          <div className="h-full flex items-center justify-center text-slate-400">Tidak ada data untuk ditampilkan.</div>
        )}
      </div>
    </div>
  );
}