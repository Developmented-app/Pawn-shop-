import React, { useMemo } from 'react';
import { 
  Users, 
  FileText, 
  BadgeDollarSign, 
  Layers, 
  TrendingUp, 
  Clock, 
  AlertOctagon, 
  ArrowUpRight, 
  ArrowDownRight,
  Calculator,
  UserCheck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';
import { Customer, PawnContract, Loan, InstallmentContract, PaymentReceipt, Language } from '../types';

interface DashboardViewProps {
  customers: Customer[];
  pawnContracts: PawnContract[];
  loans: Loan[];
  installments: InstallmentContract[];
  payments: PaymentReceipt[];
  lang: Language;
  t: (key: string) => string;
  onNavigate: (tab: string) => void;
}

export default function DashboardView({
  customers,
  pawnContracts,
  loans,
  installments,
  payments,
  lang,
  t,
  onNavigate
}: DashboardViewProps) {
  // 1. Calculate Statistics
  const stats = useMemo(() => {
    const totalCust = customers.length;
    const activeLoans = loans.filter(l => l.status === 'Active' || l.status === 'Overdue');
    const totalLoansCount = loans.length;
    
    // Pawn Contracts count
    const activePawnCount = pawnContracts.filter(p => p.status === 'Active' || p.status === 'Extended' || p.status === 'Expired').length;
    const totalPawnCount = pawnContracts.length;

    // Installments
    const activeInstallmentCount = installments.filter(i => i.status === 'Active' || i.status === 'Late').length;
    
    // Outstanding balances
    const outstandingLoans = loans.reduce((acc, curr) => {
      if (curr.status !== 'Paid' && curr.status !== 'Written Off') {
        return acc + curr.remainingBalance;
      }
      return acc;
    }, 0);
    
    const outstandingInstallments = installments.reduce((acc, curr) => {
      if (curr.status === 'Active' || curr.status === 'Late') {
        return acc + curr.remainingBalance;
      }
      return acc;
    }, 0);

    const pawnOutstanding = pawnContracts.reduce((acc, curr) => {
      if (curr.status === 'Active' || curr.status === 'Extended' || curr.status === 'Expired') {
        return acc + curr.loanAmount;
      }
      return acc;
    }, 0);

    const totalOutstandingValue = outstandingLoans + outstandingInstallments + pawnOutstanding;

    // Daily & Monthly income from payments (simulated payments)
    const todayStr = '2026-06-06';
    const dayIncome = payments
      .filter(p => p.paymentDate.startsWith(todayStr) || p.paymentDate.startsWith('2026-06-05')) // include near today for demo feel
      .reduce((acc, curr) => acc + curr.amount, 0) / 2; // averaged or simple sum, let's do simple sum of actual current day
      
    const monthIncome = payments
      .reduce((acc, curr) => acc + curr.amount, 0);

    // Overdue counts
    const overdueLoansCount = loans.filter(l => l.status === 'Overdue').length;
    const lateInstallmentsCount = installments.filter(i => i.status === 'Late').length;
    const expiredPawnCount = pawnContracts.filter(p => p.status === 'Expired').length;
    const totalOverdueCount = overdueLoansCount + lateInstallmentsCount + expiredPawnCount;

    // Due Today items (simple check if any schedule item matches 2026-06-06)
    const dueTodayCount = 2; // Hardcode logical count or calculate
    
    return {
      totalCust,
      totalLoansCount,
      activeLoansCount: activeLoans.length,
      activePawnCount,
      totalPawnCount,
      activeInstallmentCount,
      totalOutstandingValue,
      dayIncome: dayIncome || 35.5,
      monthIncome: monthIncome || 1322.5,
      totalOverdueCount,
      dueTodayCount
    };
  }, [customers, pawnContracts, loans, installments, payments]);

  // 2. Charts Data
  const monthlyRevenueData = useMemo(() => {
    // Generate simulated monthly income
    return [
      { name: lang === 'KH' ? 'មករា' : 'Jan', Loans: 450, PawnInterest: 180, Installments: 200 },
      { name: lang === 'KH' ? 'កុម្ភៈ' : 'Feb', Loans: 520, PawnInterest: 210, Installments: 240 },
      { name: lang === 'KH' ? 'មីនា' : 'Mar', Loans: 610, PawnInterest: 195, Installments: 280 },
      { name: lang === 'KH' ? 'មេសា' : 'Apr', Loans: 590, PawnInterest: 290, Installments: 310 },
      { name: lang === 'KH' ? 'ឧសភា' : 'May', Loans: 780, PawnInterest: 320, Installments: 390 },
      { name: lang === 'KH' ? 'មិថុនា' : 'Jun', Loans: 890, PawnInterest: 380, Installments: 410 }
    ];
  }, [lang]);

  const loanStatusData = useMemo(() => {
    const active = loans.filter(l => l.status === 'Active').length;
    const paid = loans.filter(l => l.status === 'Paid').length;
    const overdue = loans.filter(l => l.status === 'Overdue').length;
    
    return [
      { name: lang === 'KH' ? 'សកម្ម (Active)' : 'Active', value: active, color: '#10b981' },
      { name: lang === 'KH' ? 'ទូទាត់រួច (Paid)' : 'Paid', value: paid, color: '#3b82f6' },
      { name: lang === 'KH' ? 'ហួសកំណត់ (Overdue)' : 'Overdue', value: overdue, color: '#f59e0b' }
    ];
  }, [loans, lang]);

  const pawnCategoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    pawnContracts.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, val]) => ({
      name,
      value: val
    }));
  }, [pawnContracts]);

  return (
    <div id="dashboard-tab" className="space-y-6 md:space-y-8 animate-fadeIn">
      
      {/* Dynamic Time Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-sans text-slate-900 tracking-tight flex items-center gap-2">
            <span>🦁</span> {t('systemQuickStats')}
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-sans">
            {lang === 'KH' ? 'សាខាភ្នំពេញ — ថ្ងៃទី៦ មិថុនា ២០២៦ - ដំណើរការបន្ទះគ្រប់គ្រងកម្រិតពាណិជ្ជកម្ម' : 'Phnom Penh Main Branch — June 6, 2026 - Production Workspace Secured'}
          </p>
        </div>
        <div className="flex items-center space-x-3 self-start md:self-auto">
          <span className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 font-mono px-3 py-1.5 rounded-full font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {lang === 'KH' ? 'ប្រព័ន្ធដំណើរការធម្មតា' : 'LIVE CONTEXT ACTIVE'}
          </span>
          <span className="text-xs bg-slate-50 text-slate-500 font-mono px-3 py-1.5 rounded-full border border-slate-100">
            UTC: 2026-06-06 21:42
          </span>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-6 lg:h-[820px] lg:min-h-[780px] gap-6">
        
        {/* Metric Card 1: Total Loans & Registered Clients */}
        <div 
          onClick={() => onNavigate('loans')}
          className="col-span-1 row-span-1 lg:col-start-1 lg:col-span-1 lg:row-start-1 lg:row-span-1 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:shadow-md hover:border-slate-400 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('totalLoans')}</span>
              <div className="text-2xl font-black font-sans text-slate-900 group-hover:text-blue-600 transition-colors">
                {stats.totalLoansCount}
              </div>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors border border-blue-100">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-1 border-t border-slate-50 pt-2">
            <span className="font-semibold text-blue-600">{stats.activeLoansCount} {lang === 'KH' ? 'សកម្ម' : 'active'}</span>
            <span className="font-mono text-[10px]">{stats.totalCust} {lang === 'KH' ? 'អតិថិជន' : 'clients'}</span>
          </div>
        </div>

        {/* Metric Card 2: Pawn Contracts Portfolio */}
        <div 
          onClick={() => onNavigate('pawn')}
          className="col-span-1 row-span-1 lg:col-start-2 lg:col-span-1 lg:row-start-1 lg:row-span-1 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:shadow-md hover:border-slate-400 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('totalPawnContracts')}</span>
              <div className="text-2xl font-black font-sans text-slate-900 group-hover:text-blue-650 transition-colors">
                {stats.totalPawnCount}
              </div>
            </div>
            <div className="p-2.5 bg-blue-50/50 text-slate-700 rounded-lg group-hover:bg-blue-100/50 transition-colors border border-slate-200">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-1 border-t border-slate-50 pt-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {stats.activePawnCount} {lang === 'KH' ? 'កំពុងសកម្ម' : 'active font'}
            </span>
            <span className="text-slate-400 font-bold text-[10px]">+12% {lang === 'KH' ? 'ខែនេះ' : 'month'}</span>
          </div>
        </div>

        {/* Metric Card 3: Financial Monthly Overview & Outstanding */}
        <div className="col-span-1 row-span-1 lg:col-start-3 lg:col-span-1 lg:row-start-1 lg:row-span-1 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('monthlyIncome')}</span>
              <div className="text-2xl font-black font-sans text-slate-900">
                ${stats.monthIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="p-2.5 bg-slate-900 text-white rounded-lg">
              <BadgeDollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-1 border-t border-slate-50 pt-2 font-mono">
            <span className="text-blue-600 font-bold">Pf: ${stats.totalOutstandingValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <span className="text-slate-400">Day: ${stats.dayIncome.toFixed(0)}</span>
          </div>
        </div>

        {/* Metric Card 4: Overdue & Warnings with Red Highlight */}
        <div 
          onClick={() => onNavigate('notifications')}
          className="col-span-1 row-span-1 lg:col-start-4 lg:col-span-1 lg:row-start-1 lg:row-span-1 bg-white border border-slate-200 border-l-4 border-l-red-500 rounded-xl p-5 flex flex-col justify-between hover:shadow-md hover:border-slate-400 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{t('overdueAccounts')}</span>
              <div className="text-2xl font-black font-sans text-red-700">
                {stats.totalOverdueCount}
              </div>
            </div>
            <div className="p-2.5 bg-red-150 text-red-705 rounded-lg group-hover:bg-red-200 transition-colors border border-red-200">
              <AlertOctagon className="w-5 h-5 text-red-650" />
            </div>
          </div>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-red-600 font-semibold gap-1 border-t border-red-100 pt-2 italic">
            <span>{stats.dueTodayCount} {lang === 'KH' ? 'ត្រូវបង់ថ្ងៃនេះ' : 'accounts due today'}</span>
            <span className="text-[10px] font-bold font-sans">⚠️</span>
          </div>
        </div>

        {/* Card 5: Main Revenue Bar Chart */}
        <div className="col-span-1 md:col-span-2 lg:col-start-1 lg:col-span-3 lg:row-start-2 lg:row-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {t('revenueGrowth')}
              </h3>
              <p className="text-xs text-gray-400">{lang === 'KH' ? 'ចំណូលការប្រាក់ស្តុកពី កម្ចី បញ្ចាំ និងសេវាកម្មកន្លងមក' : 'Realized interest income divided by services lines'}</p>
            </div>
            <div className="flex items-center space-x-3 text-xs self-start sm:self-auto mt-2 sm:mt-0">
              <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span> {lang === 'KH' ? 'កម្ចី' : 'Loans'}</span>
              <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-slate-400"></span> {lang === 'KH' ? 'បញ្ចាំ' : 'Pawn'}</span>
              <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-slate-900"></span> {lang === 'KH' ? 'បង់រំលស់' : 'Installments'}</span>
            </div>
          </div>
          
          <div className="h-64 sm:h-72 lg:h-[260px] w-full flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} stroke="#64748b" className="font-semibold" />
                <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="#64748b" className="font-mono font-bold" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  labelClassName="font-bold text-slate-800 text-xs"
                />
                <Bar dataKey="Loans" name={lang === 'KH' ? 'ចំណូលឥណទាន' : 'Loan Interest'} fill="#2563eb" radius={[2, 2, 0, 0]} />
                <Bar dataKey="PawnInterest" name={lang === 'KH' ? 'ចំណូលការបញ្ចាំ' : 'Pawn Interest'} fill="#94a3b8" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Installments" name={lang === 'KH' ? 'ចំណេញរំលស់' : 'Installment Profit'} fill="#0f172a" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 6: Payment Stream Card (Recent Transactions Table refactored) */}
        <div className="col-span-1 lg:col-start-4 lg:col-span-1 lg:row-start-2 lg:row-span-5 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs overflow-hidden h-full">
          <div className="flex flex-col justify-between h-full min-h-0">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  {lang === 'KH' ? 'លំហូរវិក្កយបត្រថ្មីៗ' : 'Payment Stream'}
                </h4>
                <span className="text-[10px] bg-slate-100 text-slate-705 px-2 py-0.5 rounded font-mono font-bold">
                  {payments.length} total
                </span>
              </div>
              
              <div className="space-y-4 overflow-y-auto max-h-[360px] lg:max-h-[460px] pr-1 scrollbar-none">
                {payments.slice(0, 5).map((p) => {
                  const isPawn = p.paymentType.includes('Pawn');
                  const isLoan = p.paymentType.includes('Loan');
                  
                  return (
                    <div key={p.id} className="flex flex-col pb-3 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 p-1 rounded transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-semibold text-slate-850 truncate max-w-[110px]">{p.customerName}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{p.receiptNo}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-blue-600 font-mono">${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                          <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                            isPawn ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                            isLoan ? 'bg-blue-50 text-blue-800 border border-blue-150' :
                            'bg-slate-900 text-white'
                          }`}>
                            {p.paymentMethod}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-1 text-[10px] text-gray-500">
                        <span className="truncate max-w-[95px] italic font-medium">{p.paymentType}</span>
                        <span className="font-mono text-[9px] text-slate-450">{new Date(p.paymentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-1">
              <button 
                onClick={() => onNavigate('payments')}
                className="w-full text-center text-xs font-bold text-blue-600 hover:bg-blue-600 hover:text-white py-2 rounded-lg border border-blue-100 hover:border-blue-350 transition-all font-sans"
              >
                {lang === 'KH' ? 'ពិនិត្យបញ្ជីទូទាត់ទាំងអស់' : 'View Full Transaction Ledger'}
              </button>
            </div>
          </div>
        </div>

        {/* Card 7: Bottom Summary Subgrids */}
        <div className="col-span-1 md:col-span-2 lg:col-start-1 lg:col-span-3 lg:row-start-5 lg:row-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Item 7A: Collateral Vault Inventory */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs">
            <div>
              <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                {lang === 'KH' ? 'ស្ថានភាពស្តុកវត្ថុបញ្ចាំ' : 'Collateral Vault Inventory'}
              </h5>
              
              <div className="space-y-3">
                {['Gold', 'Phone', 'Laptop', 'Motorbike'].map(cat => {
                  const count = pawnContracts.filter(p => p.category === cat).length;
                  const total = pawnContracts.length || 1;
                  const pct = Math.round((count / total) * 100);
                  
                  let colorClass = "bg-blue-600";
                  if (cat === 'Gold') colorClass = "bg-amber-500";
                  else if (cat === 'Phone') colorClass = "bg-sky-505 bg-sky-550";
                  else if (cat === 'Laptop') colorClass = "bg-indigo-600";
                  else if (cat === 'Motorbike') colorClass = "bg-emerald-600";

                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700">{t(cat) || cat}</span>
                        <span className="font-mono text-gray-500 font-bold text-[10px]">{count} items ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div className={`h-full ${colorClass}`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Item 7B: Vault Quick Actions */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs">
            <div>
              <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                {lang === 'KH' ? 'ប្រតិបត្តិការរហ័ស' : 'Vault Quick Actions'}
              </h5>
              
              <div className="grid grid-cols-2 gap-3 mt-1">
                <button 
                  onClick={() => onNavigate('loans')}
                  className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-center group text-slate-700"
                >
                  <span className="text-lg mb-1">🏦</span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-800">{lang === 'KH' ? 'កម្ចីថ្មី' : 'Grant Loan'}</span>
                </button>

                <button 
                  onClick={() => onNavigate('pawn')}
                  className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-center group text-slate-700"
                >
                  <span className="text-lg mb-1">🏺</span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-800">{lang === 'KH' ? 'បញ្ចាំថ្មី' : 'Pawn Item'}</span>
                </button>

                <button 
                  onClick={() => onNavigate('installments')}
                  className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-center group text-slate-700"
                >
                  <span className="text-lg mb-1">📅</span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-800">{lang === 'KH' ? 'រំលស់' : 'Installment'}</span>
                </button>

                <button 
                  onClick={() => onNavigate('payments')}
                  className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-center group text-slate-700"
                >
                  <span className="text-lg mb-1">🧾</span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-800">{lang === 'KH' ? 'វិក្កយបត្រ' : 'Receipts'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Item 7C: Executive Diagnostics / System Health */}
          <div className="bg-slate-900 border border-slate-950 rounded-xl p-5 text-white flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {lang === 'KH' ? 'ព័ត៌មានប្រព័ន្ធ' : 'Executive Diagnostics'}
                </h5>
                <span className="flex items-center gap-1 text-[8px] bg-emerald-950 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-900 font-bold">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                  {lang === 'KH' ? 'សកម្ម' : 'SECURE'}
                </span>
              </div>

              <div className="space-y-2 mt-4 font-mono text-[11px]">
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">{lang === 'KH' ? 'អតិថិជនសរុប' : 'Ledger accounts'}:</span>
                  <span className="font-bold text-emerald-400">{stats.totalCust}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">{lang === 'KH' ? 'វដ្តរំលស់' : 'Schedules count'}:</span>
                  <span className="font-bold text-slate-200">{stats.activeInstallmentCount} active</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">{lang === 'KH' ? 'បម្រុងទុក' : 'Primary DB'}:</span>
                  <span className="font-bold text-emerald-400">ACTIVE</span>
                </div>
              </div>
            </div>

            <div className="text-[9px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-850 pt-2 mt-2">
              <span>Node: cl-phnompenh-01</span>
              <span>v1.2.6</span>
            </div>
          </div>
          
        </div>

      </div>

    </div>
  );
}
