import { RefreshCw, Activity } from 'lucide-react';
import { formatCycleDate, getRelativeTime } from '../utils/formatters';

export function Header({ salaryCycle, lastSync, loading, onRefresh }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div className="h-[2px] bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600" />
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <Activity size={18} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">FinanceMaster</h1>
            <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium uppercase tracking-widest">Personal Finance Dashboard</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] sm:text-[13px]">
          {salaryCycle && (
            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-neutral-500">Cycle</span>
              <span className="text-neutral-200 font-medium">
                {formatCycleDate(salaryCycle.start)}
              </span>
              <span className="text-neutral-600">&rarr;</span>
              <span className="text-neutral-200 font-medium">
                {formatCycleDate(salaryCycle.end)}
              </span>
            </div>
          )}
          {lastSync && (
            <span className="text-neutral-500 hidden sm:inline">
              Synced <span className="text-neutral-400">{getRelativeTime(lastSync)}</span>
            </span>
          )}
          <button
            onClick={onRefresh}
            disabled={loading}
            aria-label="Refresh data"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-300 text-[13px] font-medium transition-all disabled:opacity-40"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Syncing' : 'Refresh'}
          </button>
        </div>
      </div>
    </header>
  );
}
