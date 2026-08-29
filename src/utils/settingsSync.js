const SALARY_KEY = 'fm_salary';
const BUDGETS_KEY = 'fm_subcategory_budgets';

export function encodeSettings() {
  const salary = localStorage.getItem(SALARY_KEY);
  const budgets = localStorage.getItem(BUDGETS_KEY);

  const parts = [];
  if (salary) parts.push(`s=${salary}`);

  if (budgets) {
    try {
      const obj = JSON.parse(budgets);
      const entries = Object.entries(obj).filter(([, v]) => v > 0);
      if (entries.length > 0) {
        const encoded = entries.map(([k, v]) => `${encodeURIComponent(k)}:${v}`).join(',');
        parts.push(`b=${encoded}`);
      }
    } catch {}
  }

  return parts.length > 0 ? `#${parts.join('&')}` : '';
}

export function decodeAndApplySettings(hash) {
  if (!hash || !hash.startsWith('#')) return false;

  const params = hash.slice(1);
  let applied = false;

  const salaryMatch = params.match(/(?:^|&)s=(\d+(?:\.\d+)?)(?:&|$)/);
  if (salaryMatch) {
    localStorage.setItem(SALARY_KEY, salaryMatch[1]);
    applied = true;
  }

  const budgetMatch = params.match(/(?:^|&)b=([^&]+)/);
  if (budgetMatch) {
    try {
      const pairs = budgetMatch[1].split(',');
      const budgets = {};
      pairs.forEach((pair) => {
        const lastColon = pair.lastIndexOf(':');
        if (lastColon > 0) {
          const key = decodeURIComponent(pair.slice(0, lastColon));
          const val = Number(pair.slice(lastColon + 1));
          if (key && val > 0) budgets[key] = val;
        }
      });
      if (Object.keys(budgets).length > 0) {
        localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
        applied = true;
      }
    } catch {}
  }

  if (applied) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }

  return applied;
}

export function getSettingsURL() {
  const hash = encodeSettings();
  if (!hash) return '';
  return `${window.location.origin}${window.location.pathname}${hash}`;
}

export function copySettingsLink() {
  const url = getSettingsURL();
  if (!url) return false;
  return navigator.clipboard.writeText(url).then(() => true).catch(() => false);
}
