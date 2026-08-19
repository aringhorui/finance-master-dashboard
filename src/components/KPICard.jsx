export function KPICard({ label, value, context, icon: Icon, accentColor = '#6366f1' }) {
  return (
    <div className="card card-glow p-4 sm:p-5 flex gap-3">
      <div
        className="w-1 rounded-full shrink-0 self-stretch"
        style={{ backgroundColor: accentColor }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
          {Icon && (
            <div className="p-1.5 rounded-lg shrink-0" style={{ backgroundColor: `${accentColor}15` }}>
              <Icon size={14} style={{ color: accentColor }} />
            </div>
          )}
        </div>
        <p className="stat-value text-slate-50 mt-1.5">{value}</p>
        {context && <p className="text-xs text-slate-500 mt-1 truncate">{context}</p>}
      </div>
    </div>
  );
}
