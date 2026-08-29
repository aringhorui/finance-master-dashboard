import { useState } from 'react';
import { RefreshCw, ExternalLink, ChevronUp, Bell, BellOff, Link2, Check } from 'lucide-react';
import { getRelativeTime, isStale } from '../utils/formatters';
import { STALE_DATA_MINUTES } from '../config';
import { isSupported as notifSupported, isEnabled as notifEnabled, requestPermission, disable as disableNotif } from '../utils/notifications';
import { copySettingsLink, getSettingsURL } from '../utils/settingsSync';

const SYNC_WORKFLOW_URL = 'https://github.com/aringhorui/finance-master-data/actions/workflows/sync-notion.yml';

export function DataStatus({ lastSync, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [notifOn, setNotifOn] = useState(notifEnabled);
  const [copied, setCopied] = useState(false);
  if (!lastSync) return null;
  const stale = isStale(lastSync, STALE_DATA_MINUTES);

  const handleCopySettings = async () => {
    const ok = await copySettingsLink();
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleNotif = async () => {
    if (notifOn()) {
      disableNotif();
      setNotifOn(() => notifEnabled);
    } else {
      await requestPermission();
      setNotifOn(() => notifEnabled);
    }
  };

  return (
    <div className="fixed bottom-[4.5rem] sm:bottom-4 right-4 z-20">
      <div className="flex flex-col items-end gap-1.5">
        {expanded && (
          <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2">
            <button
              onClick={onRefresh}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-neutral-900/90 border border-white/[0.08] text-neutral-300 hover:text-orange-300 hover:border-orange-500/20 backdrop-blur-xl shadow-lg transition-colors"
            >
              <RefreshCw size={12} />
              Refresh Data
            </button>
            <a
              href={SYNC_WORKFLOW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-orange-500/10 border border-orange-500/20 text-orange-300 hover:bg-orange-500/20 backdrop-blur-xl shadow-lg transition-colors"
            >
              <ExternalLink size={12} />
              Sync Now
            </a>
            {notifSupported() && (
              <button
                onClick={toggleNotif}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border backdrop-blur-xl shadow-lg transition-colors ${
                  notifOn()
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20'
                    : 'bg-neutral-900/90 border-white/[0.08] text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {notifOn() ? <Bell size={12} /> : <BellOff size={12} />}
                {notifOn() ? 'Alerts On' : 'Alerts Off'}
              </button>
            )}
            {getSettingsURL() && (
              <button
                onClick={handleCopySettings}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border backdrop-blur-xl shadow-lg transition-colors ${
                  copied
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : 'bg-neutral-900/90 border-white/[0.08] text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {copied ? <Check size={12} /> : <Link2 size={12} />}
                {copied ? 'Copied!' : 'Sync Settings'}
              </button>
            )}
          </div>
        )}
        <button
          onClick={() => setExpanded((v) => !v)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs border backdrop-blur-xl shadow-lg transition-colors ${
            stale
              ? 'bg-orange-950/60 border-orange-800/30 text-orange-300'
              : 'bg-neutral-900/80 border-white/[0.06] text-neutral-400'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${stale ? 'bg-orange-400 animate-pulse' : 'bg-emerald-400'}`} />
          {stale ? `Data may be outdated (${getRelativeTime(lastSync)})` : `Synced ${getRelativeTime(lastSync)}`}
          <ChevronUp size={12} className={`transition-transform ${expanded ? '' : 'rotate-180'}`} />
        </button>
      </div>
    </div>
  );
}
