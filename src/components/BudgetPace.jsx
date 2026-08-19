import {
  AreaChart, Area, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
  ComposedChart,
} from 'recharts';
import { formatCurrency, formatShortDate } from '../utils/formatters';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const actual = payload.find((p) => p.dataKey === 'actual');
  const ideal = payload.find((p) => p.dataKey === 'ideal');
  const diff = actual && ideal ? actual.value - ideal.value : 0;
  return (
    <div className="bg-neutral-900/95 border border-white/10 rounded-xl px-3.5 py-2.5 shadow-2xl backdrop-blur-sm">
      <p className="text-neutral-400 text-xs mb-1.5">{formatShortDate(label)}</p>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-orange-400" />
          <span className="text-neutral-300">Actual:</span>
          <span className="text-white font-semibold tabular-nums">{formatCurrency(actual?.value || 0)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-neutral-500" />
          <span className="text-neutral-300">Budget pace:</span>
          <span className="text-neutral-200 font-medium tabular-nums">{formatCurrency(ideal?.value || 0)}</span>
        </div>
        {diff !== 0 && (
          <p className={`text-xs font-medium mt-1 ${diff > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {diff > 0 ? `${formatCurrency(diff)} over pace` : `${formatCurrency(Math.abs(diff))} under pace`}
          </p>
        )}
      </div>
    </div>
  );
}

export function BudgetPace({ data, salary }) {
  if (!data || data.length === 0) {
    return (
      <div className="card p-4 sm:p-6">
        <h2 className="section-title mb-4">Budget Pace</h2>
        <div className="h-52 sm:h-64 flex items-center justify-center text-neutral-500 text-sm">
          No data to calculate pace
        </div>
      </div>
    );
  }

  const lastPoint = data[data.length - 1];
  const isOver = lastPoint && lastPoint.actual > lastPoint.ideal;

  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">Budget Pace</h2>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
          isOver ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
        }`}>
          {isOver ? 'Over pace' : 'Under pace'}
        </span>
      </div>
      <div className="h-56 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="paceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
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
              tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={salary} stroke="rgba(239,68,68,0.3)" strokeDasharray="6 4" />
            <Area type="monotone" dataKey="actual" stroke="#f97316" strokeWidth={2} fill="url(#paceGrad)" />
            <Line type="monotone" dataKey="ideal" stroke="#525252" strokeWidth={1.5} strokeDasharray="6 4" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-neutral-600 mt-2">
        Solid line = actual cumulative spending &middot; Dashed line = ideal even pace for {formatCurrency(salary)} salary
      </p>
    </div>
  );
}
