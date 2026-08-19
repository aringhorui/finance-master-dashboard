import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getCategoryColor, ITEMS_PER_PAGE } from '../config';

export function TransactionTable({ expenses }) {
  const [sortCol, setSortCol] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    const copy = [...expenses];
    copy.sort((a, b) => {
      let av, bv;
      if (sortCol === 'amount') {
        av = a.amount || 0;
        bv = b.amount || 0;
      } else {
        av = (a[sortCol] || '').toString().toLowerCase();
        bv = (b[sortCol] || '').toString().toLowerCase();
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [expenses, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = sorted.slice(safePage * ITEMS_PER_PAGE, (safePage + 1) * ITEMS_PER_PAGE);

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir(col === 'amount' ? 'desc' : 'asc');
    }
    setPage(0);
  };

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <span className="text-neutral-700 ml-0.5 text-[10px]">&#8597;</span>;
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="inline ml-0.5 text-orange-400" />
      : <ChevronDown size={12} className="inline ml-0.5 text-orange-400" />;
  };

  const columns = [
    { key: 'date', label: 'Date', width: 'w-[100px]' },
    { key: 'expense', label: 'Expense', width: 'min-w-[160px]' },
    { key: 'amount', label: 'Amount', width: 'w-[95px]' },
    { key: 'category', label: 'Category', width: 'w-[120px]' },
    { key: 'sub_category', label: 'Sub Category', width: 'w-[120px]' },
    { key: 'payment_method', label: 'Payment', width: 'w-[100px]' },
    { key: 'bank_account', label: 'Bank', width: 'w-[80px]' },
  ];

  if (expenses.length === 0) {
    return (
      <div className="card p-4 sm:p-6">
        <h2 className="section-title mb-4">Transactions</h2>
        <div className="h-32 flex items-center justify-center text-neutral-500 text-sm">No transactions found</div>
      </div>
    );
  }

  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">Transactions</h2>
        <span className="text-xs text-neutral-500 tabular-nums">{expenses.length} total</span>
      </div>

      <div className="hidden md:block overflow-x-auto -mx-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {columns.map(({ key, label, width }) => (
                <th
                  key={key}
                  className={`text-left py-2.5 px-2.5 text-[11px] text-neutral-500 font-semibold uppercase tracking-wider cursor-pointer hover:text-neutral-300 select-none whitespace-nowrap ${width}`}
                  onClick={() => handleSort(key)}
                >
                  {label}<SortIcon col={key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageItems.map((e, i) => {
              const catColor = getCategoryColor(e.category, i);
              return (
                <tr
                  key={e.id || i}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="py-2.5 px-2.5 text-neutral-400 whitespace-nowrap tabular-nums text-[13px]">
                    {formatDate(e.date)}
                  </td>
                  <td className="py-2.5 px-2.5">
                    <span className="text-neutral-200 text-[13px] block truncate max-w-[220px]">{e.expense || '—'}</span>
                    {e.notes && (
                      <span className="text-[11px] text-neutral-600 block truncate max-w-[220px]">{e.notes}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2.5 text-neutral-100 font-semibold tabular-nums text-right text-[13px] whitespace-nowrap">
                    {formatCurrency(e.amount)}
                  </td>
                  <td className="py-2.5 px-2.5">
                    <span
                      className="badge text-[10px]"
                      style={{ backgroundColor: `${catColor}15`, color: catColor }}
                    >
                      {e.category || '—'}
                    </span>
                  </td>
                  <td className="py-2.5 px-2.5 text-neutral-400 text-[13px]">{e.sub_category || '—'}</td>
                  <td className="py-2.5 px-2.5 text-neutral-400 text-[13px]">{e.payment_method || '—'}</td>
                  <td className="py-2.5 px-2.5 text-neutral-400 text-[13px]">{e.bank_account || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-2">
        {pageItems.map((e, i) => {
          const catColor = getCategoryColor(e.category, i);
          return (
            <div key={e.id || i} className="bg-white/[0.02] border border-white/[0.04] rounded-xl px-3 py-2.5">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-neutral-200 font-medium truncate">{e.expense || '—'}</p>
                  {e.notes && <p className="text-[11px] text-neutral-600 truncate mt-0.5">{e.notes}</p>}
                </div>
                <span className="text-sm font-bold text-neutral-100 tabular-nums whitespace-nowrap">{formatCurrency(e.amount)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
                <span className="text-neutral-500 tabular-nums">{formatDate(e.date)}</span>
                <span className="badge text-[10px]" style={{ backgroundColor: `${catColor}15`, color: catColor }}>
                  {e.category || 'Other'}
                </span>
                {e.payment_method && <span className="text-neutral-500">{e.payment_method}</span>}
                {e.bank_account && <span className="text-neutral-600">{e.bank_account}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.06]">
          <span className="text-xs text-neutral-500 tabular-nums">
            {safePage * ITEMS_PER_PAGE + 1}–{Math.min((safePage + 1) * ITEMS_PER_PAGE, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(0)}
              disabled={safePage === 0}
              className="px-2 py-1.5 rounded-lg text-xs text-neutral-400 hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="First page"
            >
              First
            </button>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="p-1.5 rounded-lg hover:bg-white/[0.04] text-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-neutral-400 px-2 tabular-nums">{safePage + 1} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage >= totalPages - 1}
              className="p-1.5 rounded-lg hover:bg-white/[0.04] text-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setPage(totalPages - 1)}
              disabled={safePage >= totalPages - 1}
              className="px-2 py-1.5 rounded-lg text-xs text-neutral-400 hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Last page"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
