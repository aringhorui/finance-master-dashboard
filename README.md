# FinanceMaster Dashboard

A professional personal finance dashboard that visualizes expense data from a salary-cycle perspective. Built as a static frontend — no backend, no database, no authentication.

## Architecture

```
src/
  config.js          — SALARY constant, data URL, chart colors
  hooks/
    useFinanceData.js — Custom hook: fetch, cache, refresh JSON
  utils/
    calculations.js   — Pure functions: totals, averages, groupings
    formatters.js      — Currency (INR), date, relative-time formatting
    insights.js        — Deterministic insight generation
  components/
    Header.jsx         — Top bar with cycle info and refresh
    FilterBar.jsx      — Global filters (category, date, search, etc.)
    KPIGrid.jsx        — 8-card numeric KPI grid
    KPICard.jsx        — Reusable KPI card
    FinancialHealth.jsx— Salary utilization bar + cycle progress
    SpendingTrend.jsx  — Daily spending area chart
    CategoryAnalysis.jsx — Category donut + sub-category bars
    PaymentMethodBreakdown.jsx — Payment method donut + table
    BankAccountBreakdown.jsx   — Bank account progress bars
    WeekdaySpending.jsx        — Day-of-week bar chart
    TransactionTable.jsx       — Sortable, paginated transaction table
    Insights.jsx       — Auto-generated financial insights
    DataStatus.jsx     — Floating sync-status indicator
    LoadingSkeleton.jsx— Skeleton loader for initial load
    ErrorState.jsx     — Error display with retry button
  App.jsx             — Root layout, state, filtering, data flow
```

## Data Source

On page load the dashboard fetches:

```
https://financemaster-data.aringhorui.workers.dev/current.json)
```

All calculations happen in the browser. No API keys or secrets are used.

## Changing the Salary

Open `src/config.js` and edit the `SALARY` constant:

```js
export const SALARY = 48000; // ← change this
```

## Run Locally

```bash
npm install
npm run dev
```

## Build for Production

```bash
npm run build
```

Output goes to `dist/`. Deploy it to any static host.

## Deploy

**Cloudflare Pages** — connect the repo or drag-drop `dist/`.  
**GitHub Pages** — push `dist/` or use a GitHub Action.  
**Vercel** — import the repo; framework preset "Vite".

## Tech Stack

- React 18
- Vite
- Tailwind CSS 3
- Recharts
- Lucide React icons
