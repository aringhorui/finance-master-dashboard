import { useState, useMemo } from 'react';
import { formatCurrency } from '../utils/formatters';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const COLORS = [
  'rgba(255,255,255,0.04)',
  '#7c2d12',
  '#9a3412',
  '#c2410c',
  '#ea580c',
  '#f97316',
];

function getIntensity(amount, maxAmount) {
  if (!amount || amount === 0) return 0;
  if (maxAmount === 0) return 0;
  const ratio = amount / maxAmount;
  if (ratio > 0.8) return 5;
  if (ratio > 0.6) return 4;
  if (ratio > 0.4) return 3;
  if (ratio > 0.2) return 2;
  return 1;
}

function formatShortDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

function getDayName(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
}

export function SpendingHeatmap({ data, salaryCycle }) {
  const [hoveredDay, setHoveredDay] = useState(null);

  const { weeks, maxAmount, totalDays, monthLabels, stats } = useMemo(() => {
    if (!data || data.length === 0 || !salaryCycle) {
      return { weeks: [], maxAmount: 0, totalDays: 0, monthLabels: [], stats: null };
    }

    const start = new Date(salaryCycle.start + 'T12:00:00');
    const end = new Date(salaryCycle.end + 'T12:00:00');
    const dailyMap = {};
    data.forEach((d) => { dailyMap[d.date] = d.amount; });

    const maxAmt = Math.max(...data.map((d) => d.amount), 1);
    const allDays = [];
    const now = new Date();

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const key = `${y}-${m}-${day}`;
      const dayOfWeek = (d.getDay() + 6) % 7;
      allDays.push({
        date: key,
        amount: dailyMap[key] || 0,
        dayOfWeek,
        isPast: new Date(key + 'T23:59:59') <= now,
        dayNum: d.getDate(),
        month: d.getMonth(),
      });
    }

    const wks = [];
    let currentWeek = Array(7).fill(null);
    allDays.forEach((day) => {
      if (day.dayOfWeek === 0 && currentWeek.some((d) => d !== null)) {
        wks.push(currentWeek);
        currentWeek = Array(7).fill(null);
      }
      currentWeek[day.dayOfWeek] = day;
    });
    if (currentWeek.some((d) => d !== null)) {
      wks.push(currentWeek);
    }

    const labels = [];
    let lastMonth = -1;
    wks.forEach((week, wi) => {
      const firstDay = week.find((d) => d !== null);
      if (firstDay && firstDay.month !== lastMonth) {
        labels.push({ index: wi, label: MONTH_NAMES[firstDay.month] });
        lastMonth = firstDay.month;
      }
    });

    const pastDays = allDays.filter((d) => d.isPast);
    const spendDays = pastDays.filter((d) => d.amount > 0);
    const peakDay = spendDays.length > 0 ? spendDays.reduce((a, b) => a.amount > b.amount ? a : b) : null;
    const zeroDays = pastDays.filter((d) => d.amount === 0).length;
    const totalSpent = pastDays.reduce((s, d) => s + d.amount, 0);
    const avgPerDay = spendDays.length > 0 ? totalSpent / pastDays.length : 0;

    const weekdayTotals = {};
    pastDays.forEach((d) => {
      const name = DAY_LABELS[d.dayOfWeek];
      weekdayTotals[name] = (weekdayTotals[name] || 0) + d.amount;
    });
    const topWeekday = Object.entries(weekdayTotals).sort((a, b) => b[1] - a[1])[0];

    const streakDays = [];
    let streak = 0;
    let maxStreak = 0;
    pastDays.forEach((d) => {
      if (d.amount > 0) { streak++; maxStreak = Math.max(maxStreak, streak); }
      else { streak = 0; }
    });

    return {
      weeks: wks,
      maxAmount: maxAmt,
      totalDays: allDays.length,
      monthLabels: labels,
      stats: {
        spendDays: spendDays.length, zeroDays, peakDay, totalSpent,
        avgPerDay, topWeekday, maxStreak, pastDays: pastDays.length,
      },
    };
  }, [data, salaryCycle]);

  if (weeks.length === 0) {
    return (
      <div className="card p-4 sm:p-6">
        <h2 className="section-title mb-4">Spending Heatmap</h2>
        <div className="h-32 flex items-center justify-center text-neutral-500 text-sm">No data</div>
      </div>
    );
  }

  const gap = 3;
  const cellPx = 18;

  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">Spending Heatmap</h2>
        <span className="text-xs text-neutral-500">{totalDays}-day salary cycle</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <div className="shrink-0">
          <div className="inline-block">
            <div className="flex mb-1" style={{ paddingLeft: 30, gap: `${gap}px` }}>
              {weeks.map((_, wi) => {
                const label = monthLabels.find((l) => l.index === wi);
                return (
                  <div key={wi} className="text-[10px] text-neutral-500 text-center" style={{ width: cellPx }}>
                    {label ? label.label : ''}
                  </div>
                );
              })}
            </div>

            <div className="flex">
              <div className="flex flex-col shrink-0" style={{ gap: `${gap}px`, width: 26 }}>
                {DAY_LABELS.map((label, i) => (
                  <div key={i} className="text-[10px] text-neutral-600 flex items-center justify-end pr-1"
                    style={{ height: cellPx }}>
                    {i % 2 === 0 ? label : ''}
                  </div>
                ))}
              </div>

              <div className="flex" style={{ gap: `${gap}px` }}>
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col" style={{ gap: `${gap}px` }}>
                    {week.map((day, di) => {
                      if (!day) {
                        return <div key={di} style={{ width: cellPx, height: cellPx }} />;
                      }
                      const intensity = day.isPast ? getIntensity(day.amount, maxAmount) : -1;
                      const isHovered = hoveredDay?.date === day.date;
                      return (
                        <div key={di}
                          className="rounded-[3px] transition-all duration-100"
                          style={{
                            width: cellPx, height: cellPx,
                            backgroundColor: intensity === -1 ? 'rgba(255,255,255,0.02)' : COLORS[intensity],
                            outline: isHovered ? '2px solid rgba(249,115,22,0.7)' : 'none',
                            outlineOffset: '-1px',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={() => setHoveredDay(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="min-h-[18px]">
                {hoveredDay ? (
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-[11px] text-neutral-300">{formatShortDate(hoveredDay.date)}</span>
                    <span className="text-[11px] font-bold text-orange-400 tabular-nums">
                      {hoveredDay.amount > 0 ? formatCurrency(hoveredDay.amount) : 'No spending'}
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] text-neutral-600">Hover a cell</span>
                )}
              </div>
              <div className="flex items-center gap-0.5">
                <span className="text-[9px] text-neutral-600 mr-0.5">Less</span>
                {COLORS.map((color, i) => (
                  <div key={i} className="rounded-[2px]" style={{ width: 10, height: 10, backgroundColor: color }} />
                ))}
                <span className="text-[9px] text-neutral-600 ml-0.5">More</span>
              </div>
            </div>
          </div>
        </div>

        {stats && (
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            <div className="bg-white/[0.02] rounded-xl p-3">
              <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1">Avg / Day</p>
              <p className="text-lg font-bold text-orange-400 tabular-nums">{formatCurrency(Math.round(stats.avgPerDay))}</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">across {stats.pastDays} days</p>
            </div>

            <div className="bg-white/[0.02] rounded-xl p-3">
              <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1">Peak Day</p>
              {stats.peakDay && (
                <>
                  <p className="text-lg font-bold text-orange-400 tabular-nums">{formatCurrency(stats.peakDay.amount)}</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{getDayName(stats.peakDay.date)}, {formatShortDate(stats.peakDay.date)}</p>
                </>
              )}
            </div>

            <div className="bg-white/[0.02] rounded-xl p-3">
              <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1">Active Days</p>
              <p className="text-lg font-bold text-neutral-200 tabular-nums">{stats.spendDays} <span className="text-sm font-normal text-neutral-500">/ {stats.pastDays}</span></p>
              <p className="text-[11px] text-neutral-500 mt-0.5">{stats.zeroDays} no-spend {stats.zeroDays === 1 ? 'day' : 'days'}</p>
            </div>

            <div className="bg-white/[0.02] rounded-xl p-3">
              <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1">Top Weekday</p>
              {stats.topWeekday && (
                <>
                  <p className="text-lg font-bold text-neutral-200">{stats.topWeekday[0]}</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{formatCurrency(Math.round(stats.topWeekday[1]))} total</p>
                </>
              )}
            </div>

            <div className="bg-white/[0.02] rounded-xl p-3">
              <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1">Spend Streak</p>
              <p className="text-lg font-bold text-neutral-200 tabular-nums">{stats.maxStreak} <span className="text-sm font-normal text-neutral-500">days</span></p>
              <p className="text-[11px] text-neutral-500 mt-0.5">longest consecutive</p>
            </div>

            <div className="bg-white/[0.02] rounded-xl p-3">
              <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1">Total Spent</p>
              <p className="text-lg font-bold text-orange-400 tabular-nums">{formatCurrency(stats.totalSpent)}</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">this cycle so far</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
