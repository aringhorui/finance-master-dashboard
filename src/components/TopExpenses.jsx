import { formatCurrency, formatShortDate } from '../utils/formatters';
import { getCategoryColor } from '../config';

export function TopExpenses({ expenses }) {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="card p-4 sm:p-6">
        <h2 className="section-title mb-4">Top Expenses</h2>
        <div className="h-32 flex items-center justify-center text-neutral-500 text-sm">No expenses</div>
      </div>
    );
  }

  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">Top Expenses</h2>
        <span className="text-xs text-neutral-500">By amount</span>
      </div>
      <div className="space-y-1">
        {expenses.map((e, i) => {
          const color = getCategoryColor(e.category, i);
          return (
            <div
              key={e.id || i}
              className="flex items-center gap-2 sm:gap-3 py-2 sm:py-2.5 px-2 -mx-2 rounded-xl hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-xs font-bold text-neutral-600 w-5 text-right tabular-nums">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-neutral-200 truncate">{e.expense || 'Unknown'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="badge text-[10px]"
                    style={{ backgroundColor: `${color}18`, color }}
                  >
                    {e.category || 'Other'}
                  </span>
                  <span className="text-[11px] text-neutral-600">{formatShortDate(e.date)}</span>
                </div>
              </div>
              <span className="text-xs sm:text-sm font-bold text-neutral-100 tabular-nums shrink-0">
                {formatCurrency(e.amount)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
