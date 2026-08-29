const NOTIF_KEY = 'fm_notifications_enabled';

export function isSupported() {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

export function isEnabled() {
  return localStorage.getItem(NOTIF_KEY) === 'true' && Notification.permission === 'granted';
}

export async function requestPermission() {
  if (!isSupported()) return false;
  const result = await Notification.requestPermission();
  const granted = result === 'granted';
  localStorage.setItem(NOTIF_KEY, String(granted));
  return granted;
}

export function disable() {
  localStorage.setItem(NOTIF_KEY, 'false');
}

function notify(title, body, tag = 'fm-alert') {
  if (!isEnabled()) return;
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification(title, {
        body,
        icon: './icon-192.svg',
        badge: './icon-192.svg',
        tag,
      });
    });
  } else {
    new Notification(title, { body, tag });
  }
}

const fmt = (n) => n.toLocaleString('en-IN');

const QUIT_PHRASES = ['cigarette', 'cigarettes', 'smoke', 'smoking', 'cig', 'cigs'];

export function checkBudgetAlerts(expenses, salary) {
  const totalSpent = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const pct = salary > 0 ? (totalSpent / salary) * 100 : 0;

  const lastAlert = localStorage.getItem('fm_last_budget_alert');
  const today = new Date().toDateString();
  if (lastAlert !== today) {
    if (pct >= 90) {
      notify(
        'Budget Critical',
        `${pct.toFixed(0)}% of salary used. ${fmt(totalSpent)} spent of ${fmt(salary)}. Consider pausing non-essential spending.`,
        'fm-budget-90'
      );
      localStorage.setItem('fm_last_budget_alert', today);
    } else if (pct >= 75) {
      notify(
        'Budget Check-in',
        `${pct.toFixed(0)}% used. ${fmt(salary - totalSpent)} remaining for the rest of this cycle.`,
        'fm-budget-75'
      );
      localStorage.setItem('fm_last_budget_alert', today);
    }
  }

  checkCigaretteAlert(expenses);
  checkDailySummary(expenses, salary);
}

function findCigExpenses(expenses, dateFilter) {
  return expenses.filter((e) => {
    if (dateFilter && (!e.date || e.date.slice(0, 10) !== dateFilter)) return false;
    const text = [e.expense, e.sub_category, e.notes].filter(Boolean).join(' ').toLowerCase();
    return QUIT_PHRASES.some((p) => text.includes(p));
  });
}

function checkCigaretteAlert(expenses) {
  const lastCigAlert = localStorage.getItem('fm_last_cig_alert');
  const today = new Date().toDateString();
  if (lastCigAlert === today) return;

  const todayDate = new Date().toISOString().slice(0, 10);
  const todayCigs = findCigExpenses(expenses, todayDate);
  const allCigs = findCigExpenses(expenses);

  if (allCigs.length === 0) return;

  const totalCigSpent = allCigs.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const cigDays = new Set(allCigs.map((e) => e.date?.slice(0, 10)).filter(Boolean)).size;

  if (todayCigs.length === 0) {
    const lastCigDate = allCigs.sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0]?.date?.slice(0, 10);
    const daysFree = lastCigDate ? Math.floor((Date.now() - new Date(lastCigDate).getTime()) / 86400000) : 0;

    if (daysFree >= 1) {
      const saved = Math.round(totalCigSpent / cigDays) * daysFree;
      const milestones = [
        { days: 1, body: `Day 1 without cigarettes. Your body is already healing — carbon monoxide levels dropping, oxygen rising. You've saved ~${fmt(saved)} so far.` },
        { days: 3, body: `3 days clean. Nicotine is leaving your system. Breathing gets easier from here. ~${fmt(saved)} saved and counting.` },
        { days: 7, body: `One full week. Your lungs are recovering, taste and smell sharpening. That's ~${fmt(saved)} back in your pocket.` },
        { days: 14, body: `2 weeks strong. Circulation improving, energy levels rising. ~${fmt(saved)} saved — imagine what that buys.` },
        { days: 30, body: `A whole month. Lung function up 30%, cravings fading. You've saved ~${fmt(saved)}. This is who you are now.` },
      ];

      const milestone = [...milestones].reverse().find((m) => daysFree >= m.days);
      const title = daysFree === 1
        ? 'First Day Free'
        : `${daysFree} Days Without Smoking`;

      notify(title, milestone?.body || `${daysFree} days without smoking. ~${fmt(saved)} saved. Every day you choose yourself over a cigarette, you win.`, 'fm-cig-streak');
      localStorage.setItem('fm_last_cig_alert', today);
    }
    return;
  }

  const totalToday = todayCigs.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const dailyAvg = cigDays > 0 ? totalCigSpent / cigDays : 0;
  const yearlyCost = Math.round(dailyAvg * 365);

  const messages = [
    `${fmt(totalToday)} on cigarettes today. At this rate, that's ${fmt(yearlyCost)}/year — enough for a vacation, a new phone, or an investment that grows. You deserve better than burning it.`,
    `${fmt(totalCigSpent)} spent on cigarettes this cycle. Each one takes 11 minutes off your life. The money adds up, but the time you lose doesn't come back.`,
    `${fmt(totalToday)} today, ${fmt(totalCigSpent)} this cycle. Picture yourself 6 months from now — healthier lungs, more money, no cravings. That version of you starts with skipping the next one.`,
    `You spent ${fmt(totalToday)} on cigarettes today. That's ${fmt(yearlyCost)}/year being turned to ash. Your future self is counting on you to stop.`,
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];

  notify('Your Health, Your Money', msg, 'fm-cig-alert');
  localStorage.setItem('fm_last_cig_alert', today);
}

function checkDailySummary(expenses, salary) {
  const lastSummary = localStorage.getItem('fm_last_daily_summary');
  const today = new Date().toDateString();
  if (lastSummary === today) return;

  const now = new Date();
  if (now.getHours() < 18) return;

  const todayDate = now.toISOString().slice(0, 10);
  const todayExpenses = expenses.filter((e) => e.date && e.date.slice(0, 10) === todayDate);
  const todayTotal = todayExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalSpent = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const remaining = salary - totalSpent;
  const pct = salary > 0 ? ((totalSpent / salary) * 100).toFixed(0) : 0;

  if (todayExpenses.length === 0) {
    notify(
      'End of Day',
      `Zero spending today. ${fmt(remaining)} remaining (${100 - pct}% of salary). Strong discipline.`,
      'fm-daily-summary'
    );
  } else {
    const topCat = Object.entries(
      todayExpenses.reduce((m, e) => { m[e.sub_category || 'Other'] = (m[e.sub_category || 'Other'] || 0) + (Number(e.amount) || 0); return m; }, {})
    ).sort((a, b) => b[1] - a[1])[0];

    notify(
      'End of Day',
      `Today: ${fmt(todayTotal)} across ${todayExpenses.length} transaction${todayExpenses.length > 1 ? 's' : ''}. Highest: ${topCat[0]} (${fmt(topCat[1])}). Remaining: ${fmt(remaining)} (${100 - pct}%).`,
      'fm-daily-summary'
    );
  }

  localStorage.setItem('fm_last_daily_summary', today);
}
