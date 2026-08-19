import { Building2 } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { CHART_COLORS } from '../config';

export function BankAccountBreakdown({ data, totalSpent }) {
  if (!data || data.length === 0) {
    return (
      <div className="card p-4 sm:p-6">
        <h2 className="section-title mb-4">Bank Accounts</h2>
        <div className="h-48 flex items-center justify-center text-neutral-500 text-sm">No data</div>
      </div>
    );
  }

  return (
    <div className="card p-4 sm:p-6">
      <h2 className="section-title mb-4 sm:mb-5">Bank Accounts</h2>
      <div className="space-y-4">
        {data.map((bank, i) => {
          const pct = totalSpent > 0 ? (bank.amount / totalSpent) * 100 : 0;
          const color = CHART_COLORS[i % CHART_COLORS.length];
          return (
            <div key={bank.name}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                    <Building2 size={14} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-200">{bank.name}</p>
                    <p className="text-[11px] text-neutral-500">
                      {formatNumber(bank.count)} transaction{bank.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-neutral-100 tabular-nums">{formatCurrency(bank.amount)}</p>
                  <p className="text-[11px] text-neutral-500 tabular-nums">{pct.toFixed(1)}%</p>
                </div>
              </div>
              <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
