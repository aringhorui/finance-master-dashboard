// All configurable values are read from .env file.
// See .env.example for available variables.

export const SALARY = Number(import.meta.env.VITE_SALARY) || 48000;

export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export const DATA_URL = import.meta.env.VITE_DATA_URL ||
  'https://financemaster-data.aringhorui.workers.dev/current.json';

export const STALE_DATA_MINUTES = Number(import.meta.env.VITE_STALE_DATA_MINUTES) || 15;
export const ITEMS_PER_PAGE = 15;

export const CHART_COLORS = [
  '#f97316', '#fb923c', '#ea580c', '#fdba74', '#c2410c',
  '#ffedd5', '#f59e0b', '#d97706', '#fbbf24', '#b45309',
  '#fed7aa', '#ff6b35',
];

export const CATEGORY_COLORS = {
  Food: '#f97316',
  Transport: '#fb923c',
  Entertainment: '#ea580c',
  Shopping: '#fdba74',
  Health: '#f59e0b',
  Bills: '#d97706',
  Groceries: '#fbbf24',
  Housing: '#c2410c',
  Investment: '#b45309',
  'Personal Care': '#ff6b35',
  Education: '#fed7aa',
  Travel: '#ffedd5',
  Savings: '#f59e0b',
};

export function getCategoryColor(category, index = 0) {
  if (category && CATEGORY_COLORS[category]) return CATEGORY_COLORS[category];
  return CHART_COLORS[index % CHART_COLORS.length];
}
