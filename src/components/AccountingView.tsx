import React, { useState, useMemo } from 'react';
import { 
  BadgeDollarSign, 
  Search, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Landmark, 
  Briefcase, 
  Calendar, 
  X,
  Printer
} from 'lucide-react';
import { Income, Expense, Language } from '../types';

interface AccountingViewProps {
  incomeLogs: Income[];
  expenseLogs: Expense[];
  lang: Language;
  t: (key: string) => string;
  onAddExpense: (exp: Expense) => void;
  onAddIncome: (inc: Income) => void;
}

export default function AccountingView({
  incomeLogs,
  expenseLogs,
  lang,
  t,
  onAddExpense,
  onAddIncome
}: AccountingViewProps) {
  const [activeSegment, setActiveSegment] = useState<'PL' | 'Income' | 'Expense'>('PL');
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isIncomeOpen, setIsIncomeOpen] = useState(false);

  // Expense form states
  const [expCategory, setExpCategory] = useState<Expense['category']>('Utilities');
  const [expAmount, setExpAmount] = useState(0);
  const [expDate, setExpDate] = useState('2026-06-06');
  const [expDesc, setExpDesc] = useState('');

  // Income form states
  const [incCategory, setIncCategory] = useState<Income['category']>('Late Fees');
  const [incAmount, setIncAmount] = useState(0);
  const [incDate, setIncDate] = useState('2026-06-06');
  const [incDesc, setIncDesc] = useState('');

  // 1. Calculate P&L values
  const plData = useMemo(() => {
    // Group Income categories
    const incGroup: Record<Income['category'], number> = {
      'Pawn Interest': 0,
      'Loan Interest': 0,
      'Installment Profit': 0,
      'Late Fees': 0,
      'Auction Income': 0,
      'Other': 0
    };
    
    let totalIncome = 0;
    incomeLogs.forEach(i => {
      incGroup[i.category] = (incGroup[i.category] || 0) + i.amount;
      totalIncome += i.amount;
    });

    // Group Expense categories
    const expGroup: Record<Expense['category'], number> = {
      'Staff Salary': 0,
      'Office Rent': 0,
      'Utilities': 0,
      'Maintenance': 0,
      'Marketing': 0,
      'Other': 0
    };

    let totalExpense = 0;
    expenseLogs.forEach(e => {
      expGroup[e.category] = (expGroup[e.category] || 0) + e.amount;
      totalExpense += e.amount;
    });

    const netProfit = totalIncome - totalExpense;

    return {
      incGroup,
      expGroup,
      totalIncome,
      totalExpense,
      netProfit
    };
  }, [incomeLogs, expenseLogs]);

  // Submit Expense
  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (expAmount <= 0) return;

    const newExp: Expense = {
      id: `EXP-${4000 + expenseLogs.length + 1}`,
      category: expCategory,
      amount: expAmount,
      currency: 'USD',
      date: expDate,
      description: expDesc
    };

    onAddExpense(newExp);
    setIsExpenseOpen(false);
    setExpAmount(0);
    setExpDesc('');
  };

  // Submit Income
  const handleIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (incAmount <= 0) return;

    const newInc: Income = {
      id: `INC-${5000 + incomeLogs.length + 1}`,
      category: incCategory,
      amount: incAmount,
      currency: 'USD',
      date: incDate,
      description: incDesc
    };

    onAddIncome(newInc);
    setIsIncomeOpen(false);
    setIncAmount(0);
    setIncDesc('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BadgeDollarSign className="w-5.5 h-5.5 text-[#10b981]" />
            <span>{t('accountingModule')}</span>
          </h2>
          <p className="text-xs text-slate-500">{lang === 'KH' ? 'សៀវភៅតាមដានចំណូលចំណាយ អត្រាការប្រាក់ទទួលបាន និងគណនាចំណេញចុងក្រោយ' : 'Double-entry microfinance bookkeeping reporting overall revenue collections vs operational expenditures'}</p>
        </div>
        
        {/* Actions panel */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button 
            onClick={() => setIsIncomeOpen(true)}
            className="inline-flex items-center justify-center gap-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'KH' ? 'បន្ថែមចំណូល' : 'Log Income'}</span>
          </button>
          <button 
            onClick={() => setIsExpenseOpen(true)}
            className="inline-flex items-center justify-center gap-1 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'KH' ? 'បន្ថែមចំណាយ' : 'Log Expense'}</span>
          </button>
        </div>
      </div>

      {/* SEGMENT TOGGLES */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-64 select-none">
        <button 
          onClick={() => setActiveSegment('PL')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold font-sans transition-all ${
            activeSegment === 'PL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {lang === 'KH' ? 'របាយការណ៍ចំណេញ/ខាត' : 'Profit & Loss'}
        </button>
        <button 
          onClick={() => setActiveSegment('Income')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold font-sans transition-all ${
            activeSegment === 'Income' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {lang === 'KH' ? 'សៀវភៅចំណូល' : 'Income Items'}
        </button>
        <button 
          onClick={() => setActiveSegment('Expense')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold font-sans transition-all ${
            activeSegment === 'Expense' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {lang === 'KH' ? 'សៀវភៅចំណាយ' : 'Expenses'}
        </button>
      </div>

      {/* --- SEGMENT 1: PROFIT & LOSS STATEMENT --- */}
      {activeSegment === 'PL' && (
        <div id="print-pl-sheet" className="p-6 bg-white rounded-2xl border border-gray-150 shadow-sm space-y-6">
          <div className="flex justify-between items-start border-b border-gray-150 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">{t('profitAndLoss')}</h3>
              <p className="text-xs text-gray-500 font-sans mt-0.5">{lang === 'KH' ? 'គិតត្រឹមថ្ងៃទី៦ មិថុនា ២០២៦ សាខាភ្នំពេញ' : 'Accrued up to June 6, 2026 — Phnom Penh Branch operations'}</p>
            </div>
            <button
              onClick={() => {
                const printContents = document.getElementById('print-pl-sheet')?.innerHTML;
                if (printContents) {
                  const originalContents = document.body.innerHTML;
                  document.body.innerHTML = printContents;
                  window.print();
                  document.body.innerHTML = originalContents;
                  window.location.reload();
                }
              }}
              className="inline-flex items-center gap-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('print')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm pt-2">
            
            {/* Income breakdown segment */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-2">
                <h4 className="font-extrabold text-emerald-800 tracking-tight flex items-center gap-1.5">
                  <TrendingUp className="w-4.5 h-4.5" />
                  <span>{t('totalIncome')}</span>
                </h4>
                <span className="font-black text-emerald-700 font-mono">${plData.totalIncome.toFixed(2)}</span>
              </div>
              
              <div className="divide-y divide-gray-100 pl-4 space-y-2.5">
                {Object.entries(plData.incGroup).map(([cat, amount]) => (
                  <div key={cat} className="flex justify-between items-center text-xs pt-2">
                    <span className="text-slate-600 font-medium">{cat}</span>
                    <span className="font-bold text-slate-800 font-mono">${Number(amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expense breakdown segment */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-rose-500 pb-2">
                <h4 className="font-extrabold text-rose-800 tracking-tight flex items-center gap-1.5">
                  <TrendingDown className="w-4.5 h-4.5" />
                  <span>{t('totalExpense')}</span>
                </h4>
                <span className="font-black text-rose-700 font-mono">${plData.totalExpense.toFixed(2)}</span>
              </div>
              
              <div className="divide-y divide-gray-100 pl-4 space-y-2.5">
                {Object.entries(plData.expGroup).map(([cat, amount]) => (
                  <div key={cat} className="flex justify-between items-center text-xs pt-2">
                    <span className="text-slate-600 font-medium">{cat}</span>
                    <span className="font-bold text-slate-800 font-mono">${Number(amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* NET NET RESULTS SECTION */}
          <div className={`p-4 rounded-xl flex items-center justify-between ${
            plData.netProfit >= 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
          } mt-6`}>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('netProfit')}</div>
              <div className="text-[10px] text-gray-500 italic mt-0.5">{lang === 'KH' ? 'ចំណូលទាំងអស់ដកចំណាយផ្សេងៗ' : 'Total bottomline margins after tax offsets'}</div>
            </div>
            <div className={`text-2xl font-black font-sans font-mono ${
              plData.netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'
            }`}>
              ${plData.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      )}

      {/* --- SEGMENT 2: LIST INCOME ITEMS --- */}
      {activeSegment === 'Income' && (
        <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-150 bg-slate-50 text-slate-400 font-bold uppercase">
                  <th className="py-3 px-4">Ledger ID</th>
                  <th className="py-3 px-4">{t('category')}</th>
                  <th className="py-3 px-4">{lang === 'KH' ? 'កំណត់ត្រា' : 'Description'}</th>
                  <th className="py-3 px-4">{t('amount')}</th>
                  <th className="py-3 px-4">{lang === 'KH' ? 'ថ្ងៃកត់ត្រា' : 'Date'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-slate-800 font-semibold">
                {incomeLogs.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/55 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{item.id}</td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold py-0.5 px-2.5 rounded-full border border-emerald-200 uppercase tracking-wide">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium">{item.description}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-gray-400 font-mono">{new Date(item.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- SEGMENT 3: LIST EXPENSE ITEMS --- */}
      {activeSegment === 'Expense' && (
        <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-150 bg-slate-50 text-slate-400 font-bold uppercase">
                  <th className="py-3 px-4">Ledger ID</th>
                  <th className="py-3 px-4">{t('category')}</th>
                  <th className="py-3 px-4">{lang === 'KH' ? 'កំណត់ត្រា' : 'Description'}</th>
                  <th className="py-3 px-4">{t('amount')}</th>
                  <th className="py-3 px-4">{lang === 'KH' ? 'ថ្ងៃកត់ត្រា' : 'Date'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-slate-800 font-semibold">
                {expenseLogs.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/55 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{item.id}</td>
                    <td className="py-3 px-4">
                      <span className="bg-rose-50 text-rose-800 text-[10px] font-bold py-0.5 px-2.5 rounded-full border border-rose-200 uppercase tracking-wide">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium">{item.description}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-gray-400 font-mono">{new Date(item.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- LEDGER LOG INCOME POPUP --- */}
      {isIncomeOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleIncomeSubmit} className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 select-none">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-bold text-slate-900 text-base">
                {lang === 'KH' ? 'កត់ត្រាប្រាក់ចំណូល' : 'Log Extra Revenue'}
              </h3>
              <button type="button" onClick={() => setIsIncomeOpen(false)} className="text-gray-400 hover:text-gray-900 p-1 rounded bg-slate-50">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('category')}</label>
                <select 
                  value={incCategory} onChange={(e) => setIncCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="Pawn Interest">Pawn Interest / ការប្រាក់បញ្ចាំ</option>
                  <option value="Loan Interest">Loan Interest / ការឥណទាន</option>
                  <option value="Installment Profit">Installment profit / រំលស់</option>
                  <option value="Late Fees">Late Fees / ពិន័យយឺតយ៉ាវ</option>
                  <option value="Auction Income">Auction Income / លក់ឡៃឡុង</option>
                  <option value="Other">Other / ផ្សេងៗ</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('amount')} (USD) *</label>
                <input 
                  type="number" required min={1}
                  value={incAmount} onChange={(e) => setIncAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1 font-mono">
                <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'KH' ? 'ថ្ងៃកត់ត្រា' : 'Ledger Date'}</label>
                <input 
                  type="date"
                  value={incDate} onChange={(e) => setIncDate(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'KH' ? 'ការពិពណ៌នា' : 'Memo Notes'}</label>
                <textarea 
                  value={incDesc} onChange={(e) => setIncDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none min-h-[50px]"
                  placeholder="Memo detail..."
                />
              </div>
            </div>

            <div className="flex justify-end items-center space-x-2 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setIsIncomeOpen(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700">
                {t('cancel')}
              </button>
              <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors">
                {t('save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- LEDGER LOG EXPENSE POPUP --- */}
      {isExpenseOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleExpenseSubmit} className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 select-none">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-bold text-slate-900 text-base">
                {lang === 'KH' ? 'កត់ត្រាចំណាយការិយាល័យ' : 'Register Expense Bill'}
              </h3>
              <button type="button" onClick={() => setIsExpenseOpen(false)} className="text-gray-400 hover:text-gray-900 p-1 rounded bg-slate-50">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('category')}</label>
                <select 
                  value={expCategory} onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="Staff Salary">Staff Salary / ប្រាក់ខែបុគ្គលិក</option>
                  <option value="Office Rent">Office Rent / ជួលទីតាំង</option>
                  <option value="Utilities">Utilities / ទឹក ភ្លើង អ៊ីនធឺណិត</option>
                  <option value="Maintenance">Maintenance / ថែទាំការិយាល័យ</option>
                  <option value="Marketing">Marketing / ផ្សព្វផ្សាយ</option>
                  <option value="Other">Other / ផ្សេងៗទៀត</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('amount')} (USD) *</label>
                <input 
                  type="number" required min={1}
                  value={expAmount} onChange={(e) => setExpAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1 font-mono">
                <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'KH' ? 'ថ្ងៃកត់ត្រា' : 'Ledger Date'}</label>
                <input 
                  type="date"
                  value={expDate} onChange={(e) => setExpDate(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'KH' ? 'ការពិពណ៌នា' : 'Expense Memo'}</label>
                <textarea 
                  value={expDesc} onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none min-h-[50px]"
                  placeholder="Memo bill details..."
                />
              </div>
            </div>

            <div className="flex justify-end items-center space-x-2 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setIsExpenseOpen(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700">
                {t('cancel')}
              </button>
              <button type="submit" className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors">
                {t('save')}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
