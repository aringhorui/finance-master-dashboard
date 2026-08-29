import { useMemo } from 'react';
import { Flame, Snowflake, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { useReveal } from '../hooks/useReveal';

export function SpendingStreaks({ expenses, salaryCycle }) {
  const ref = useReveal();

  const streaks = useMemo(() => {
    if (!salaryCycle) return null;

    const spendDays = new Set();
    expenses.forEach((e) => {
      if (e.date) spendDays.add(e.date.slice(0, 10));
    });

    const start = new Date(salaryCycle.start);
    const now = new Date();
    const end = now < new Date(salaryCycle.end) ? now : new Date(salaryCycle.end);
    const days = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push({ date: d.toISOString().slice(0, 10), spent: spendDays.has(d.toISOString().slice(0, 10)) });
    }

    let currentSpend = 0, maxSpend = 0, currentNoSpend = 0, maxNoSpend = 0;
    let spendDayCount = 0, noSpendDayCount = 0;

    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].spent) { currentSpend++; } else break;
    }
    for (let i = days.length - 1; i >= 0; i--) {
      if (!days[i].spent) { currentNoSpend++; } else break;
    }

    let streak = 0;
    for (const day of days) {
      if (day.spent) { streak++; maxSpend = Math.max(maxSpend, streak); spendDayCount++; }
      else { streak = 0; }
    }
    streak = 0;
    for (const day of days) {
      if (!day.spent) { streak++; maxNoSpend = Math.max(maxNoSpend, streak); noSpendDayCount++; }
      else { streak = 0; }
    }

    const avgPerSpendDay = spendDayCount > 0
      ? expenses.reduce((s, e) => s + (e.amount || 0), 0) / spendDayCount
      : 0;

    const last7 = days.slice(-7);
    const last7Spend = last7.filter((d) => d.spent).length;

    return {
      currentSpend, maxSpend, currentNoSpend, maxNoSpend,
      spendDayCount, noSpendDayCount,
      totalDays: days.length,
      avgPerSpendDay,
      last7Spend,
      days: days.slice(-30),
    };
  }, [expenses, salaryCycle]);

  if (!streaks) return null;

  const isOnSpendStreak = streaks.currentSpend > 0;

  return (
    <div ref={ref} className="reveal card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isOnSpendStreak ? (
            <div className="p-1.5 rounded-lg bg-orange-500/10">
              <Flame size={16} className="text-orange-400" />
            </div>
          ) : (
            <div className="p-1.5 rounded-lg bg-blue-500/10">
              <Snowflake size={16} className="text-blue-400" />
            </div>
          )}
          <h2 className="section-title">Spending Streaks</h2>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
          isOnSpendStreak ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'
        }`}>
          {isOnSpendStreak
            ? `${streaks.currentSpend}-day spend streak`
            : `${streaks.currentNoSpend}-day no-spend streak`}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Spend Days</p>
          <p className="text-lg font-bold text-orange-400 tabular-nums">{streaks.spendDayCount}</p>
          <p className="text-[10px] text-neutral-500">of {streaks.totalDays} days</p>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">No-Spend Days</p>
          <p className="text-lg font-bold text-blue-400 tabular-nums">{streaks.noSpendDayCount}</p>
          <p className="text-[10px] text-neutral-500">{streaks.totalDays > 0 ? ((streaks.noSpendDayCount / streaks.totalDays) * 100).toFixed(0) : 0}% of cycle</p>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Best No-Spend</p>
          <p className="text-lg font-bold text-emerald-400 tabular-nums">{streaks.maxNoSpend}</p>
          <p className="text-[10px] text-neutral-500">days in a row</p>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Avg / Spend Day</p>
          <p className="text-lg font-bold text-neutral-200 tabular-nums">{formatCurrency(Math.round(streaks.avgPerSpendDay))}</p>
          <p className="text-[10px] text-neutral-500">last 7d: {streaks.last7Spend}/7 active</p>
        </div>
      </div>

      {/* Mini calendar */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Calendar size={12} className="text-neutral-500" />
          <p className="text-[11px] text-neutral-500 uppercase tracking-wider">Last 30 days</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {streaks.days.map((d) => (
            <div
              key={d.date}
              title={`${d.date}${d.spent ? ' — spent' : ' — no spend'}`}
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm transition-colors ${
                d.spent
                  ? 'bg-orange-500/70 hover:bg-orange-500'
                  : 'bg-white/[0.04] hover:bg-white/[0.08]'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 mt-2 text-[10px] text-neutral-500">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm bg-orange-500/70" />
            Spent
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm bg-white/[0.04]" />
            No spend
          </div>
        </div>
      </div>
    </div>
  );
}
