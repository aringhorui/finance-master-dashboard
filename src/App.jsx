import { useState, useMemo } from 'react';
import { useFinanceData } from './hooks/useFinanceData';
import { SALARY } from './config';
import * as calc from './utils/calculations';
import { generateInsights } from './utils/insights';

import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { KPIGrid } from './components/KPIGrid';
import { FinancialHealth } from './components/FinancialHealth';
import { SunburstChart } from './components/SunburstChart';
import { SpendingHeatmap } from './components/SpendingHeatmap';
import { CategoryAnalysis } from './components/CategoryAnalysis';
import { TopExpenses } from './components/TopExpenses';
import { PaymentMethodBreakdown } from './components/PaymentMethodBreakdown';
import { BankAccountBreakdown } from './components/BankAccountBreakdown';
import { WeekdaySpending } from './components/WeekdaySpending';
import { TransactionTable } from './components/TransactionTable';
import { Insights } from './components/Insights';
import { DataStatus } from './components/DataStatus';
import { Chatbot } from './components/Chatbot';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ErrorState } from './components/ErrorState';

function App() {
  const { data, loading, error, refresh } = useFinanceData();

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
  const remainingDailyBudget = useMemo(() => salaryCycle ? calc.calculateRemainingDailyBudget(SALARY, totalSpent, salaryCycle.end) : 0, [totalSpent, salaryCycle]);
  const dailySpending = useMemo(() => salaryCycle ? calc.calculateDailySpending(filteredExpenses, salaryCycle.start, salaryCycle.end) : [], [filteredExpenses, salaryCycle]);
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
  const insights = useMemo(() => generateInsights(filteredExpenses, salaryCycle, SALARY), [filteredExpenses, salaryCycle]);

  if (error && !data) return <ErrorState message={error} onRetry={refresh} />;
  if (loading && !data) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen text-neutral-100">
      <Header salaryCycle={salaryCycle} lastSync={data?.last_sync} loading={loading} onRefresh={refresh} />

      <main className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4 sm:py-5 space-y-3 sm:space-y-4">
        <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />

        <KPIGrid
          totalSpent={totalSpent}
          moneyLeft={SALARY - totalSpent}
          avgDailySpending={avgDailySpending}
          remainingDailyBudget={remainingDailyBudget}
          transactionCount={filteredExpenses.length}
          biggestExpense={biggestExpense}
          biggestCategory={biggestCategory}
          mostUsedPaymentMethod={mostUsedPaymentMethod}
        />

        <FinancialHealth salary={SALARY} spent={totalSpent} expenses={filteredExpenses} salaryCycle={salaryCycle} />

        <SpendingHeatmap data={dailySpending} salaryCycle={salaryCycle} />

        <SunburstChart hierarchy={categoryHierarchy} totalSpent={totalSpent} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <CategoryAnalysis categories={categorySpending} subCategories={subCategorySpending} totalSpent={totalSpent} />
          <WeekdaySpending data={weekdaySpending} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <PaymentMethodBreakdown data={paymentMethodSpending} totalSpent={totalSpent} />
          <BankAccountBreakdown data={bankAccountSpending} totalSpent={totalSpent} />
          <TopExpenses expenses={topExpenses} />
        </div>

        <Insights insights={insights} />
        <TransactionTable expenses={filteredExpenses} />
      </main>

      <DataStatus lastSync={data?.last_sync} />
      <Chatbot expenses={filteredExpenses} salary={SALARY} />

      <footer className="border-t border-white/[0.04] mt-6">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4 text-center text-xs text-neutral-600">
          FinanceMaster Dashboard &mdash; All data processed locally in your browser &middot; No data leaves your device
        </div>
      </footer>
    </div>
  );
}

export default App;
