import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export function FilterBar({ filters, onChange, options }) {
  const [expanded, setExpanded] = useState(false);

  const hasActive =
    filters.category || filters.subCategory || filters.paymentMethod ||
    filters.bankAccount || filters.search || filters.dateRange.start || filters.dateRange.end;

  const update = (field, value) => onChange((prev) => ({ ...prev, [field]: value }));
  const updateDateRange = (field, value) =>
    onChange((prev) => ({ ...prev, dateRange: { ...prev.dateRange, [field]: value } }));
  const clearAll = () =>
    onChange({ dateRange: { start: null, end: null }, category: '', subCategory: '', paymentMethod: '', bankAccount: '', search: '' });

  const selectCls = 'px-3 py-2';
  const inputCls = 'px-3 py-2';

  return (
    <div className="card p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            className={`${inputCls} !pl-9 w-full`}
            aria-label="Search transactions"
          />
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className={`sm:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
            hasActive ? 'bg-orange-500/15 text-orange-300 border border-orange-500/20' : 'bg-white/[0.04] text-neutral-400 border border-white/[0.08]'
          }`}
          aria-label="Toggle filters"
        >
          <SlidersHorizontal size={14} />
          {hasActive ? 'Filtered' : 'Filters'}
        </button>

        <div className="hidden sm:flex flex-wrap items-center gap-2 flex-1">
          <select value={filters.category} onChange={(e) => update('category', e.target.value)} className={selectCls} style={{ maxWidth: 150 }} aria-label="Category">
            <option value="">All Categories</option>
            {options.categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.subCategory} onChange={(e) => update('subCategory', e.target.value)} className={selectCls} style={{ maxWidth: 155 }} aria-label="Sub Category">
            <option value="">All Sub Categories</option>
            {options.subCategories.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.paymentMethod} onChange={(e) => update('paymentMethod', e.target.value)} className={selectCls} style={{ maxWidth: 160 }} aria-label="Payment Method">
            <option value="">All Payments</option>
            {options.paymentMethods.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filters.bankAccount} onChange={(e) => update('bankAccount', e.target.value)} className={selectCls} style={{ maxWidth: 145 }} aria-label="Bank">
            <option value="">All Banks</option>
            {options.bankAccounts.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <input type="date" value={filters.dateRange.start || ''} onChange={(e) => updateDateRange('start', e.target.value || null)} className={inputCls} style={{ maxWidth: 145 }} aria-label="From date" />
          <input type="date" value={filters.dateRange.end || ''} onChange={(e) => updateDateRange('end', e.target.value || null)} className={inputCls} style={{ maxWidth: 145 }} aria-label="To date" />
        </div>

        {hasActive && (
          <button onClick={clearAll} className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors" aria-label="Clear all filters">
            <X size={14} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {expanded && (
        <div className="sm:hidden grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/[0.06]">
          <select value={filters.category} onChange={(e) => update('category', e.target.value)} className={`${selectCls} w-full`} aria-label="Category">
            <option value="">All Categories</option>
            {options.categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.subCategory} onChange={(e) => update('subCategory', e.target.value)} className={`${selectCls} w-full`} aria-label="Sub Category">
            <option value="">All Sub Categories</option>
            {options.subCategories.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.paymentMethod} onChange={(e) => update('paymentMethod', e.target.value)} className={`${selectCls} w-full`} aria-label="Payment">
            <option value="">All Payments</option>
            {options.paymentMethods.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filters.bankAccount} onChange={(e) => update('bankAccount', e.target.value)} className={`${selectCls} w-full`} aria-label="Bank">
            <option value="">All Banks</option>
            {options.bankAccounts.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <input type="date" value={filters.dateRange.start || ''} onChange={(e) => updateDateRange('start', e.target.value || null)} className={`${inputCls} w-full`} aria-label="From" />
          <input type="date" value={filters.dateRange.end || ''} onChange={(e) => updateDateRange('end', e.target.value || null)} className={`${inputCls} w-full`} aria-label="To" />
        </div>
      )}

      {hasActive && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-orange-400/80">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          Filters active — showing filtered results
        </div>
      )}
    </div>
  );
}
