import { useState, useMemo, useEffect } from 'react';
import { useFinanceData } from './hooks/useFinanceData';
import { SALARY } from './config';
import * as calc from './utils/calculations';
import { generateInsights } from './utils/insights';
import { checkBudgetAlerts, isEnabled as notificationsEnabled } from './utils/notifications';
import { decodeAndApplySettings } from './utils/settingsSync';

import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { KPIGrid } from './components/KPIGrid';
import { FinancialHealth } from './components/FinancialHealth';
import { WantVsNeed } from './components/WantVsNeed';
import { TimeOfDay } from './components/TimeOfDay';
import { SpendingStreaks } from './components/SpendingStreaks';
import { SunburstChart } from './components/SunburstChart';
import { SpendingHeatmap } from './components/SpendingHeatmap';
import { CategoryAnalysis } from './components/CategoryAnalysis';
import { SubcategoryBudget } from './components/SubcategoryBudget';
import { SmallPurchases } from './components/SmallPurchases';
import { HabitTracker } from './components/HabitTracker';
import { RevealSection } from './components/RevealSection';
import { SpendingTrend } from './components/SpendingTrend';
import { BudgetPace } from './components/BudgetPace';
import { TopExpenses } from './components/TopExpenses';
import { PaymentMethodBreakdown } from './components/PaymentMethodBreakdown';
import { BankAccountBreakdown } from './components/BankAccountBreakdown';
import { WeekdaySpending } from './components/WeekdaySpending';
import { TransactionTable } from './components/TransactionTable';
import { ExportData } from './components/ExportData';
import { Insights } from './components/Insights';
import { DataStatus } from './components/DataStatus';
import { Chatbot } from './components/Chatbot';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ErrorState } from './components/ErrorState';
import { MobileNav } from './components/MobileNav';

const SALARY_STORAGE_KEY = 'fm_salary';
function loadSalary() {
  try {
    const v = localStorage.getItem(SALARY_STORAGE_KEY);
    return v ? Number(v) : SALARY;
  } catch { return SALARY; }
}

function App() {
  const [settingsImported] = useState(() => decodeAndApplySettings(window.location.hash));
  const { data, loading, error, refresh } = useFinanceData();
  const [salary, setSalaryState] = useState(loadSalary);

  const setSalary = (v) => {
    setSalaryState(v);
    localStorage.setItem(SALARY_STORAGE_KEY, String(v));
  };

  const [filters, setFilters] = useState({
    dateRange: { start: null, end: null },
    category: '',
    subCategory: '',
    paymentMethod: '',
    bankAccount: '',
    search: '',
  });

  const allExpenses = useMemo(() => {
    if (!data?.expenses) return [];
    return data.expenses.map((e) => ({ ...e, amount: Number(e.amount) || 0 }));
  }, [data]);

  const filteredExpenses = useMemo(() => {
    return allExpenses.filter((e) => {
      if (filters.category && e.category !== filters.category) return false;
      if (filters.subCategory && e.sub_category !== filters.subCategory) return false;
      if (filters.paymentMethod && e.payment_method !== filters.paymentMethod) return false;
      if (filters.bankAccount && e.bank_account !== filters.bankAccount) return false;
      if (filters.dateRange.start && e.date < filters.dateRange.start) return false;
      if (filters.dateRange.end && e.date > filters.dateRange.end) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const searchable = [e.expense, e.category, e.sub_category, e.notes]
          .filter(Boolean).join(' ').toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      return true;
    });
  }, [allExpenses, filters]);

  const filterOptions = useMemo(() => ({
    categories: [...new Set(allExpenses.map((e) => e.category).filter(Boolean))].sort(),
    subCategories: [...new Set(allExpenses.map((e) => e.sub_category).filter(Boolean))].sort(),
    paymentMethods: [...new Set(allExpenses.map((e) => e.payment_method).filter(Boolean))].sort(),
    bankAccounts: [...new Set(allExpenses.map((e) => e.bank_account).filter(Boolean))].sort(),
  }), [allExpenses]);

  const salaryCycle = data?.salary_cycle;
  const totalSpent = useMemo(() => calc.calculateTotalSpent(filteredExpenses), [filteredExpenses]);
  const avgDailySpending = useMemo(() => salaryCycle ? calc.calculateAverageDailySpending(filteredExpenses, salaryCycle.start) : 0, [filteredExpenses, salaryCycle]);
  const remainingDailyBudget = useMemo(() => salaryCycle ? calc.calculateRemainingDailyBudget(salary, totalSpent, salaryCycle.end) : 0, [salary, totalSpent, salaryCycle]);
  const dailySpending = useMemo(() => salaryCycle ? calc.calculateDailySpending(filteredExpenses, salaryCycle.start, salaryCycle.end) : [], [filteredExpenses, salaryCycle]);
  const cumulativeSpending = useMemo(() => salaryCycle ? calc.calculateCumulativeSpending(filteredExpenses, salaryCycle.start, salaryCycle.end, salary) : [], [filteredExpenses, salaryCycle, salary]);
  const categorySpending = useMemo(() => calc.calculateCategorySpending(filteredExpenses), [filteredExpenses]);
  const subCategorySpending = useMemo(() => calc.calculateSubCategorySpending(filteredExpenses), [filteredExpenses]);
  const paymentMethodSpending = useMemo(() => calc.calculatePaymentMethodSpending(filteredExpenses), [filteredExpenses]);
  const bankAccountSpending = useMemo(() => calc.calculateBankAccountSpending(filteredExpenses), [filteredExpenses]);
  const weekdaySpending = useMemo(() => calc.calculateWeekdaySpending(filteredExpenses), [filteredExpenses]);
  const categoryHierarchy = useMemo(() => calc.calculateCategorySubcategoryHierarchy(filteredExpenses), [filteredExpenses]);
  const biggestExpense = useMemo(() => calc.findBiggestExpense(filteredExpenses), [filteredExpenses]);
  const biggestCategory = useMemo(() => calc.findBiggestCategory(filteredExpenses), [filteredExpenses]);
  const mostUsedPaymentMethod = useMemo(() => calc.findMostUsedPaymentMethod(filteredExpenses), [filteredExpenses]);
  const topExpenses = useMemo(() => calc.getTopExpenses(filteredExpenses, 10), [filteredExpenses]);
  const insights = useMemo(() => generateInsights(filteredExpenses, salaryCycle, salary), [filteredExpenses, salaryCycle, salary]);

  useEffect(() => {
    if (filteredExpenses.length > 0 && salary > 0 && notificationsEnabled()) {
      checkBudgetAlerts(filteredExpenses, salary);
    }
  }, [filteredExpenses, salary]);

  if (error && !data) return <ErrorState message={error} onRetry={refresh} />;
  if (loading && !data) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen text-neutral-100">
      <Header salaryCycle={salaryCycle} lastSync={data?.last_sync} salary={salary} onSalaryChange={setSalary} />

      <main className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4 sm:py-5 space-y-3 sm:space-y-4">
        <div className="hidden sm:block">
          <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />
        </div>

        {/* 1. KPIs — instant overview */}
        <RevealSection id="kpis">
          <KPIGrid
            totalSpent={totalSpent}
            moneyLeft={salary - totalSpent}
            avgDailySpending={avgDailySpending}
            remainingDailyBudget={remainingDailyBudget}
            transactionCount={filteredExpenses.length}
            biggestExpense={biggestExpense}
            biggestCategory={biggestCategory}
            mostUsedPaymentMethod={mostUsedPaymentMethod}
          />
        </RevealSection>

        {/* 2. Financial Health — salary vs spent */}
        <RevealSection id="health">
          <FinancialHealth salary={salary} spent={totalSpent} expenses={filteredExpenses} salaryCycle={salaryCycle} />
        </RevealSection>

        {/* 3. Want vs Need + Spending Streaks */}
        <RevealSection className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <WantVsNeed expenses={filteredExpenses} />
          <SpendingStreaks expenses={filteredExpenses} salaryCycle={salaryCycle} />
        </RevealSection>

        {/* 4. Behavioral insights — actionable spending patterns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <SmallPurchases expenses={filteredExpenses} salaryCycle={salaryCycle} />
          <HabitTracker expenses={filteredExpenses} salaryCycle={salaryCycle} />
        </div>

        {/* 5. Pace & Trend — how spending tracks over time */}
        <RevealSection className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <BudgetPace data={cumulativeSpending} salary={salary} />
          <SpendingTrend data={dailySpending} />
        </RevealSection>

        {/* 5. Budget tracking */}
        <RevealSection id="budgets">
          <SubcategoryBudget subCategories={subCategorySpending} expenses={filteredExpenses} />
        </RevealSection>

        {/* 6. Spending heatmap */}
        <RevealSection>
          <SpendingHeatmap data={dailySpending} salaryCycle={salaryCycle} />
        </RevealSection>

        {/* 7. Category breakdowns */}
        <RevealSection id="categories" className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <CategoryAnalysis categories={categorySpending} subCategories={subCategorySpending} totalSpent={totalSpent} />
          <WeekdaySpending data={weekdaySpending} />
        </RevealSection>

        {/* Time of Day analysis */}
        <RevealSection>
          <TimeOfDay expenses={filteredExpenses} />
        </RevealSection>

        {/* 8. Hierarchy visualization */}
        <RevealSection>
          <SunburstChart hierarchy={categoryHierarchy} totalSpent={totalSpent} />
        </RevealSection>

        {/* 9. Reference breakdowns */}
        <RevealSection className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <PaymentMethodBreakdown data={paymentMethodSpending} totalSpent={totalSpent} />
          <BankAccountBreakdown data={bankAccountSpending} totalSpent={totalSpent} />
          <TopExpenses expenses={topExpenses} />
        </RevealSection>

        {/* 10. AI insights */}
        <RevealSection>
          <Insights insights={insights} />
        </RevealSection>

        {/* 11. Transaction log */}
        <RevealSection id="transactions" className="space-y-3 sm:space-y-4">
          <div className="sm:hidden">
            <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />
          </div>
          <div className="flex items-center justify-between">
            <h2 className="section-title text-sm font-semibold text-neutral-300">Transactions</h2>
            <ExportData expenses={filteredExpenses} salary={salary} salaryCycle={salaryCycle} />
          </div>
          <TransactionTable expenses={filteredExpenses} />
        </RevealSection>
      </main>

      <DataStatus lastSync={data?.last_sync} onRefresh={refresh} />
      <Chatbot expenses={filteredExpenses} salary={salary} />

      <footer className="border-t border-white/[0.04] mt-6 pb-16 sm:pb-0">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4 text-center text-xs text-neutral-600">
          FinanceMaster Dashboard &mdash; All data processed locally in your browser &middot; No data leaves your device
        </div>
      </footer>

      <MobileNav />
    </div>
  );
}

export default App;
