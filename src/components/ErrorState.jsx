import { AlertCircle, RefreshCw } from 'lucide-react';

export function ErrorState({ message, onRetry }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 mb-5">
          <AlertCircle size={32} className="text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-neutral-100 mb-2">
          Unable to load financial data
        </h2>
        <p className="text-sm text-neutral-400 mb-6">
          {message || 'An unexpected error occurred. Please check your connection and try again.'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium transition-colors"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
