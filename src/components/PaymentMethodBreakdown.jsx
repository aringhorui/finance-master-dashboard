import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { CHART_COLORS } from '../config';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-neutral-900/95 border border-white/10 rounded-xl px-3.5 py-2.5 shadow-2xl backdrop-blur-sm">
      <p className="text-neutral-300 text-xs mb-1">{payload[0].name}</p>
      <p className="text-white font-semibold tabular-nums">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export function PaymentMethodBreakdown({ data, totalSpent }) {
  if (!data || data.length === 0) {
    return (
      <div className="card p-4 sm:p-6">
        <h2 className="section-title mb-4">Payment Methods</h2>
        <div className="h-48 flex items-center justify-center text-neutral-500 text-sm">No data</div>
      </div>
    );
  }

  return (
    <div className="card p-4 sm:p-6">
      <h2 className="section-title mb-4">Payment Methods</h2>
      <div className="flex flex-col items-center gap-4">
        <div className="w-full h-44 sm:h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={72}
                paddingAngle={3}
                stroke="none"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full space-y-1">
          {data.map((pm, i) => {
            const pct = totalSpent > 0 ? ((pm.amount / totalSpent) * 100).toFixed(1) : 0;
            const color = CHART_COLORS[i % CHART_COLORS.length];
            return (
              <div
                key={pm.name}
                className="flex items-center gap-2 sm:gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-white/[0.02] transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                <span className="flex-1 text-xs sm:text-sm text-neutral-300 truncate">{pm.name}</span>
                <span className="text-xs sm:text-sm font-semibold text-neutral-200 tabular-nums">{formatCurrency(pm.amount)}</span>
                <span className="text-[11px] text-neutral-500 tabular-nums w-11 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
