import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatCurrency, formatShortDate } from '../utils/formatters';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-neutral-900/95 border border-white/10 rounded-xl px-3.5 py-2.5 shadow-2xl backdrop-blur-sm">
      <p className="text-neutral-400 text-xs mb-1">{formatShortDate(label)}</p>
      <p className="text-white font-semibold tabular-nums">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export function SpendingTrend({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="card p-4 sm:p-6">
        <h2 className="section-title mb-4">Daily Spending</h2>
        <div className="h-52 sm:h-64 flex items-center justify-center text-neutral-500 text-sm">No spending data</div>
      </div>
    );
  }

  const avgAmount = data.reduce((s, d) => s + d.amount, 0) / data.length;

  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">Daily Spending</h2>
        <span className="text-xs text-neutral-500">Avg {formatCurrency(Math.round(avgAmount))}/day</span>
      </div>
      <div className="h-56 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fb923c" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#525252', fontSize: 10 }}
              tickFormatter={formatShortDate}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#525252', fontSize: 10 }}
              tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="amount" stroke="#fb923c" strokeWidth={2} fill="url(#dailyGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
