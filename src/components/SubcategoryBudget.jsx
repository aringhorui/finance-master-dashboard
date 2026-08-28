import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine,
} from 'recharts';
import { AlertTriangle, Check, Edit3, Save, X, ChevronDown, ChevronUp, PieChart } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { getCategoryColor } from '../config';

const STORAGE_KEY = 'fm_subcategory_budgets';

function loadBudgets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveBudgets(budgets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
}

function BudgetBar({ name, spent, budget, index }) {
  const pct = budget > 0 ? (spent / budget) * 100 : 0;
  const isOver = pct > 100;
  const isWarning = pct > 80 && pct <= 100;

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 min-w-0">
          {isOver ? (
            <AlertTriangle size={12} className="text-red-400 shrink-0" />
          ) : isWarning ? (
            <AlertTriangle size={12} className="text-amber-400 shrink-0" />
          ) : (
            <Check size={12} className="text-emerald-400 shrink-0" />
          )}
          <span className="text-sm text-neutral-300 truncate">{name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <span className="text-xs text-neutral-400 tabular-nums">
            {formatCurrency(spent)} / {formatCurrency(budget)}
          </span>
          <span className={`text-xs font-medium tabular-nums w-12 text-right ${
            isOver ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {pct.toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isOver ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}

function BudgetTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const pct = d.budget > 0 ? ((d.spent / d.budget) * 100).toFixed(1) : '0';
  return (
    <div className="bg-neutral-900/95 border border-white/10 rounded-xl px-3.5 py-2.5 shadow-2xl backdrop-blur-sm">
      <p className="text-neutral-300 text-xs font-medium mb-1.5">{d.name}</p>
      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-400" />
          <span className="text-neutral-400">Spent:</span>
          <span className="text-white font-semibold tabular-nums">{formatCurrency(d.spent)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-neutral-500" />
          <span className="text-neutral-400">Budget:</span>
          <span className="text-neutral-200 tabular-nums">{formatCurrency(d.budget)}</span>
        </div>
        <p className={`text-xs font-medium mt-1 ${d.spent > d.budget ? 'text-red-400' : 'text-emerald-400'}`}>
          {d.spent > d.budget
            ? `${formatCurrency(d.spent - d.budget)} over budget (${pct}%)`
            : `${formatCurrency(d.budget - d.spent)} remaining (${pct}%)`}
        </p>
      </div>
    </div>
  );
}

export function SubcategoryBudget({ subCategories, expenses }) {
  const [budgets, setBudgets] = useState(loadBudgets);
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState({});
  const [showAll, setShowAll] = useState(false);

  const subCatData = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const sub = e.sub_category || 'Other';
      if (!map[sub]) map[sub] = { name: sub, spent: 0, count: 0 };
      map[sub].spent += e.amount || 0;
      map[sub].count += 1;
    });
    return Object.values(map)
      .sort((a, b) => b.spent - a.spent)
      .map((item) => ({
        ...item,
        budget: budgets[item.name] || 0,
      }));
  }, [expenses, budgets]);

  const withBudget = subCatData.filter((d) => d.budget > 0);
  const withoutBudget = subCatData.filter((d) => d.budget === 0);
  const overBudget = withBudget.filter((d) => d.spent > d.budget);
  const warningBudget = withBudget.filter((d) => d.spent > d.budget * 0.8 && d.spent <= d.budget);
  const onTrack = withBudget.filter((d) => d.spent <= d.budget * 0.8);

  const totalBudgeted = withBudget.reduce((s, d) => s + d.budget, 0);
  const totalSpentBudgeted = withBudget.reduce((s, d) => s + d.spent, 0);

  const chartData = withBudget
    .sort((a, b) => (b.spent / b.budget) - (a.spent / a.budget))
    .slice(0, 12);

  const startEdit = () => {
    const vals = {};
    subCatData.forEach((d) => {
      vals[d.name] = budgets[d.name] || '';
    });
    setEditValues(vals);
    setEditing(true);
  };

  const saveEdit = () => {
    const next = {};
    Object.entries(editValues).forEach(([k, v]) => {
      const num = Number(v);
      if (num > 0) next[k] = num;
    });
    setBudgets(next);
    saveBudgets(next);
    setEditing(false);
  };

  const displayList = showAll ? subCatData : subCatData.slice(0, 8);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        <div className="card p-4">
          <p className="text-[11px] text-neutral-500 uppercase tracking-wider mb-1">Over Budget</p>
          <p className="text-2xl font-bold text-red-400 tabular-nums">{overBudget.length}</p>
          <p className="text-xs text-neutral-500 mt-0.5">subcategories</p>
        </div>
        <div className="card p-4">
          <p className="text-[11px] text-neutral-500 uppercase tracking-wider mb-1">Warning</p>
          <p className="text-2xl font-bold text-amber-400 tabular-nums">{warningBudget.length}</p>
          <p className="text-xs text-neutral-500 mt-0.5">80%+ used</p>
        </div>
        <div className="card p-4">
          <p className="text-[11px] text-neutral-500 uppercase tracking-wider mb-1">On Track</p>
          <p className="text-2xl font-bold text-emerald-400 tabular-nums">{onTrack.length}</p>
          <p className="text-xs text-neutral-500 mt-0.5">under 80%</p>
        </div>
        <div className="card p-4">
          <p className="text-[11px] text-neutral-500 uppercase tracking-wider mb-1">Budget Used</p>
          <p className="text-2xl font-bold text-orange-400 tabular-nums">
            {totalBudgeted > 0 ? `${((totalSpentBudgeted / totalBudgeted) * 100).toFixed(0)}%` : '—'}
          </p>
          <p className="text-xs text-neutral-500 mt-0.5 truncate">
            {totalBudgeted > 0 ? `${formatCurrency(totalSpentBudgeted)} / ${formatCurrency(totalBudgeted)}` : 'Set budgets below'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Budget vs Spent chart */}
        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChart size={16} className="text-orange-400" />
              <h2 className="section-title">Budget vs Actual</h2>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-orange-500" />
                <span className="text-neutral-500">Spent</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-neutral-600" />
                <span className="text-neutral-500">Budget</span>
              </div>
            </div>
          </div>
          {chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-neutral-500 text-sm">
              Set subcategory budgets to see analysis
            </div>
          ) : (
            <div className="h-64 sm:h-80 overflow-x-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: '#525252', fontSize: 10 }}
                    tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: '#a3a3a3', fontSize: 11 }}
                    width={90}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<BudgetTooltip />} cursor={{ fill: 'rgba(249,115,22,0.06)' }} />
                  <Bar dataKey="budget" fill="#404040" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="spent" radius={[0, 4, 4, 0]} barSize={12}>
                    {chartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.spent > entry.budget ? '#ef4444' : entry.spent > entry.budget * 0.8 ? '#f59e0b' : '#22c55e'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Budget progress list */}
        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Subcategory Budgets</h2>
            <button
              onClick={editing ? saveEdit : startEdit}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-300"
            >
              {editing ? <><Save size={12} /> Save</> : <><Edit3 size={12} /> Edit Budgets</>}
            </button>
          </div>

          {editing ? (
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {subCatData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="text-sm text-neutral-400 flex-1 truncate">{d.name}</span>
                  <span className="text-xs text-neutral-500 tabular-nums w-20 text-right">
                    Spent: {formatCurrency(d.spent)}
                  </span>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-500">₹</span>
                    <input
                      type="number"
                      value={editValues[d.name] ?? ''}
                      onChange={(e) => setEditValues((p) => ({ ...p, [d.name]: e.target.value }))}
                      placeholder="0"
                      className="w-24 pl-6 pr-2 py-1.5 text-xs text-right bg-white/[0.04] border border-white/[0.08] rounded-lg text-neutral-200 focus:outline-none focus:ring-1 focus:ring-orange-500/50 tabular-nums"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={() => setEditing(false)}
                className="mt-2 text-xs text-neutral-500 hover:text-neutral-300 flex items-center gap-1"
              >
                <X size={12} /> Cancel
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {withBudget.length === 0 ? (
                <div className="py-8 text-center text-neutral-500 text-sm">
                  <p>No budgets set yet.</p>
                  <p className="text-xs mt-1">Click "Edit Budgets" to assign budgets to subcategories.</p>
                </div>
              ) : (
                <>
                  {(showAll ? withBudget : withBudget.slice(0, 8)).map((d, i) => (
                    <BudgetBar key={d.name} name={d.name} spent={d.spent} budget={d.budget} index={i} />
                  ))}
                  {withBudget.length > 8 && (
                    <button
                      onClick={() => setShowAll((v) => !v)}
                      className="w-full mt-2 py-1.5 text-xs text-neutral-500 hover:text-neutral-300 flex items-center justify-center gap-1"
                    >
                      {showAll ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Show all {withBudget.length}</>}
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Over-budget alerts */}
      {overBudget.length > 0 && (
        <div className="card p-4 sm:p-6 border-red-500/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-red-400" />
            <h2 className="section-title text-red-400">Over Budget Alerts</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {overBudget.map((d) => {
              const over = d.spent - d.budget;
              const pct = ((d.spent / d.budget) * 100).toFixed(0);
              return (
                <div key={d.name} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-red-500/5 border border-red-500/10">
                  <div className="min-w-0">
                    <p className="text-sm text-neutral-200 font-medium truncate">{d.name}</p>
                    <p className="text-xs text-red-400 mt-0.5">
                      {formatCurrency(over)} over ({pct}% of budget)
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-semibold text-red-400 tabular-nums">{formatCurrency(d.spent)}</p>
                    <p className="text-[10px] text-neutral-500">of {formatCurrency(d.budget)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function getSubcategoryBudgets() {
  return loadBudgets();
}
