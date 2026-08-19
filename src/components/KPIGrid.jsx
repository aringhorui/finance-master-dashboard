import {
  TrendingDown, Wallet, BarChart3, Target,
  Receipt, ArrowUpRight, Tag, CreditCard,
} from 'lucide-react';
import { KPICard } from './KPICard';
import { formatCurrency, formatNumber } from '../utils/formatters';

export function KPIGrid({
  totalSpent, moneyLeft, avgDailySpending, remainingDailyBudget,
  transactionCount, biggestExpense, biggestCategory, mostUsedPaymentMethod,
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
      <KPICard
        label="Total Spent"
        value={formatCurrency(totalSpent)}
        context="This salary cycle"
        icon={TrendingDown}
        accentColor="#f97316"
      />
      <KPICard
        label="Money Left"
        value={formatCurrency(Math.abs(moneyLeft))}
        context={moneyLeft >= 0 ? 'Remaining from salary' : 'Over budget!'}
        icon={Wallet}
        accentColor={moneyLeft >= 0 ? '#22c55e' : '#ef4444'}
      />
      <KPICard
        label="Daily Average"
        value={`${formatCurrency(Math.round(avgDailySpending))}`}
        context="Per day so far"
        icon={BarChart3}
        accentColor="#fb923c"
      />
      <KPICard
        label="Daily Budget Left"
        value={`${formatCurrency(Math.round(Math.abs(remainingDailyBudget)))}`}
        context={remainingDailyBudget >= 0 ? 'Per day to stay on track' : 'Already over budget'}
        icon={Target}
        accentColor={remainingDailyBudget >= 0 ? '#22c55e' : '#ef4444'}
      />
      <KPICard
        label="Transactions"
        value={formatNumber(transactionCount)}
        context="Total this cycle"
        icon={Receipt}
        accentColor="#ea580c"
      />
      <KPICard
        label="Biggest Expense"
        value={biggestExpense ? formatCurrency(biggestExpense.amount) : '—'}
        context={biggestExpense?.expense || 'No transactions'}
        icon={ArrowUpRight}
        accentColor="#ef4444"
      />
      <KPICard
        label="Top Category"
        value={biggestCategory?.name || '—'}
        context={biggestCategory ? `${formatCurrency(biggestCategory.amount)} total` : ''}
        icon={Tag}
        accentColor="#d97706"
      />
      <KPICard
        label="Top Payment"
        value={mostUsedPaymentMethod?.name || '—'}
        context={mostUsedPaymentMethod ? `${mostUsedPaymentMethod.count} transactions` : ''}
        icon={CreditCard}
        accentColor="#fdba74"
      />
    </div>
  );
}
