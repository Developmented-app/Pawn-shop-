import React, { useState, useMemo } from 'react';
import { 
  Landmark, 
  Search, 
  Plus, 
  Calendar, 
  BadgeCent, 
  AlertOctagon, 
  X, 
  ArrowRight, 
  Calculator, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  CreditCard 
} from 'lucide-react';
import { Loan, Customer, Language, LoanFrequency, LoanScheduleItem, PaymentReceipt } from '../types';

interface LoansViewProps {
  loans: Loan[];
  customers: Customer[];
  lang: Language;
  t: (key: string) => string;
  onCreateLoan: (loan: Loan) => void;
  onPayInstallment: (loanId: string, installmentNo: number, amountPaid: number, collector: string) => void;
  onUpdateLoanStatus: (loanId: string, status: Loan['status']) => void;
}

export default function LoansView({
  loans,
  customers,
  lang,
  t,
  onCreateLoan,
  onPayInstallment,
  onUpdateLoanStatus
}: LoansViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Loan['status']>('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedLoanDetails, setSelectedLoanDetails] = useState<Loan | null>(null);
  
  // Payment quick action states
  const [activePaymentLoan, setActivePaymentLoan] = useState<Loan | null>(null);
  const [paymentInstallmentNo, setPaymentInstallmentNo] = useState<number>(1);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'ABA' | 'ACLEDA' | 'KHQR'>('Cash');

  // Form states
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formPrincipal, setFormPrincipal] = useState(1000);
  const [formRate, setFormRate] = useState(2.0); // 2 % / cycle
  const [formTerm, setFormTerm] = useState(6); // 6 cycles (e.g. months)
  const [formFrequency, setFormFrequency] = useState<LoanFrequency>('Monthly');
  const [formStartDate, setFormStartDate] = useState('2026-06-06');
  const [formPenaltyRate, setFormPenaltyRate] = useState(0.2); // 0.2% per day penalty

  // Search filter
  const filteredLoans = useMemo(() => {
    let result = loans;

    if (statusFilter !== 'All') {
      result = result.filter(l => l.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(l => 
        l.loanNo.toLowerCase().includes(term) ||
        l.customerName.toLowerCase().includes(term) ||
        l.id.toLowerCase().includes(term)
      );
    }

    return result;
  }, [loans, statusFilter, searchTerm]);

  // Open add modal & pre-select first customer
  const handleOpenAdd = () => {
    if (customers.length > 0) {
      setFormCustomerId(customers[0].id);
    }
    setFormPrincipal(1000);
    setFormRate(2.0);
    setFormTerm(6);
    setFormFrequency('Monthly');
    setFormStartDate('2026-06-06');
    setFormPenaltyRate(0.2);
    setIsAddOpen(true);
  };

  // Helper: Generates precise amortization calendar based on schedule inputs
  const calculateScheduleList = (
    principal: number, 
    rate: number, 
    term: number, 
    frequency: LoanFrequency, 
    startDateStr: string
  ): LoanScheduleItem[] => {
    const list: LoanScheduleItem[] = [];
    const baseDate = new Date(startDateStr);
    
    // Equal principal amortization calculation
    const principalDuePerCycle = parseFloat((principal / term).toFixed(2));
    
    for (let i = 1; i <= term; i++) {
      // Calculate future cycle due dates
      const dueDate = new Date(baseDate);
      if (frequency === 'Daily') {
        dueDate.setDate(baseDate.getDate() + i);
      } else if (frequency === 'Weekly') {
        dueDate.setDate(baseDate.getDate() + (i * 7));
      } else if (frequency === 'Monthly') {
        dueDate.setMonth(baseDate.getMonth() + i);
      } else {
        dueDate.setMonth(baseDate.getMonth() + i); // Custom defaults to monthly
      }

      // Decreasing balance interest portion
      const currentPrincipalRemaining = principal - (principalDuePerCycle * (i - 1));
      const interestDue = parseFloat((currentPrincipalRemaining * (rate / 100)).toFixed(2));
      const totalDue = parseFloat((principalDuePerCycle + interestDue).toFixed(2));

      list.push({
        installmentNo: i,
        dueDate: dueDate.toISOString().split('T')[0],
        amountDue: totalDue,
        principalDue: principalDuePerCycle,
        interestDue,
        paidAmount: 0,
        status: 'Unpaid'
      });
    }

    return list;
  };

  // Submit Add Loan
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerId || formPrincipal <= 0 || formTerm <= 0) return;

    const matchedCust = customers.find(c => c.id === formCustomerId);
    if (!matchedCust) return;

    const nextId = `LOAN-${2000 + loans.length + 1}`;
    const loanNo = `L-${3000 + loans.length + 1}`;

    const schedule = calculateScheduleList(formPrincipal, formRate, formTerm, formFrequency, formStartDate);
    const endDate = schedule[schedule.length - 1].dueDate;

    const newLoan: Loan = {
      id: nextId,
      loanNo,
      customerId: formCustomerId,
      customerName: matchedCust.fullName,
      principalAmount: formPrincipal,
      interestRate: formRate,
      loanTerm: formTerm,
      startDate: formStartDate,
      endDate,
      paymentFrequency: formFrequency,
      status: 'Active',
      remainingBalance: formPrincipal,
      schedule,
      penaltyRate: formPenaltyRate
    };

    onCreateLoan(newLoan);
    setIsAddOpen(false);
  };

  // Open Quick Pay Modal
  const openQuickPay = (loan: Loan, installment: LoanScheduleItem) => {
    setActivePaymentLoan(loan);
    setPaymentInstallmentNo(installment.installmentNo);
    setPaymentAmount(parseFloat((installment.amountDue - installment.paidAmount).toFixed(2)));
    setPaymentMethod('Cash');
  };

  // Process payment submit
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentLoan || paymentAmount <= 0) return;

    onPayInstallment(
      activePaymentLoan.id, 
      paymentInstallmentNo, 
      paymentAmount, 
      'Chanthou Sopheap'
    );
    
    setActivePaymentLoan(null);
    setSelectedLoanDetails(null); // refresh drawer detail if left open
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Landmark className="w-5.5 h-5.5 text-blue-600" />
            <span>{t('navLoans')}</span>
          </h2>
          <p className="text-xs text-slate-500">{lang === 'KH' ? 'សរសើរកិច្ចសន្យាឥណទាន កាលវិភាគសងបង់ និងទទួលបានការប្រាក់សងរំលស់' : 'Administer micro-loans with customizable schedules, grace periods, diminishing balances, and auto penalties'}</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-750 text-white rounded-xl shadow-xs hover:shadow-md font-sans text-sm font-bold transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'KH' ? 'បង្កើតកិច្ចសន្យាកម្ចី' : 'Grant New Loan'}</span>
        </button>
      </div>

      {/* FILTER CONTROL TAB */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
        {(['All', 'Active', 'Paid', 'Overdue'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition-all ${
              statusFilter === tab 
                ? 'bg-slate-950 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            {tab === 'All' ? (lang === 'KH' ? 'ទាំងអស់' : 'All') : tab}
          </button>
        ))}
      </div>

      {/* Search Input Filter */}
      <div className="relative">
        <input 
          type="text"
          placeholder={lang === 'KH' ? 'ស្វែងរកលេខឥណទាន ឈ្មោះអតិថិជន...' : 'Search loan accounts, borrower designations...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-250 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs font-sans text-slate-800"
        />
        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
      </div>

      {/* Main Grid display contracts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredLoans.map((l) => (
          <div key={l.id} className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded select-all">
                    {l.loanNo}
                  </span>
                  <h4 className="font-extrabold text-slate-900 tracking-tight text-base mt-1.5">
                    {l.customerName}
                  </h4>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-md border ${
                  l.status === 'Active' ? 'bg-blue-50 text-blue-650 border-blue-200' :
                  l.status === 'Paid' ? 'bg-slate-900 text-white border-slate-950' :
                  'bg-red-50 text-red-600 border-red-200 animate-pulse'
                }`}>
                  {l.status}
                </span>
              </div>

              {/* Loans details blocks */}
              <div className="space-y-1.5 text-xs text-gray-600 pt-1 border-t border-gray-50/50">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">{t('principal')}</span>
                  <span className="font-extrabold text-slate-900">${l.principalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">{t('remaining')}</span>
                  <span className="font-bold text-emerald-600">${l.remainingBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">{lang === 'KH' ? 'រយៈពេលបង់ (Term)' : 'Loan Term'}</span>
                  <span className="font-semibold text-slate-800">{l.loanTerm} ({l.paymentFrequency})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">{lang === 'KH' ? 'ការប្រាក់បង្គរ' : 'Amortization Rate'}</span>
                  <span className="font-semibold text-indigo-600">{l.interestRate}% ({l.paymentFrequency})</span>
                </div>
              </div>
            </div>

            {/* Bottom button controls */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-50 mt-4">
              <button
                onClick={() => setSelectedLoanDetails(l)}
                className="flex-1 inline-flex items-center justify-center gap-1 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-lg text-xs transition-colors"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>{lang === 'KH' ? 'តារាងកាលវិភាគបង់' : 'Amortization Sheet'}</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* --- ADD NEW LOANS CONTRACT DIALOG --- */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form onSubmit={handleAddSubmit} className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto w-full">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-bold text-slate-900 text-lg">
                {lang === 'KH' ? 'បើកឥណទាន (ផ្ដល់កម្ចីថ្មី)' : 'Process New Loan Grant'}
              </h3>
              <button type="button" onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-gray-900 p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'KH' ? 'ជ្រើសរើសអ្នកខ្ចីប្រាក់ *' : 'Select Customer Borrower *'}</label>
                <select 
                  value={formCustomerId} onChange={(e) => setFormCustomerId(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:bg-white"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.id} — {c.fullName} ({c.phoneNumber})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'KH' ? 'ចំនួនប្រាក់ខ្ចី (USD) *' : 'Principal Amount (USD) *'}</label>
                <input 
                  type="number" required min={10}
                  value={formPrincipal} onChange={(e) => setFormPrincipal(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'KH' ? 'រយៈពេលខ្ចី (ដង/ខែ) *' : 'Repayment Term Cycles *'}</label>
                <input 
                  type="number" required min={1}
                  value={formTerm} onChange={(e) => setFormTerm(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'KH' ? 'អត្រាការប្រាក់ (% លើវដ្តសង) *' : 'Interest Rate (% per Cycle) *'}</label>
                <input 
                  type="number" required step="0.1"
                  value={formRate} onChange={(e) => setFormRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('frequency')}</label>
                <select 
                  value={formFrequency} onChange={(e) => setFormFrequency(e.target.value as LoanFrequency)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white"
                >
                  <option value="Daily">Daily / រាល់ថ្ងៃ</option>
                  <option value="Weekly">Weekly / រាល់សប្តាហ៍</option>
                  <option value="Monthly">Monthly / រាល់ខែ</option>
                  <option value="Custom">Custom Schedule</option>
                </select>
              </div>

              <div className="space-y-1 font-mono">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('startDate')}</label>
                <input 
                  type="date"
                  value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'KH' ? 'អត្រាពិន័យយឺតយ៉ាវ (%/ថ្ងៃ)' : 'Late Penalty Rate (%/Day)'}</label>
                <input 
                  type="number" step="0.05"
                  value={formPenaltyRate} onChange={(e) => setFormPenaltyRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end items-center space-x-2 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700">
                {t('cancel')}
              </button>
              <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm shadow-xs transition-colors">
                {t('save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- REPAYMENT AMORTIZATION LOG SCHEDULE / DETAILS PANEL --- */}
      {selectedLoanDetails && (
        <div className="fixed inset-y-0 right-0 max-w-2xl w-full bg-white shadow-2xl border-l border-gray-205 z-50 flex flex-col justify-between animate-slideIn select-none">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-emerald-900 text-white">
            <div>
              <h4 className="font-extrabold tracking-tight text-white mb-0.5">{selectedLoanDetails.customerName}</h4>
              <p className="text-xs text-emerald-100 font-mono">{lang === 'KH' ? 'លេខកូដកម្ចី' : 'Loan Account'}: {selectedLoanDetails.loanNo} ({selectedLoanDetails.paymentFrequency})</p>
            </div>
            <button 
              onClick={() => setSelectedLoanDetails(null)} 
              className="text-emerald-100 hover:text-white p-2 rounded-lg bg-emerald-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Amortization list contents */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <h5 className="font-black text-slate-800 text-sm">{lang === 'KH' ? 'តារាងបែងចែកកាលវិភាគបង់ប្រាក់' : 'Amortization Plan Calendars'}</h5>
            
            <div className="divide-y divide-gray-100">
              {selectedLoanDetails.schedule.map((item, index) => {
                const unpaidAmt = item.amountDue - item.paidAmount;
                return (
                  <div key={index} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-5 h-5 bg-slate-100 font-bold font-mono text-slate-700 rounded-full flex items-center justify-center text-[10px]">
                          {item.installmentNo}
                        </span>
                        <span className="font-bold text-slate-800 font-mono flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" /> {new Date(item.dueDate).toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-0.5 font-bold uppercase rounded text-[9px] ${
                          item.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                          item.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="text-gray-400 pl-6 flex flex-wrap gap-2">
                        <span>{lang === 'KH' ? 'ប្រាក់ដើម' : 'Principal'}: ${item.principalDue}</span>
                        <span>|</span>
                        <span>{lang === 'KH' ? 'ការប្រាក់' : 'Interest'}: ${item.interestDue}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 pl-6 sm:pl-0">
                      <div>
                        <div className="font-extrabold text-slate-900 text-right">${item.amountDue}</div>
                        {item.paidAmount > 0 && (
                          <div className="text-[10px] text-emerald-600 font-medium text-right">{lang === 'KH' ? 'បានបង់' : 'Paid'}: ${item.paidAmount}</div>
                        )}
                      </div>

                      {item.status !== 'Paid' && (
                        <button
                          type="button"
                          onClick={() => openQuickPay(selectedLoanDetails, item)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] font-sans shrink-0"
                        >
                          {t('pay')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 bg-slate-50 flex justify-end">
            <button 
              onClick={() => setSelectedLoanDetails(null)}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-950 text-white rounded-xl text-xs font-bold font-sans"
            >
              {lang === 'KH' ? 'ចាកចេញពីកាលវិភាគ' : 'Dismiss Schedule'}
            </button>
          </div>
        </div>
      )}

      {/* --- QUICK INSTALLMENT REPAYMENT RECEIVE FORM MODAL --- */}
      {activePaymentLoan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handlePaymentSubmit} className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-bold text-slate-900 text-base">
                {lang === 'KH' ? 'ទូទាត់ប្រាក់ឥណទាន' : 'Process Repayment Collection'}
              </h3>
              <button type="button" onClick={() => setActivePaymentLoan(null)} className="text-gray-400 hover:text-gray-900 p-1 rounded bg-slate-50">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 font-medium">{lang === 'KH' ? 'អ្នកត្រូវបង់ប្រាក់' : 'Borrower Partner'}</span>
                <div className="font-bold text-slate-800 text-sm mt-0.5">{activePaymentLoan.customerName}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-400 font-medium">{lang === 'KH' ? 'លេខលំដាប់ត្រូវបង់' : 'Installment No.'}</span>
                  <div className="font-bold text-slate-800 font-mono mt-0.5">#{paymentInstallmentNo}</div>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">{t('paymentMethod')}</span>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-50 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:bg-white mt-0.5 font-bold"
                  >
                    <option value="Cash">Cash / សាច់ប្រាក់</option>
                    <option value="ABA">ABA Bank</option>
                    <option value="ACLEDA">ACLEDA</option>
                    <option value="KHQR">KHQR Pay</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'KH' ? 'ទឹកប្រាក់បានទទួលទូទាត់ (USD) *' : 'Collection Amount Received (USD) *'}</label>
                <input 
                  type="number" required step="0.01" min={0.1}
                  value={paymentAmount} onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-sans font-black text-emerald-800"
                />
              </div>
            </div>

            <div className="flex justify-end items-center space-x-2 pt-4 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => setActivePaymentLoan(null)} 
                className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                {t('cancel')}
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
              >
                {lang === 'KH' ? 'កត់ត្រាទូទាត់រួច' : 'Confirm Collection'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
