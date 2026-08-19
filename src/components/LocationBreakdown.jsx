import { MapPin } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';

export function LocationBreakdown({ data, totalSpent }) {
  if (!data || data.length === 0) {
    return (
      <div className="card p-5 sm:p-6">
        <h2 className="section-title mb-4">Spending by Location</h2>
        <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No location data</div>
      </div>
    );
  }

  const maxAmount = Math.max(...data.map((d) => d.amount));
  const topLocations = data.slice(0, 8);

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="section-title">Spending by Location</h2>
        <span className="text-xs text-slate-500">{data.length} locations</span>
      </div>
      <div className="space-y-3">
        {topLocations.map((loc) => {
          const pct = totalSpent > 0 ? ((loc.amount / totalSpent) * 100).toFixed(1) : 0;
          const barPct = maxAmount > 0 ? (loc.amount / maxAmount) * 100 : 0;
          return (
            <div key={loc.name} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin size={13} className="text-slate-500 shrink-0" />
                  <span className="text-sm text-slate-300 truncate">{loc.name}</span>
                  <span className="text-xs text-slate-600 tabular-nums">{formatNumber(loc.count)} txn{loc.count !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="text-sm font-semibold text-slate-200 tabular-nums">{formatCurrency(loc.amount)}</span>
                  <span className="text-xs text-slate-500 tabular-nums w-10 text-right">{pct}%</span>
                </div>
              </div>
              <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-cyan-500/60 transition-all duration-500 group-hover:bg-cyan-500/80"
                  style={{ width: `${barPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
