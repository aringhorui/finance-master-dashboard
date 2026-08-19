import { formatCurrency } from './formatters';
import {
  calculateTotalSpent,
  calculateCategorySpending,
  calculatePaymentMethodSpending,
  calculateWeekdaySpending,
  findBiggestExpense,
  calculateCycleProgress,
  calculateSpendingVelocity,
} from './calculations';

export function generateInsights(expenses, salaryCycle, salary) {
  if (!expenses.length || !salaryCycle) return [];

  const insights = [];
  const total = calculateTotalSpent(expenses);
  const categories = calculateCategorySpending(expenses);
  const paymentMethods = calculatePaymentMethodSpending(expenses);
  const weekdays = calculateWeekdaySpending(expenses);
  const biggest = findBiggestExpense(expenses);
  const cycle = calculateCycleProgress(salaryCycle.start, salaryCycle.end);
  const velocity = calculateSpendingVelocity(total, salary, cycle);

  if (velocity.status === 'over') {
    insights.push({
      type: 'warning',
      text: `You're spending ${((velocity.ratio - 1) * 100).toFixed(0)}% faster than your budget pace. Consider slowing down to stay within ${formatCurrency(salary)}.`,
    });
  } else if (velocity.status === 'on-track') {
    insights.push({
      type: 'positive',
      text: `Your spending pace is healthy — you're using money ${((1 - velocity.ratio) * 100).toFixed(0)}% slower than your budget line.`,
    });
  }

  if (categories.length > 0) {
    const top = categories[0];
    const pct = total > 0 ? ((top.amount / total) * 100).toFixed(1) : 0;
    insights.push({
      type: 'neutral',
      text: `${top.name} dominates your spending at ${formatCurrency(top.amount)} (${pct}% of total). ${categories.length > 1 ? `Followed by ${categories[1].name} at ${formatCurrency(categories[1].amount)}.` : ''}`,
    });
  }

  if (biggest) {
    insights.push({
      type: biggest.amount > salary * 0.1 ? 'warning' : 'neutral',
      text: `Largest single expense: ${formatCurrency(biggest.amount)} on "${biggest.expense || 'Unknown'}".`,
    });
  }

  const weekendSpend = weekdays
    .filter((d) => d.day === 'Saturday' || d.day === 'Sunday')
    .reduce((s, d) => s + d.total, 0);
  const weekdaySpend = weekdays
    .filter((d) => d.day !== 'Saturday' && d.day !== 'Sunday')
    .reduce((s, d) => s + d.total, 0);
  const weekendAvg = weekendSpend / 2;
  const weekdayAvg = weekdaySpend / 5;

  if (weekendAvg > weekdayAvg * 1.3) {
    insights.push({
      type: 'warning',
      text: `Weekend spending averages ${formatCurrency(Math.round(weekendAvg))}/day vs ${formatCurrency(Math.round(weekdayAvg))}/day on weekdays — ${((weekendAvg / weekdayAvg - 1) * 100).toFixed(0)}% higher.`,
    });
  } else if (weekdayAvg > weekendAvg * 1.3) {
    insights.push({
      type: 'neutral',
      text: `Weekday spending averages ${formatCurrency(Math.round(weekdayAvg))}/day vs ${formatCurrency(Math.round(weekendAvg))}/day on weekends.`,
    });
  }

  if (paymentMethods.length > 0) {
    const topPM = paymentMethods.reduce((most, m) => (m.count > most.count ? m : most), paymentMethods[0]);
    const totalTxns = expenses.length;
    const pct = totalTxns > 0 ? ((topPM.count / totalTxns) * 100).toFixed(0) : 0;
    insights.push({
      type: 'neutral',
      text: `${topPM.name} is your go-to payment method — ${pct}% of transactions (${topPM.count} of ${totalTxns}).`,
    });
  }

  const highestDay = weekdays.reduce((max, d) => (d.total > max.total ? d : max), weekdays[0]);
  if (highestDay && highestDay.total > 0) {
    insights.push({
      type: 'neutral',
      text: `${highestDay.day}s are your most expensive day — ${formatCurrency(highestDay.total)} total, averaging ${formatCurrency(highestDay.average)} per ${highestDay.day}.`,
    });
  }

  if (categories.length >= 3) {
    const bottomCats = categories.slice(-3);
    const bottomTotal = bottomCats.reduce((s, c) => s + c.amount, 0);
    insights.push({
      type: 'positive',
      text: `Your lowest spending categories (${bottomCats.map(c => c.name).join(', ')}) total just ${formatCurrency(bottomTotal)}.`,
    });
  }

  if (cycle.daysElapsed > 0) {
    const avgDaily = total / cycle.daysElapsed;
    const projectedTotal = avgDaily * cycle.totalDays;
    if (projectedTotal > salary) {
      insights.push({
        type: 'warning',
        text: `At current pace, you'll spend ~${formatCurrency(Math.round(projectedTotal))} this cycle — ${formatCurrency(Math.round(projectedTotal - salary))} over budget.`,
      });
    } else {
      insights.push({
        type: 'positive',
        text: `Projected total spending: ~${formatCurrency(Math.round(projectedTotal))} — ${formatCurrency(Math.round(salary - projectedTotal))} under budget.`,
      });
    }
  }

  return insights;
}
