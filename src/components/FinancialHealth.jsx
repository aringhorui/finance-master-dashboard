import { formatCurrency } from '../utils/formatters';
import { calculateCycleProgress, calculateSavings, calculateSpendingVelocity } from '../utils/calculations';

export function FinancialHealth({ salary, spent, expenses, salaryCycle }) {
  const remaining = salary - spent;
  const usedPct = salary > 0 ? (spent / salary) * 100 : 0;
  const savings = calculateSavings(expenses);
  const cycle = salaryCycle ? calculateCycleProgress(salaryCycle.start, salaryCycle.end) : null;
  const velocity = cycle ? calculateSpendingVelocity(spent, salary, cycle) : null;

  const barColor =
    usedPct >= 90 ? 'from-red-500 to-red-400' :
    usedPct >= 75 ? 'from-orange-500 to-amber-400' :
    usedPct >= 50 ? 'from-orange-400 to-yellow-400' :
    'from-emerald-500 to-emerald-400';

  const velocityLabel = velocity?.status === 'over' ? 'Ahead of budget' : velocity?.status === 'warning' ? 'Slightly ahead' : 'On track';
  const velocityColor = velocity?.status === 'over' ? 'text-red-400' : velocity?.status === 'warning' ? 'text-amber-400' : 'text-emerald-400';
  const velocityDot = velocity?.status === 'over' ? 'bg-red-400' : velocity?.status === 'warning' ? 'bg-amber-400' : 'bg-emerald-400';

  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h2 className="section-title">Financial Health</h2>
        {velocity && (
          <div className={`flex items-center gap-2 text-xs font-medium ${velocityColor}`}>
            <span className={`w-2 h-2 rounded-full ${velocityDot}`} />
            {velocityLabel}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-5 sm:mb-6">
        <div>
          <p className="text-[11px] text-neutral-500 uppercase tracking-wider mb-1">Salary</p>
          <p className="text-lg sm:text-xl font-bold text-neutral-100 tabular-nums">{formatCurrency(salary)}</p>
        </div>
        <div>
          <p className="text-[11px] text-neutral-500 uppercase tracking-wider mb-1">Spent</p>
          <p className="text-lg sm:text-xl font-bold text-orange-400 tabular-nums">{formatCurrency(spent)}</p>
        </div>
        <div>
          <p className="text-[11px] text-neutral-500 uppercase tracking-wider mb-1">Remaining</p>
          <p className={`text-lg sm:text-xl font-bold tabular-nums ${remaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(Math.abs(remaining))}
          </p>
        </div>
        {savings > 0 && (
          <div>
            <p className="text-[11px] text-neutral-500 uppercase tracking-wider mb-1">Savings</p>
            <p className="text-lg sm:text-xl font-bold text-orange-300 tabular-nums">{formatCurrency(savings)}</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-400 tabular-nums">
            {formatCurrency(spent)} of {formatCurrency(salary)}
          </span>
          <span className="text-neutral-300 font-semibold tabular-nums">{usedPct.toFixed(1)}%</span>
        </div>
        <div className="h-3 bg-white/[0.04] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
            style={{ width: `${Math.min(100, usedPct)}%` }}
          />
        </div>
      </div>

      {cycle && (
        <div className="mt-4 sm:mt-5 grid grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-white/[0.06]">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-neutral-200 tabular-nums">{cycle.daysElapsed}</p>
            <p className="text-[10px] sm:text-[11px] text-neutral-500 uppercase tracking-wider mt-0.5">Days Elapsed</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-neutral-200 tabular-nums">{cycle.daysRemaining}</p>
            <p className="text-[10px] sm:text-[11px] text-neutral-500 uppercase tracking-wider mt-0.5">Days Left</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-orange-400 tabular-nums">{cycle.progressPercent.toFixed(0)}%</p>
            <p className="text-[10px] sm:text-[11px] text-neutral-500 uppercase tracking-wider mt-0.5">Cycle Done</p>
          </div>
        </div>
      )}
    </div>
  );
}
