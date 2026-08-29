import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Sun, Sunrise, Sunset, Moon } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { useReveal } from '../hooks/useReveal';

const PERIODS = [
  { key: 'morning', label: 'Morning', range: '6am–12pm', hours: [6,7,8,9,10,11], icon: Sunrise, color: '#fbbf24' },
  { key: 'afternoon', label: 'Afternoon', range: '12pm–5pm', hours: [12,13,14,15,16], icon: Sun, color: '#f97316' },
  { key: 'evening', label: 'Evening', range: '5pm–9pm', hours: [17,18,19,20], icon: Sunset, color: '#ea580c' },
  { key: 'night', label: 'Night', range: '9pm–6am', hours: [21,22,23,0,1,2,3,4,5], icon: Moon, color: '#7c3aed' },
];

function TooltipContent({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-neutral-900/95 border border-white/10 rounded-xl px-3.5 py-2.5 shadow-2xl backdrop-blur-sm">
      <p className="text-neutral-300 text-xs font-medium mb-1">{d.hour}</p>
      <p className="text-white font-semibold tabular-nums">{formatCurrency(d.total)}</p>
      <p className="text-neutral-500 text-[11px]">{d.count} transactions</p>
    </div>
  );
}

function getHourColor(hour) {
  for (const p of PERIODS) {
    if (p.hours.includes(hour)) return p.color;
  }
  return '#525252';
}

export function TimeOfDay({ expenses }) {
  const ref = useReveal();

  const { periods, hourly, peakPeriod } = useMemo(() => {
    const periodMap = {};
    PERIODS.forEach((p) => { periodMap[p.key] = { ...p, total: 0, count: 0 }; });

    const hourlyMap = Array.from({ length: 24 }, (_, i) => ({
      hourNum: i,
      hour: i === 0 ? '12am' : i < 12 ? `${i}am` : i === 12 ? '12pm' : `${i - 12}pm`,
      total: 0,
      count: 0,
    }));

    expenses.forEach((e) => {
      if (!e.date) return;
      const d = new Date(e.date);
      if (isNaN(d.getTime())) return;
      const h = d.getHours();
      hourlyMap[h].total += e.amount || 0;
      hourlyMap[h].count += 1;

      for (const p of PERIODS) {
        if (p.hours.includes(h)) {
          periodMap[p.key].total += e.amount || 0;
          periodMap[p.key].count += 1;
          break;
        }
      }
    });

    const pList = Object.values(periodMap);
    const peak = pList.reduce((max, p) => p.total > max.total ? p : max, pList[0]);
    return { periods: pList, hourly: hourlyMap, peakPeriod: peak };
  }, [expenses]);

  const totalAll = periods.reduce((s, p) => s + p.total, 0);
  if (totalAll === 0) return null;

  return (
    <div ref={ref} className="reveal card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">Time of Day</h2>
        <span className="text-xs text-neutral-500">Peak: {peakPeriod.label}</span>
      </div>

      {/* Period cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {periods.map((p) => {
          const Icon = p.icon;
          const pct = totalAll > 0 ? (p.total / totalAll) * 100 : 0;
          const isPeak = p.key === peakPeriod.key;
          return (
            <div
              key={p.key}
              className={`p-3 rounded-xl border transition-all ${
                isPeak
                  ? 'bg-white/[0.04] border-orange-500/20'
                  : 'bg-white/[0.015] border-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Icon size={14} style={{ color: p.color }} />
                <span className="text-[11px] text-neutral-400 font-medium">{p.label}</span>
              </div>
              <p className="text-sm font-bold text-neutral-200 tabular-nums">{formatCurrency(p.total)}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-neutral-500">{p.count} txns</span>
                <span className="text-[10px] font-medium tabular-nums" style={{ color: p.color }}>{pct.toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hourly chart */}
      <div className="h-40 sm:h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hourly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="hour"
              tick={{ fill: '#525252', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fill: '#525252', fontSize: 9 }}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<TooltipContent />} cursor={{ fill: 'rgba(249,115,22,0.06)' }} />
            <Bar dataKey="total" radius={[3, 3, 0, 0]} barSize={10}>
              {hourly.map((entry) => (
                <Cell key={entry.hourNum} fill={getHourColor(entry.hourNum)} opacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
