import { useState, useCallback } from 'react';
import { PieChart, Pie, Cell, Sector, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/formatters';
import { getCategoryColor } from '../config';

function lightenColor(hex, amount = 0.3) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amount));
  const b = Math.min(255, (num & 0xff) + Math.round(255 * amount));
  return `rgb(${r}, ${g}, ${b})`;
}

function darkenColor(hex, amount = 0.15) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.round(((num >> 16) & 0xff) * (1 - amount)));
  const g = Math.max(0, Math.round(((num >> 8) & 0xff) * (1 - amount)));
  const b = Math.max(0, Math.round((num & 0xff) * (1 - amount)));
  return `rgb(${r}, ${g}, ${b})`;
}

function ActiveShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius - 3} outerRadius={outerRadius + 6}
        startAngle={startAngle} endAngle={endAngle} fill={fill}
        stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
    </g>
  );
}

function OuterActiveShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 5}
        startAngle={startAngle} endAngle={endAngle} fill={fill}
        stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
    </g>
  );
}

function DetailPanel({ info, totalSpent }) {
  if (!info) return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 py-6">
      <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-3">
        <span className="text-orange-400 text-xl">&#9206;</span>
      </div>
      <p className="text-sm text-neutral-400 mb-1">Click or hover a segment</p>
      <p className="text-[11px] text-neutral-600">to see where your money goes</p>
      <div className="mt-4 text-center">
        <p className="text-[10px] text-neutral-600 uppercase tracking-wider">Total Spent</p>
        <p className="text-xl font-bold text-orange-400 tabular-nums">{formatCurrency(totalSpent)}</p>
      </div>
    </div>
  );

  const isSubcat = info.type === 'subcategory';

  return (
    <div className="px-4 py-4 sm:py-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: info.color }} />
        {isSubcat && <span className="text-[11px] text-neutral-500">{info.category} &rsaquo;</span>}
      </div>
      <h3 className="text-lg font-bold text-neutral-100 mb-1">{info.name}</h3>
      <p className="text-2xl sm:text-3xl font-bold text-orange-400 tabular-nums mb-3">
        {formatCurrency(info.amount)}
      </p>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-neutral-500">% of total spending</span>
          <span className="text-sm font-semibold text-neutral-200 tabular-nums">{info.percent.toFixed(1)}%</span>
        </div>
        <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-orange-500 transition-all duration-300"
            style={{ width: `${Math.min(100, info.percent)}%` }} />
        </div>

        {isSubcat && (
          <>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-neutral-500">% of {info.category}</span>
              <span className="text-sm font-semibold text-neutral-200 tabular-nums">{info.categoryPercent.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, info.categoryPercent)}%`, backgroundColor: info.color }} />
            </div>
          </>
        )}

        <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/[0.04]">
          <span className="text-xs text-neutral-500">Transactions</span>
          <span className="text-sm font-semibold text-neutral-200 tabular-nums">{info.count}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-neutral-500">Avg per transaction</span>
          <span className="text-sm font-semibold text-neutral-200 tabular-nums">
            {formatCurrency(Math.round(info.amount / Math.max(1, info.count)))}
          </span>
        </div>
      </div>
    </div>
  );
}

export function SunburstChart({ hierarchy, totalSpent }) {
  const [activeInner, setActiveInner] = useState(null);
  const [activeOuter, setActiveOuter] = useState(null);
  const [selectedInfo, setSelectedInfo] = useState(null);

  const innerData = hierarchy.map((cat, i) => ({
    name: cat.name, value: cat.amount, percent: cat.percent,
    count: cat.count, fill: getCategoryColor(cat.name, i),
  }));

  const outerData = [];
  hierarchy.forEach((cat, catIdx) => {
    const catColor = getCategoryColor(cat.name, catIdx);
    cat.subcategories.forEach((sub, subIdx) => {
      const shade = subIdx % 2 === 0
        ? darkenColor(catColor, 0.1 + subIdx * 0.05)
        : lightenColor(catColor, 0.05 + subIdx * 0.03);
      outerData.push({
        name: sub.name, value: sub.amount, percent: sub.percent,
        categoryPercent: sub.categoryPercent, category: cat.name,
        count: sub.count, fill: shade,
      });
    });
  });

  const selectInner = useCallback((_, index) => {
    setActiveInner(index);
    setActiveOuter(null);
    const d = innerData[index];
    setSelectedInfo({ type: 'category', name: d.name, amount: d.value,
      percent: d.percent, count: d.count, color: d.fill });
  }, [innerData]);

  const selectOuter = useCallback((_, index) => {
    setActiveOuter(index);
    setActiveInner(null);
    const d = outerData[index];
    setSelectedInfo({ type: 'subcategory', name: d.name, category: d.category,
      amount: d.value, percent: d.percent, categoryPercent: d.categoryPercent,
      count: d.count, color: d.fill });
  }, [outerData]);

  if (!hierarchy || hierarchy.length === 0) {
    return (
      <div className="card p-4 sm:p-6">
        <h2 className="section-title mb-4">Spending Breakdown</h2>
        <div className="h-64 flex items-center justify-center text-neutral-500 text-sm">No data</div>
      </div>
    );
  }

  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="section-title">Spending Breakdown</h2>
        <span className="text-xs text-neutral-500">{hierarchy.length} categories</span>
      </div>
      <p className="text-[11px] text-neutral-600 mb-4">Inner ring = categories &middot; Outer ring = sub-categories &middot; Click for details</p>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-1/2 h-[300px] sm:h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={innerData} dataKey="value" cx="50%" cy="50%"
                innerRadius="28%" outerRadius="50%" paddingAngle={2}
                stroke="rgba(0,0,0,0.3)" strokeWidth={1}
                activeIndex={activeInner} activeShape={ActiveShape}
                onMouseEnter={selectInner} onClick={selectInner}>
                {innerData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} style={{ cursor: 'pointer' }} />
                ))}
              </Pie>
              <Pie data={outerData} dataKey="value" cx="50%" cy="50%"
                innerRadius="53%" outerRadius="82%" paddingAngle={1}
                stroke="rgba(0,0,0,0.2)" strokeWidth={0.5}
                activeIndex={activeOuter} activeShape={OuterActiveShape}
                onMouseEnter={selectOuter} onClick={selectOuter}>
                {outerData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} style={{ cursor: 'pointer' }} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="card bg-white/[0.02] border-orange-500/10 flex-1 min-h-[200px]">
            <DetailPanel info={selectedInfo} totalSpent={totalSpent} />
          </div>

          <div className="mt-3 max-h-[180px] overflow-y-auto space-y-0.5 pr-1">
            {hierarchy.map((cat, i) => {
              const color = getCategoryColor(cat.name, i);
              const isActive = selectedInfo?.type === 'category' && selectedInfo?.name === cat.name;
              return (
                <div key={cat.name}
                  className={`flex items-center gap-2 py-1 px-2 -mx-1 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-orange-500/10' : 'hover:bg-white/[0.03]'}`}
                  onClick={() => {
                    setActiveInner(i);
                    setActiveOuter(null);
                    setSelectedInfo({ type: 'category', name: cat.name, amount: cat.amount,
                      percent: cat.percent, count: cat.count, color });
                  }}>
                  <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                  <span className="flex-1 text-xs text-neutral-300 truncate">{cat.name}</span>
                  <span className="text-xs font-semibold text-neutral-200 tabular-nums">{formatCurrency(cat.amount)}</span>
                  <span className="text-[11px] text-neutral-500 tabular-nums w-10 text-right">{cat.percent.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
