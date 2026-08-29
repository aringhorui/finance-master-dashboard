import { useState, useCallback } from 'react';
import { RefreshCw, ExternalLink, ChevronUp, Bell, BellOff } from 'lucide-react';
import { getRelativeTime, isStale } from '../utils/formatters';
import { STALE_DATA_MINUTES } from '../config';

const SYNC_WORKFLOW_URL = 'https://github.com/aringhorui/finance-master-data/actions/workflows/sync-notion.yml';

function getNotifState() {
  try {
    return typeof Notification !== 'undefined'
      && Notification.permission === 'granted'
      && localStorage.getItem('fm_notifications_enabled') === 'true';
  } catch { return false; }
}

function getNotifSupported() {
  try {
    return typeof Notification !== 'undefined' && 'serviceWorker' in navigator;
  } catch { return false; }
}

export function DataStatus({ lastSync, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [notifOn, setNotifOn] = useState(getNotifState);
  if (!lastSync) return null;
  const stale = isStale(lastSync, STALE_DATA_MINUTES);
  const showNotif = expanded && getNotifSupported();

  const toggleNotif = useCallback(async () => {
    try {
      if (getNotifState()) {
        localStorage.setItem('fm_notifications_enabled', 'false');
      } else {
        const result = await Notification.requestPermission();
        localStorage.setItem('fm_notifications_enabled', String(result === 'granted'));
      }
      setNotifOn(getNotifState());
    } catch {
      setNotifOn(false);
    }
  }, []);

  const handleSyncNow = useCallback(() => {
    window.open(SYNC_WORKFLOW_URL, '_blank');
  }, []);

  return (
    <div className="fixed bottom-[4.5rem] sm:bottom-4 right-4 z-20">
      {expanded && (
        <div
          className="absolute bottom-full right-0 mb-2 w-44 rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden"
          style={{ WebkitTransform: 'translateZ(0)' }}
        >
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 w-full px-3.5 py-2.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 border-b border-neutral-800"
          >
            <RefreshCw size={12} />
            Refresh Data
          </button>
          <button
            onClick={handleSyncNow}
            className="flex items-center gap-2 w-full px-3.5 py-2.5 text-xs font-medium text-orange-300 hover:bg-neutral-800 border-b border-neutral-800"
          >
            <ExternalLink size={12} />
            Sync Now
          </button>
          {showNotif && (
            <button
              onClick={toggleNotif}
              className={`flex items-center gap-2 w-full px-3.5 py-2.5 text-xs font-medium hover:bg-neutral-800 ${
                notifOn ? 'text-emerald-300' : 'text-neutral-400'
              }`}
            >
              {notifOn ? <Bell size={12} /> : <BellOff size={12} />}
              {notifOn ? 'Alerts On' : 'Alerts Off'}
            </button>
          )}
        </div>
      )}
      <button
        onClick={() => setExpanded((v) => !v)}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs border ${
          stale
            ? 'bg-orange-950 border-orange-800/30 text-orange-300'
            : 'bg-neutral-900 border-neutral-800 text-neutral-400'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${stale ? 'bg-orange-400 animate-pulse' : 'bg-emerald-400'}`} />
        {stale ? `Data may be outdated (${getRelativeTime(lastSync)})` : `Synced ${getRelativeTime(lastSync)}`}
        <ChevronUp size={12} className={`transition-transform ${expanded ? '' : 'rotate-180'}`} />
      </button>
    </div>
  );
}
