import { useEffect, useRef, useState } from 'react';

function AnimatedValue({ value }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const frameRef = useRef(null);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = value;

    const numPrev = parseFloat(String(prev).replace(/[^0-9.-]/g, '')) || 0;
    const numNext = parseFloat(String(value).replace(/[^0-9.-]/g, '')) || 0;

    if (numPrev === numNext || isNaN(numNext)) {
      setDisplay(value);
      return;
    }

    const prefix = String(value).match(/^[^0-9.-]*/)?.[0] || '';
    const suffix = String(value).match(/[^0-9.,]*$/)?.[0] || '';
    const hasComma = String(value).includes(',');
    const duration = 600;
    const start = performance.now();

    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const current = numPrev + (numNext - numPrev) * ease;
      const rounded = Math.round(current);
      const formatted = hasComma
        ? new Intl.NumberFormat('en-IN').format(rounded)
        : String(rounded);
      setDisplay(`${prefix}${formatted}${suffix}`);
      if (t < 1) frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [value]);

  return <>{display}</>;
}

export function KPICard({ label, value, context, icon: Icon, accentColor = '#6366f1' }) {
  return (
    <div className="card card-glow p-4 sm:p-5 flex gap-3 group">
      <div
        className="w-1 rounded-full shrink-0 self-stretch transition-all duration-300 group-hover:w-1.5"
        style={{ backgroundColor: accentColor }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
          {Icon && (
            <div
              className="p-1.5 rounded-lg shrink-0 transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: `${accentColor}15` }}
            >
              <Icon size={14} style={{ color: accentColor }} />
            </div>
          )}
        </div>
        <p className="stat-value text-slate-50 mt-1.5 animate-count">
          <AnimatedValue value={value} />
        </p>
        {context && <p className="text-xs text-slate-500 mt-1 truncate">{context}</p>}
      </div>
    </div>
  );
}
