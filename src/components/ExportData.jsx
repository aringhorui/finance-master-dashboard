import { useState } from 'react';
import { Download, FileText, Table } from 'lucide-react';
import { formatDate } from '../utils/formatters';

function toCSV(expenses) {
  const headers = ['Date', 'Expense', 'Amount', 'Category', 'Sub Category', 'Payment Method', 'Bank Account', 'Location', 'Notes'];
  const rows = expenses.map((e) => [
    e.date ? e.date.slice(0, 10) : '',
    `"${(e.expense || '').replace(/"/g, '""')}"`,
    e.amount || 0,
    e.category || '',
    e.sub_category || '',
    e.payment_method || '',
    e.bank_account || '',
    `"${(e.location || '').replace(/"/g, '""')}"`,
    `"${(e.notes || '').replace(/"/g, '""')}"`,
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generatePDFContent(expenses, salary, salaryCycle) {
  const total = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const wantTotal = expenses.filter((e) => (e.category || '').toLowerCase() === 'want').reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const needTotal = total - wantTotal;
  const cycleLabel = salaryCycle
    ? `${formatDate(salaryCycle.start)} — ${formatDate(salaryCycle.end)}`
    : 'Current Cycle';

  const catMap = {};
  expenses.forEach((e) => {
    const cat = e.sub_category || 'Other';
    catMap[cat] = (catMap[cat] || 0) + (Number(e.amount) || 0);
  });
  const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 10);

  let html = `
    <html><head><meta charset="utf-8"/><title>Finance Report</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
      h1 { font-size: 24px; margin-bottom: 4px; }
      .subtitle { color: #666; font-size: 13px; margin-bottom: 24px; }
      .summary { display: flex; gap: 16px; margin-bottom: 28px; }
      .stat { flex: 1; padding: 14px; background: #f7f7f7; border-radius: 8px; }
      .stat-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
      .stat-value { font-size: 22px; font-weight: 700; margin-top: 4px; }
      h2 { font-size: 16px; margin: 20px 0 10px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th { text-align: left; padding: 8px 6px; border-bottom: 2px solid #ddd; font-weight: 600; color: #555; }
      td { padding: 6px; border-bottom: 1px solid #eee; }
      .amount { text-align: right; font-variant-numeric: tabular-nums; }
      .top-cats td:last-child { text-align: right; font-weight: 600; }
      @media print { body { padding: 20px; } }
    </style></head><body>
    <h1>FinanceMaster Report</h1>
    <p class="subtitle">${cycleLabel} &bull; Generated ${formatDate(new Date().toISOString())}</p>
    <div class="summary">
      <div class="stat"><div class="stat-label">Total Spent</div><div class="stat-value">₹${total.toLocaleString('en-IN')}</div></div>
      <div class="stat"><div class="stat-label">Salary</div><div class="stat-value">₹${(salary || 0).toLocaleString('en-IN')}</div></div>
      <div class="stat"><div class="stat-label">Remaining</div><div class="stat-value">₹${((salary || 0) - total).toLocaleString('en-IN')}</div></div>
    </div>
    <div class="summary">
      <div class="stat"><div class="stat-label">Needs</div><div class="stat-value">₹${needTotal.toLocaleString('en-IN')}</div></div>
      <div class="stat"><div class="stat-label">Wants</div><div class="stat-value">₹${wantTotal.toLocaleString('en-IN')}</div></div>
      <div class="stat"><div class="stat-label">Transactions</div><div class="stat-value">${expenses.length}</div></div>
    </div>
    <h2>Top Categories</h2>
    <table class="top-cats"><tr><th>Sub Category</th><th style="text-align:right">Amount</th></tr>`;
  topCats.forEach(([cat, amt]) => {
    html += `<tr><td>${cat}</td><td>₹${amt.toLocaleString('en-IN')}</td></tr>`;
  });
  html += `</table>
    <h2>All Transactions</h2>
    <table><tr><th>Date</th><th>Expense</th><th>Category</th><th>Sub Category</th><th class="amount">Amount</th></tr>`;
  expenses.forEach((e) => {
    html += `<tr><td>${e.date ? e.date.slice(0, 10) : ''}</td><td>${e.expense || ''}</td><td>${e.category || ''}</td><td>${e.sub_category || ''}</td><td class="amount">₹${(e.amount || 0).toLocaleString('en-IN')}</td></tr>`;
  });
  html += `</table></body></html>`;
  return html;
}

export function ExportData({ expenses, salary, salaryCycle }) {
  const [exporting, setExporting] = useState(false);

  const handleCSV = () => {
    const csv = toCSV(expenses);
    downloadFile(csv, `finance-report-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
  };

  const handlePDF = () => {
    setExporting(true);
    const html = generatePDFContent(expenses, salary, salaryCycle);
    const printWin = window.open('', '_blank', 'width=800,height=600');
    if (printWin) {
      printWin.document.write(html);
      printWin.document.close();
      setTimeout(() => {
        printWin.print();
        setExporting(false);
      }, 500);
    } else {
      downloadFile(html, `finance-report-${new Date().toISOString().slice(0, 10)}.html`, 'text/html;charset=utf-8;');
      setExporting(false);
    }
  };

  if (!expenses.length) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCSV}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] border border-white/[0.06] text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.06] transition-all"
      >
        <Table size={13} />
        CSV
      </button>
      <button
        onClick={handlePDF}
        disabled={exporting}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] border border-white/[0.06] text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.06] transition-all disabled:opacity-50"
      >
        <FileText size={13} />
        PDF
      </button>
    </div>
  );
}
