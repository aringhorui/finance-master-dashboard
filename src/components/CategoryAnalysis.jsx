import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/formatters';
import { getCategoryColor } from '../config';

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-neutral-900/95 border border-white/10 rounded-xl px-3.5 py-2.5 shadow-2xl backdrop-blur-sm">
      <p className="text-neutral-300 text-xs mb-1">{label}</p>
      <p className="text-white font-semibold tabular-nums">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

function CategoryBar({ name, amount, totalSpent, index }) {
  const pct = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
  const color = getCategoryColor(name, index);

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
          <span className="text-sm text-neutral-300 truncate">{name}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <span className="text-sm font-semibold text-neutral-200 tabular-nums">{formatCurrency(amount)}</span>
          <span className="text-xs text-neutral-500 tabular-nums w-10 text-right">{pct.toFixed(1)}%</span>
        </div>
      </div>
      <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 group-hover:brightness-110"
          style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function CategoryAnalysis({ categories, subCategories, totalSpent }) {
  const topCategories = categories.slice(0, 10);
  const topSubCategories = subCategories.slice(0, 12);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="section-title">Spending by Category</h2>
          <span className="text-xs text-neutral-500">{categories.length} categories</span>
        </div>
        {topCategories.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-neutral-500 text-sm">No category data</div>
        ) : (
          <div className="space-y-3 sm:space-y-3.5">
            {topCategories.map((cat, i) => (
              <CategoryBar key={cat.name} name={cat.name} amount={cat.amount} totalSpent={totalSpent} index={i} />
            ))}
          </div>
        )}
      </div>

      <div className="card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Sub Categories</h2>
          <span className="text-xs text-neutral-500">Top {topSubCategories.length}</span>
        </div>
        {topSubCategories.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-neutral-500 text-sm">No data</div>
        ) : (
          <div className="h-64 sm:h-80 overflow-x-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSubCategories} layout="vertical" margin={{ top: 0, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: '#525252', fontSize: 10 }}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#a3a3a3', fontSize: 11 }}
                  width={90}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(249,115,22,0.06)' }} />
                <Bar dataKey="amount" fill="#f97316" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
