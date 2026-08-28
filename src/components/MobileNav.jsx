import { useState, useEffect, useCallback } from 'react';
import { BarChart3, Target, Wallet, Receipt, TrendingDown } from 'lucide-react';

const SECTIONS = [
  { id: 'kpis', label: 'Overview', icon: BarChart3 },
  { id: 'health', label: 'Health', icon: TrendingDown },
  { id: 'categories', label: 'Spend', icon: Wallet },
  { id: 'budgets', label: 'Budgets', icon: Target },
  { id: 'transactions', label: 'Txns', icon: Receipt },
];

export function MobileNav() {
  const [active, setActive] = useState('kpis');

  const onScroll = useCallback(() => {
    const offset = window.scrollY + 120;
    let current = SECTIONS[0].id;
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el && el.offsetTop <= offset) current = s.id;
    }
    setActive(current);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const headerHeight = 60;
    const y = el.getBoundingClientRect().top + window.scrollY - headerHeight;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden">
      <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/[0.06] px-1 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-14">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-0 ${
                  isActive
                    ? 'text-orange-400'
                    : 'text-neutral-600 active:text-neutral-400'
                }`}
              >
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-orange-400 rounded-full" />
                )}
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className={`text-[10px] leading-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
