import { TrendingUp, AlertTriangle, Lightbulb, Zap } from 'lucide-react';

const config = {
  positive: { Icon: TrendingUp, bg: 'bg-emerald-500/8', border: 'border-emerald-500/10', icon: 'text-emerald-400', dot: 'bg-emerald-400' },
  warning: { Icon: AlertTriangle, bg: 'bg-orange-500/8', border: 'border-orange-500/10', icon: 'text-orange-400', dot: 'bg-orange-400' },
  neutral: { Icon: Lightbulb, bg: 'bg-amber-500/8', border: 'border-amber-500/10', icon: 'text-amber-400', dot: 'bg-amber-400' },
};

export function Insights({ insights }) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={16} className="text-orange-400" />
        <h2 className="section-title">Insights</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
        {insights.map((insight, i) => {
          const c = config[insight.type] || config.neutral;
          return (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 sm:p-3.5 rounded-xl border ${c.bg} ${c.border} transition-colors`}
            >
              <div className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
              <p className="text-[12px] sm:text-[13px] text-neutral-300 leading-relaxed">{insight.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
