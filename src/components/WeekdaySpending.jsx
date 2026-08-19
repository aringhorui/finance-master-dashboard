import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/formatters';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-neutral-900/95 border border-white/10 rounded-xl px-3.5 py-2.5 shadow-2xl backdrop-blur-sm">
      <p className="text-neutral-300 text-xs mb-1.5">{label}</p>
      <div className="space-y-0.5">
        <p className="text-white font-semibold text-sm tabular-nums">Total: {formatCurrency(payload[0]?.value)}</p>
        {payload[1] && (
          <p className="text-neutral-400 text-xs tabular-nums">Avg: {formatCurrency(payload[1]?.value)}</p>
        )}
      </div>
    </div>
  );
}

export function WeekdaySpending({ data }) {
  if (!data || data.every((d) => d.total === 0)) {
    return (
      <div className="card p-4 sm:p-6">
        <h2 className="section-title mb-4">Day of Week</h2>
        <div className="h-52 sm:h-64 flex items-center justify-center text-neutral-500 text-sm">No data</div>
      </div>
    );
  }

  const maxDay = data.reduce((max, d) => (d.total > max.total ? d : max), data[0]);

  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">Day of Week</h2>
        <span className="text-xs text-neutral-500">Peak: {maxDay.day}</span>
      </div>
      <div className="h-52 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="shortDay"
              tick={{ fill: '#a3a3a3', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#525252', fontSize: 10 }}
              tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(249,115,22,0.06)' }} />
            <Bar dataKey="total" fill="#f97316" radius={[6, 6, 0, 0]} barSize={24} name="Total" />
            <Bar dataKey="average" fill="rgba(249,115,22,0.25)" radius={[6, 6, 0, 0]} barSize={24} name="Average" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
