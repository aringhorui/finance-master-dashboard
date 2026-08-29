import { useMemo } from 'react';
import { Coins, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { useReveal } from '../hooks/useReveal';

const THRESHOLD = 100;

export function SmallPurchases({ expenses, salaryCycle }) {
  const ref = useReveal();

  const analysis = useMemo(() => {
    const small = expenses.filter((e) => e.amount > 0 && e.amount < THRESHOLD);
    const total = small.reduce((s, e) => s + e.amount, 0);

    const bySubCat = {};
    small.forEach((e) => {
      const key = e.sub_category || 'Other';
      if (!bySubCat[key]) bySubCat[key] = { name: key, total: 0, count: 0, items: [] };
      bySubCat[key].total += e.amount;
      bySubCat[key].count += 1;
      bySubCat[key].items.push(e);
    });

    const groups = Object.values(bySubCat).sort((a, b) => b.total - a.total);
    const avgPerTxn = small.length > 0 ? total / small.length : 0;

    let daysInCycle = 30;
    if (salaryCycle) {
      const start = new Date(salaryCycle.start);
      const end = new Date(salaryCycle.end);
      daysInCycle = Math.max(1, Math.ceil((end - start) / 86400000));
    }
    const projectedMonthly = daysInCycle > 0 ? (total / daysElapsed(salaryCycle)) * daysInCycle : total;

    return { small, total, groups, avgPerTxn, projectedMonthly, count: small.length, allCount: expenses.length };
  }, [expenses, salaryCycle]);

  if (analysis.count === 0) return null;

  const pctOfAll = analysis.allCount > 0 ? ((analysis.count / analysis.allCount) * 100).toFixed(0) : 0;

  return (
    <div ref={ref} className="reveal card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10">
            <Coins size={16} className="text-amber-400" />
          </div>
          <h2 className="section-title">Death by 1,000 Cuts</h2>
        </div>
        <span className="text-xs text-neutral-500">Under {formatCurrency(THRESHOLD)} each</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Total Leaked</p>
          <p className="text-lg font-bold text-amber-400 tabular-nums">{formatCurrency(analysis.total)}</p>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Transactions</p>
          <p className="text-lg font-bold text-neutral-200 tabular-nums">{analysis.count}</p>
          <p className="text-[10px] text-neutral-500">{pctOfAll}% of all txns</p>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Avg Per Buy</p>
          <p className="text-lg font-bold text-neutral-200 tabular-nums">{formatCurrency(Math.round(analysis.avgPerTxn))}</p>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Projected</p>
          <div className="flex items-center gap-1">
            <TrendingUp size={12} className="text-red-400" />
            <p className="text-lg font-bold text-red-400 tabular-nums">{formatCurrency(Math.round(analysis.projectedMonthly))}</p>
          </div>
          <p className="text-[10px] text-neutral-500">/cycle</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] text-neutral-500 uppercase tracking-wider mb-2">Where it goes</p>
        {analysis.groups.slice(0, 6).map((g) => {
          const pct = analysis.total > 0 ? (g.total / analysis.total) * 100 : 0;
          return (
            <div key={g.name} className="group/row">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-neutral-300">{g.name}</span>
                <div className="flex items-center gap-2 text-xs tabular-nums">
                  <span className="text-neutral-400">{g.count} buys</span>
                  <span className="text-neutral-200 font-medium">{formatCurrency(g.total)}</span>
                </div>
              </div>
              <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 group-hover/row:brightness-125"
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function daysElapsed(salaryCycle) {
  if (!salaryCycle) return 30;
  const start = new Date(salaryCycle.start);
  const now = new Date();
  return Math.max(1, Math.ceil((now - start) / 86400000));
}
