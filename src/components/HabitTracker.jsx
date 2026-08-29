import { useMemo } from 'react';
import { Repeat, AlertTriangle, Clock } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { useReveal } from '../hooks/useReveal';

export function HabitTracker({ expenses, salaryCycle }) {
  const ref = useReveal();

  const habits = useMemo(() => {
    const bySubCat = {};
    expenses.forEach((e) => {
      const key = e.sub_category || 'Other';
      if (!bySubCat[key]) bySubCat[key] = { name: key, total: 0, count: 0, dates: [], amounts: [] };
      bySubCat[key].total += e.amount || 0;
      bySubCat[key].count += 1;
      if (e.date) bySubCat[key].dates.push(new Date(e.date));
      bySubCat[key].amounts.push(e.amount || 0);
    });

    const daysElapsed = getDaysElapsed(salaryCycle);
    const daysInCycle = getDaysInCycle(salaryCycle);

    return Object.values(bySubCat)
      .filter((h) => h.count >= 3)
      .map((h) => {
        h.dates.sort((a, b) => a - b);
        const gaps = [];
        for (let i = 1; i < h.dates.length; i++) {
          gaps.push(Math.round((h.dates[i] - h.dates[i - 1]) / 86400000));
        }
        const avgGap = gaps.length > 0 ? gaps.reduce((s, g) => s + g, 0) / gaps.length : 0;
        const avgAmount = h.total / h.count;
        const frequency = daysElapsed > 0 ? h.count / daysElapsed : 0;
        const projectedMonthly = daysElapsed > 0 ? (h.total / daysElapsed) * daysInCycle : h.total;
        const lastDate = h.dates[h.dates.length - 1];
        const daysSinceLast = lastDate ? Math.round((new Date() - lastDate) / 86400000) : null;

        let pattern = 'occasional';
        if (avgGap > 0 && avgGap <= 1.5) pattern = 'daily';
        else if (avgGap > 0 && avgGap <= 3) pattern = 'frequent';
        else if (avgGap > 0 && avgGap <= 8) pattern = 'weekly';

        return {
          ...h,
          avgGap: Math.round(avgGap * 10) / 10,
          avgAmount: Math.round(avgAmount),
          frequency,
          projectedMonthly: Math.round(projectedMonthly),
          pattern,
          daysSinceLast,
        };
      })
      .sort((a, b) => b.projectedMonthly - a.projectedMonthly);
  }, [expenses, salaryCycle]);

  if (habits.length === 0) return null;

  const totalProjected = habits.reduce((s, h) => s + h.projectedMonthly, 0);

  return (
    <div ref={ref} className="reveal card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10">
            <Repeat size={16} className="text-purple-400" />
          </div>
          <h2 className="section-title">Recurring Habits</h2>
        </div>
        <span className="text-xs text-neutral-500">{habits.length} detected</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Habits Found</p>
          <p className="text-lg font-bold text-purple-400 tabular-nums">{habits.length}</p>
          <p className="text-[10px] text-neutral-500">3+ occurrences</p>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Projected Total</p>
          <p className="text-lg font-bold text-orange-400 tabular-nums">{formatCurrency(totalProjected)}</p>
          <p className="text-[10px] text-neutral-500">/cycle at current pace</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {habits.slice(0, 8).map((h) => (
          <div
            key={h.name}
            className="group/habit flex items-center gap-3 p-3 rounded-xl bg-white/[0.015] border border-white/[0.04] hover:border-white/[0.08] transition-all duration-200 hover:bg-white/[0.025]"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-neutral-200 truncate">{h.name}</span>
                <PatternBadge pattern={h.pattern} />
              </div>
              <div className="flex items-center gap-3 text-xs text-neutral-500">
                <span className="tabular-nums">{h.count} times</span>
                <span className="text-neutral-700">&middot;</span>
                <span className="tabular-nums">avg {formatCurrency(h.avgAmount)}</span>
                {h.avgGap > 0 && (
                  <>
                    <span className="text-neutral-700">&middot;</span>
                    <span className="flex items-center gap-1 tabular-nums">
                      <Clock size={10} />
                      every {h.avgGap}d
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-neutral-200 tabular-nums">{formatCurrency(h.total)}</p>
              <p className="text-[10px] text-orange-400 tabular-nums">{formatCurrency(h.projectedMonthly)}/cycle</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PatternBadge({ pattern }) {
  const styles = {
    daily: 'bg-red-500/10 text-red-400 border-red-500/20',
    frequent: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    weekly: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    occasional: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
  };
  return (
    <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${styles[pattern]}`}>
      {pattern}
    </span>
  );
}

function getDaysElapsed(salaryCycle) {
  if (!salaryCycle) return 30;
  const start = new Date(salaryCycle.start);
  return Math.max(1, Math.ceil((new Date() - start) / 86400000));
}

function getDaysInCycle(salaryCycle) {
  if (!salaryCycle) return 30;
  const start = new Date(salaryCycle.start);
  const end = new Date(salaryCycle.end);
  return Math.max(1, Math.ceil((end - start) / 86400000));
}
