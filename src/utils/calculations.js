export function calculateTotalSpent(expenses) {
  return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
}

export function calculateAverageDailySpending(expenses, cycleStart) {
  const total = calculateTotalSpent(expenses);
  const start = new Date(cycleStart);
  const now = new Date();
  const daysElapsed = Math.max(1, Math.ceil((now - start) / 86400000));
  return total / daysElapsed;
}

export function calculateRemainingDailyBudget(salary, totalSpent, cycleEnd) {
  const remaining = salary - totalSpent;
  const now = new Date();
  const end = new Date(cycleEnd);
  const daysLeft = Math.max(1, Math.ceil((end - now) / 86400000));
  return remaining / daysLeft;
}

export function calculateCycleProgress(cycleStart, cycleEnd) {
  const start = new Date(cycleStart);
  const end = new Date(cycleEnd);
  const now = new Date();
  const totalDays = Math.max(1, (end - start) / 86400000);
  const elapsed = Math.max(0, (now - start) / 86400000);
  return {
    daysElapsed: Math.min(Math.floor(elapsed), Math.floor(totalDays)),
    daysRemaining: Math.max(0, Math.ceil((end - now) / 86400000)),
    totalDays: Math.round(totalDays),
    progressPercent: Math.min(100, Math.max(0, (elapsed / totalDays) * 100)),
  };
}

export function calculateDailySpending(expenses, cycleStart, cycleEnd) {
  const dailyMap = {};
  expenses.forEach((e) => {
    if (!e.date) return;
    const dateKey = e.date.slice(0, 10);
    dailyMap[dateKey] = (dailyMap[dateKey] || 0) + (e.amount || 0);
  });
  const start = new Date(cycleStart);
  const end = new Date(cycleEnd);
  const now = new Date();
  const effectiveEnd = now < end ? now : end;
  const result = [];
  for (let d = new Date(start); d <= effectiveEnd; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, amount: dailyMap[key] || 0 });
  }
  return result;
}

export function calculateCumulativeSpending(expenses, cycleStart, cycleEnd, salary) {
  const dailyMap = {};
  expenses.forEach((e) => {
    if (!e.date) return;
    const dateKey = e.date.slice(0, 10);
    dailyMap[dateKey] = (dailyMap[dateKey] || 0) + (e.amount || 0);
  });
  const start = new Date(cycleStart);
  const end = new Date(cycleEnd);
  const now = new Date();
  const effectiveEnd = now < end ? now : end;
  const totalDays = Math.max(1, Math.ceil((end - start) / 86400000));
  const result = [];
  let cumulative = 0;
  let dayIndex = 0;
  for (let d = new Date(start); d <= effectiveEnd; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    cumulative += dailyMap[key] || 0;
    dayIndex++;
    result.push({
      date: key,
      actual: cumulative,
      ideal: Math.round((salary / totalDays) * dayIndex),
    });
  }
  return result;
}

export function calculateCategorySpending(expenses) {
  const map = {};
  expenses.forEach((e) => {
    const cat = e.category || 'Uncategorized';
    if (!map[cat]) map[cat] = { name: cat, amount: 0, count: 0 };
    map[cat].amount += e.amount || 0;
    map[cat].count += 1;
  });
  return Object.values(map).sort((a, b) => b.amount - a.amount);
}

export function calculateSubCategorySpending(expenses) {
  const map = {};
  expenses.forEach((e) => {
    const sub = e.sub_category || 'Other';
    if (!map[sub]) map[sub] = { name: sub, amount: 0, count: 0 };
    map[sub].amount += e.amount || 0;
    map[sub].count += 1;
  });
  return Object.values(map).sort((a, b) => b.amount - a.amount);
}

export function calculatePaymentMethodSpending(expenses) {
  const map = {};
  expenses.forEach((e) => {
    const pm = e.payment_method || 'Unknown';
    if (!map[pm]) map[pm] = { name: pm, amount: 0, count: 0 };
    map[pm].amount += e.amount || 0;
    map[pm].count += 1;
  });
  return Object.values(map).sort((a, b) => b.amount - a.amount);
}

export function calculateBankAccountSpending(expenses) {
  const map = {};
  expenses.forEach((e) => {
    const bank = e.bank_account || 'Unknown';
    if (!map[bank]) map[bank] = { name: bank, amount: 0, count: 0 };
    map[bank].amount += e.amount || 0;
    map[bank].count += 1;
  });
  return Object.values(map).sort((a, b) => b.amount - a.amount);
}

export function calculateLocationSpending(expenses) {
  const map = {};
  expenses.forEach((e) => {
    const loc = e.location || 'Unknown';
    if (!map[loc]) map[loc] = { name: loc, amount: 0, count: 0 };
    map[loc].amount += e.amount || 0;
    map[loc].count += 1;
  });
  return Object.values(map).sort((a, b) => b.amount - a.amount);
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function calculateWeekdaySpending(expenses) {
  const totals = Array(7).fill(0);
  const counts = Array(7).fill(0);
  expenses.forEach((e) => {
    if (!e.date) return;
    const d = new Date(e.date);
    if (isNaN(d.getTime())) return;
    const day = d.getDay();
    totals[day] += e.amount || 0;
    counts[day] += 1;
  });
  return [1, 2, 3, 4, 5, 6, 0].map((i) => ({
    day: DAY_NAMES[i],
    shortDay: DAY_NAMES[i].slice(0, 3),
    total: totals[i],
    average: counts[i] > 0 ? Math.round(totals[i] / counts[i]) : 0,
    count: counts[i],
  }));
}

export function findBiggestExpense(expenses) {
  if (expenses.length === 0) return null;
  return expenses.reduce((max, e) => ((e.amount || 0) > (max.amount || 0) ? e : max), expenses[0]);
}

export function findBiggestCategory(expenses) {
  const cats = calculateCategorySpending(expenses);
  return cats.length > 0 ? cats[0] : null;
}

export function findMostUsedPaymentMethod(expenses) {
  const methods = calculatePaymentMethodSpending(expenses);
  if (methods.length === 0) return null;
  return methods.reduce((most, m) => (m.count > most.count ? m : most), methods[0]);
}

export function getTopExpenses(expenses, count = 10) {
  return [...expenses]
    .sort((a, b) => (b.amount || 0) - (a.amount || 0))
    .slice(0, count);
}

export function calculateSavings(expenses) {
  const keywords = ['saving', 'savings', 'investment', 'invest', 'mutual fund', 'sip', 'fd', 'rd'];
  return expenses
    .filter((e) => {
      const cat = (e.category || '').toLowerCase();
      const sub = (e.sub_category || '').toLowerCase();
      return keywords.some((kw) => cat.includes(kw) || sub.includes(kw));
    })
    .reduce((sum, e) => sum + (e.amount || 0), 0);
}

export function calculateCategorySubcategoryHierarchy(expenses) {
  const map = {};
  expenses.forEach((e) => {
    const cat = e.category || 'Uncategorized';
    const sub = e.sub_category || 'Other';
    if (!map[cat]) map[cat] = { name: cat, amount: 0, count: 0, subcategories: {} };
    map[cat].amount += e.amount || 0;
    map[cat].count += 1;
    if (!map[cat].subcategories[sub]) map[cat].subcategories[sub] = { name: sub, amount: 0, count: 0 };
    map[cat].subcategories[sub].amount += e.amount || 0;
    map[cat].subcategories[sub].count += 1;
  });
  const categories = Object.values(map).sort((a, b) => b.amount - a.amount);
  const total = categories.reduce((s, c) => s + c.amount, 0);
  return categories.map((cat) => ({
    ...cat,
    percent: total > 0 ? (cat.amount / total) * 100 : 0,
    subcategories: Object.values(cat.subcategories)
      .sort((a, b) => b.amount - a.amount)
      .map((sub) => ({
        ...sub,
        category: cat.name,
        percent: total > 0 ? (sub.amount / total) * 100 : 0,
        categoryPercent: cat.amount > 0 ? (sub.amount / cat.amount) * 100 : 0,
      })),
  }));
}

export function calculateSpendingVelocity(totalSpent, salary, cycleProgress) {
  if (!cycleProgress || cycleProgress.progressPercent === 0) return { status: 'on-track', ratio: 0 };
  const spentPct = (totalSpent / salary) * 100;
  const ratio = spentPct / cycleProgress.progressPercent;
  if (ratio > 1.2) return { status: 'over', ratio };
  if (ratio > 1.0) return { status: 'warning', ratio };
  return { status: 'on-track', ratio };
}
