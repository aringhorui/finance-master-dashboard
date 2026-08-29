import { useMemo } from 'react';
import { Heart, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { useReveal } from '../hooks/useReveal';

const TARGET_WANT_PCT = 30;

export function WantVsNeed({ expenses }) {
  const ref = useReveal();

  const data = useMemo(() => {
    let wantTotal = 0, needTotal = 0, wantCount = 0, needCount = 0;
    expenses.forEach((e) => {
      const cat = (e.category || '').toLowerCase();
      if (cat === 'want') {
        wantTotal += e.amount || 0;
        wantCount++;
      } else {
        needTotal += e.amount || 0;
        needCount++;
      }
    });
    const total = wantTotal + needTotal;
    const wantPct = total > 0 ? (wantTotal / total) * 100 : 0;
    const needPct = total > 0 ? (needTotal / total) * 100 : 0;
    const overTarget = wantPct > TARGET_WANT_PCT;
    return { wantTotal, needTotal, wantCount, needCount, total, wantPct, needPct, overTarget };
  }, [expenses]);

  if (data.total === 0) return null;

  const gaugeAngle = (data.wantPct / 100) * 180;
  const statusColor = data.overTarget ? 'text-red-400' : 'text-emerald-400';
  const statusBg = data.overTarget ? 'bg-red-500/10' : 'bg-emerald-500/10';

  return (
    <div ref={ref} className="reveal card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="section-title">Want vs Need</h2>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${statusBg} ${statusColor}`}>
          {data.overTarget ? `${(data.wantPct - TARGET_WANT_PCT).toFixed(0)}% over target` : 'On target'}
        </span>
      </div>

      {/* Gauge */}
      <div className="flex justify-center mb-5">
        <div className="relative w-48 h-24 overflow-hidden">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            <path d="M 10 95 A 85 85 0 0 1 190 95" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" strokeLinecap="round" />
            <path
              d="M 10 95 A 85 85 0 0 1 190 95"
              fill="none"
              stroke={data.overTarget ? '#ef4444' : '#22c55e'}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${(gaugeAngle / 180) * 267} 267`}
              className="transition-all duration-1000"
            />
            <line
              x1="100" y1="95"
              x2={100 + 60 * Math.cos(Math.PI - (gaugeAngle / 180) * Math.PI)}
              y2={95 - 60 * Math.sin(Math.PI - (gaugeAngle / 180) * Math.PI)}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
            <p className={`text-2xl font-bold tabular-nums ${statusColor}`}>{data.wantPct.toFixed(0)}%</p>
            <p className="text-[10px] text-neutral-500">wants</p>
          </div>
        </div>
      </div>

      {/* Target line */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1.5">
          <span>Needs</span>
          <span>Target: {TARGET_WANT_PCT}% wants</span>
          <span>Wants</span>
        </div>
        <div className="relative h-3 bg-white/[0.04] rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-emerald-500/80 rounded-l-full transition-all duration-700"
            style={{ width: `${data.needPct}%` }}
          />
          <div
            className="absolute right-0 top-0 h-full bg-orange-500/80 rounded-r-full transition-all duration-700"
            style={{ width: `${data.wantPct}%` }}
          />
          <div
            className="absolute top-0 h-full w-0.5 bg-white/40"
            style={{ left: `${100 - TARGET_WANT_PCT}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium uppercase tracking-wider">Needs</span>
          </div>
          <p className="text-lg font-bold text-neutral-200 tabular-nums">{formatCurrency(data.needTotal)}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{data.needCount} transactions &middot; {data.needPct.toFixed(0)}%</p>
        </div>
        <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
          <div className="flex items-center gap-2 mb-1.5">
            <Heart size={14} className="text-orange-400" />
            <span className="text-xs text-orange-400 font-medium uppercase tracking-wider">Wants</span>
          </div>
          <p className="text-lg font-bold text-neutral-200 tabular-nums">{formatCurrency(data.wantTotal)}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{data.wantCount} transactions &middot; {data.wantPct.toFixed(0)}%</p>
        </div>
      </div>
    </div>
  );
}
