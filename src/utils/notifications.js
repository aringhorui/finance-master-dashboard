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

export function sendLocalNotification(title, body, tag = 'fm-alert') {
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

const QUIT_PHRASES = ['cigarette', 'cigarettes', 'smoke', 'smoking', 'cig', 'cigs'];

export function checkBudgetAlerts(expenses, salary) {
  const totalSpent = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const pct = salary > 0 ? (totalSpent / salary) * 100 : 0;

  const lastAlert = localStorage.getItem('fm_last_budget_alert');
  const today = new Date().toDateString();
  if (lastAlert !== today) {
    if (pct >= 90) {
      sendLocalNotification(
        'Budget Alert',
        `You've spent ${pct.toFixed(0)}% of your salary (₹${totalSpent.toLocaleString('en-IN')} of ₹${salary.toLocaleString('en-IN')})`,
        'fm-budget-90'
      );
      localStorage.setItem('fm_last_budget_alert', today);
    } else if (pct >= 75) {
      sendLocalNotification(
        'Spending Warning',
        `You've used ${pct.toFixed(0)}% of your salary. ₹${(salary - totalSpent).toLocaleString('en-IN')} remaining.`,
        'fm-budget-75'
      );
      localStorage.setItem('fm_last_budget_alert', today);
    }
  }

  checkCigaretteAlert(expenses);
  checkDailySummary(expenses, salary);
}

function checkCigaretteAlert(expenses) {
  const lastCigAlert = localStorage.getItem('fm_last_cig_alert');
  const today = new Date().toDateString();
  if (lastCigAlert === today) return;

  const todayDate = new Date().toISOString().slice(0, 10);
  const todayCigs = expenses.filter((e) => {
    if (!e.date || e.date.slice(0, 10) !== todayDate) return false;
    const text = [e.expense, e.sub_category, e.notes].filter(Boolean).join(' ').toLowerCase();
    return QUIT_PHRASES.some((p) => text.includes(p));
  });

  if (todayCigs.length === 0) {
    const allCigs = expenses.filter((e) => {
      const text = [e.expense, e.sub_category, e.notes].filter(Boolean).join(' ').toLowerCase();
      return QUIT_PHRASES.some((p) => text.includes(p));
    });
    if (allCigs.length > 0) {
      const totalCigSpent = allCigs.reduce((s, e) => s + (Number(e.amount) || 0), 0);
      const cigDays = new Set(allCigs.map((e) => e.date?.slice(0, 10)).filter(Boolean)).size;
      const lastCigDate = allCigs.sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0]?.date?.slice(0, 10);
      const daysSince = lastCigDate ? Math.floor((Date.now() - new Date(lastCigDate).getTime()) / 86400000) : 0;
      if (daysSince >= 1) {
        sendLocalNotification(
          `${daysSince} day${daysSince > 1 ? 's' : ''} smoke-free! 💪`,
          `You've spent ₹${totalCigSpent.toLocaleString('en-IN')} on cigarettes across ${cigDays} days this cycle. Keep the streak going!`,
          'fm-cig-streak'
        );
        localStorage.setItem('fm_last_cig_alert', today);
      }
    }
    return;
  }

  const totalToday = todayCigs.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const allCigs = expenses.filter((e) => {
    const text = [e.expense, e.sub_category, e.notes].filter(Boolean).join(' ').toLowerCase();
    return QUIT_PHRASES.some((p) => text.includes(p));
  });
  const totalCigSpent = allCigs.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const monthlyCost = allCigs.length > 0 ? (totalCigSpent / new Set(allCigs.map((e) => e.date?.slice(0, 10)).filter(Boolean)).size) * 30 : 0;

  const messages = [
    `₹${totalToday.toLocaleString('en-IN')} on cigarettes today. That's ₹${totalCigSpent.toLocaleString('en-IN')} this cycle — projected ₹${Math.round(monthlyCost).toLocaleString('en-IN')}/month.`,
    `Another ₹${totalToday.toLocaleString('en-IN')} burned. You've spent ₹${totalCigSpent.toLocaleString('en-IN')} on cigarettes this cycle. Your lungs and wallet both want you to stop.`,
    `₹${totalToday.toLocaleString('en-IN')} gone up in smoke today. Total this cycle: ₹${totalCigSpent.toLocaleString('en-IN')}. Every cigarette you skip is money saved and health gained.`,
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];

  sendLocalNotification('🚬 Quit Reminder', msg, 'fm-cig-alert');
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

  if (todayExpenses.length === 0) {
    sendLocalNotification(
      '📊 Daily Summary',
      `No spending today — nice! ₹${remaining.toLocaleString('en-IN')} left in your budget.`,
      'fm-daily-summary'
    );
  } else {
    const topCat = Object.entries(
      todayExpenses.reduce((m, e) => { m[e.sub_category || 'Other'] = (m[e.sub_category || 'Other'] || 0) + (Number(e.amount) || 0); return m; }, {})
    ).sort((a, b) => b[1] - a[1])[0];

    sendLocalNotification(
      '📊 Daily Summary',
      `Today: ₹${todayTotal.toLocaleString('en-IN')} across ${todayExpenses.length} txn${todayExpenses.length > 1 ? 's' : ''}. Top: ${topCat[0]} (₹${topCat[1].toLocaleString('en-IN')}). ₹${remaining.toLocaleString('en-IN')} left.`,
      'fm-daily-summary'
    );
  }

  localStorage.setItem('fm_last_daily_summary', today);
}
