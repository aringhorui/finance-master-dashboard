import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, AlertCircle, Settings } from 'lucide-react';
import { GEMINI_API_KEY } from '../config';
import { formatCurrency } from '../utils/formatters';
import { getSubcategoryBudgets } from './SubcategoryBudget';

function buildContext(expenses, salary) {
  const totalSpent = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const remaining = salary - totalSpent;

  const budgets = getSubcategoryBudgets();
  const subCatMap = {};
  expenses.forEach((e) => {
    const sub = e.sub_category || 'Other';
    subCatMap[sub] = (subCatMap[sub] || 0) + (Number(e.amount) || 0);
  });

  let budgetSection = '';
  const budgetEntries = Object.entries(budgets);
  if (budgetEntries.length > 0) {
    const lines = budgetEntries.map(([name, limit]) => {
      const spent = subCatMap[name] || 0;
      const pct = limit > 0 ? ((spent / limit) * 100).toFixed(0) : 0;
      const status = spent > limit ? 'OVER BUDGET' : spent > limit * 0.8 ? 'WARNING' : 'OK';
      return `  ${name}: spent ${formatCurrency(spent)} / budget ${formatCurrency(limit)} (${pct}%) [${status}]`;
    });
    budgetSection = `\n\nSubcategory Budgets:\n${lines.join('\n')}`;
  }

  const txnJson = JSON.stringify(
    expenses.map((e) => ({
      date: e.date, expense: e.expense, amount: e.amount,
      category: e.category, sub_category: e.sub_category,
      payment_method: e.payment_method, bank_account: e.bank_account,
      notes: e.notes,
    }))
  );

  return `You are a sharp, insightful personal finance assistant. The user's financial data this salary cycle:
- Monthly Salary: ${formatCurrency(salary)}
- Total Spent: ${formatCurrency(totalSpent)}
- Remaining: ${formatCurrency(remaining)}
- ${expenses.length} transactions${budgetSection}

Here is the FULL transaction data as JSON:
${txnJson}

Rules for your responses:
- Be specific with exact amounts and percentages from the data
- Use numbered lists for breakdowns, bold (**text**) for key amounts and categories
- Keep responses under 150 words
- Focus on spending patterns, savings opportunities, and actionable insights
- If the user has set subcategory budgets, reference them when relevant — highlight items over budget or near their limit
- Be conversational but data-driven`;
}

function renderMarkdown(text) {
  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i++;
      continue;
    }

    const olMatch = line.match(/^\d+\.\s+/);
    if (olMatch) {
      const items = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''));
        i++;
      }
      elements.push(
        <ol key={elements.length} className="list-decimal list-outside ml-4 space-y-1.5 my-1.5">
          {items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    const ulMatch = line.match(/^[-*]\s+/);
    if (ulMatch) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[-*]\s+/)) {
        items.push(lines[i].replace(/^[-*]\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={elements.length} className="list-disc list-outside ml-4 space-y-1 my-1.5">
          {items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    elements.push(<p key={elements.length} className="my-1">{renderInline(line)}</p>);
    i++;
  }

  return elements;
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-orange-300 font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

const SUGGESTIONS = [
  'Where is most of my money going?',
  'Show me my spending habits',
  'How can I save more this month?',
  'Any unusual spending patterns?',
];

export function Chatbot({ expenses, salary }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(GEMINI_API_KEY);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    if (!apiKey) {
      setShowKeyInput(true);
      return;
    }

    setInput('');
    const userMsg = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const context = buildContext(expenses, salary);
      const history = messages.slice(-8).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: context }] },
            contents: [
              ...history,
              { role: 'user', parts: [{ text }] },
            ],
          }),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        throw new Error(res.status === 400 ? 'Invalid API key' : `API error: ${res.status}`);
      }

      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.';
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'error', text: err.message || 'Failed to get response. Check your API key.' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, apiKey, expenses, salary, messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const saveKey = () => {
    setShowKeyInput(false);
    if (input.trim()) sendMessage();
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 left-4 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-orange-500 hover:bg-orange-400 text-black shadow-lg shadow-orange-500/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        aria-label="Open chat"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-20 sm:bottom-24 left-4 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[min(520px,75vh)] flex flex-col rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/50 overflow-hidden"
          style={{ background: '#111' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-orange-500/5">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-orange-400" />
              <span className="text-sm font-semibold text-neutral-200">Finance Assistant</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400 font-medium">AI</span>
            </div>
            <button
              onClick={() => setShowKeyInput((v) => !v)}
              className="p-1.5 rounded-lg hover:bg-white/[0.04] text-neutral-500 hover:text-neutral-300 transition-colors"
              aria-label="Settings"
            >
              <Settings size={14} />
            </button>
          </div>

          {showKeyInput && (
            <div className="px-4 py-3 border-b border-white/[0.06] bg-orange-500/5">
              <p className="text-[11px] text-neutral-400 mb-2">
                Enter your Gemini API key. Get one free at{' '}
                <span className="text-orange-400">aistudio.google.com/app/apikey</span>
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIza..."
                  className="flex-1 px-3 py-1.5 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-neutral-200 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                />
                <button
                  onClick={saveKey}
                  className="px-3 py-1.5 text-xs bg-orange-500/20 text-orange-300 rounded-lg hover:bg-orange-500/30 transition-colors font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <Bot size={32} className="text-orange-500/30 mx-auto mb-3" />
                <p className="text-sm text-neutral-400 mb-1">Ask me about your finances</p>
                <p className="text-[11px] text-neutral-600">I analyze your spending patterns, find savings opportunities, and give data-driven insights.</p>
                <div className="mt-4 grid grid-cols-2 gap-1.5">
                  {SUGGESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); }}
                      className="text-left text-[11px] px-2.5 py-2 rounded-lg bg-white/[0.02] border border-white/[0.06] text-neutral-400 hover:text-orange-300 hover:border-orange-500/20 transition-colors leading-snug"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role !== 'user' && (
                  <div className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                    msg.role === 'error' ? 'bg-red-500/10' : 'bg-orange-500/10'
                  }`}>
                    {msg.role === 'error' ? (
                      <AlertCircle size={12} className="text-red-400" />
                    ) : (
                      <Bot size={12} className="text-orange-400" />
                    )}
                  </div>
                )}
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-[13px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-orange-500/15 text-neutral-200 rounded-br-sm'
                    : msg.role === 'error'
                    ? 'bg-red-500/10 text-red-300 border border-red-500/10'
                    : 'bg-white/[0.04] text-neutral-300 rounded-bl-sm'
                }`}>
                  {msg.role === 'assistant' ? renderMarkdown(msg.text) : msg.text}
                </div>
                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center mt-0.5 bg-orange-500/15">
                    <User size={12} className="text-orange-400" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center mt-0.5 bg-orange-500/10">
                  <Bot size={12} className="text-orange-400" />
                </div>
                <div className="bg-white/[0.04] px-4 py-3 rounded-xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-orange-400/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-orange-400/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-orange-400/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-3 py-2.5 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={apiKey ? 'Ask about your spending...' : 'Set API key first...'}
                className="flex-1 px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-neutral-200 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/30"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="p-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
