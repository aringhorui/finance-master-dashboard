import { getRelativeTime, isStale } from '../utils/formatters';
import { STALE_DATA_MINUTES } from '../config';

export function DataStatus({ lastSync }) {
  if (!lastSync) return null;
  const stale = isStale(lastSync, STALE_DATA_MINUTES);

  return (
    <div className="fixed bottom-4 right-4 z-20">
      <div
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs border backdrop-blur-xl shadow-lg ${
          stale
            ? 'bg-orange-950/60 border-orange-800/30 text-orange-300'
            : 'bg-neutral-900/80 border-white/[0.06] text-neutral-400'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${stale ? 'bg-orange-400 animate-pulse' : 'bg-emerald-400'}`} />
        {stale ? `Data may be outdated (${getRelativeTime(lastSync)})` : `Synced ${getRelativeTime(lastSync)}`}
      </div>
    </div>
  );
}
