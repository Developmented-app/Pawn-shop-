import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Search, 
  Plus, 
  Layers, 
  CheckCircle2, 
  X, 
  Calendar, 
  DollarSign, 
  Tag, 
  AlertCircle 
} from 'lucide-react';
import { InstallmentContract, Customer, Language, InstallmentScheduleItem } from '../types';

interface InstallmentsViewProps {
  installments: InstallmentContract[];
  customers: Customer[];
  lang: Language;
  t: (key: string) => string;
  onCreateInstallment: (contract: InstallmentContract) => void;
  onPayInstallmentItem: (contractId: string, monthNo: number, amountPaid: number) => void;
}

export default function InstallmentsView({
  installments,
  customers,
  lang,
  t,
  onCreateInstallment,
  onPayInstallmentItem
}: InstallmentsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedContractDetails, setSelectedContractDetails] = useState<InstallmentContract | null>(null);

  // Form states
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formProductName, setFormProductName] = useState('');
  const [formProductPrice, setFormProductPrice] = useState(0);
  const [formDownPayment, setFormDownPayment] = useState(0);
  const [formInterestRate, setFormInterestRate] = useState(1.2); // 1.2% monthly finance fee
  const [formTermMonths, setFormTermMonths] = useState(6);
  const [formStartDate, setFormStartDate] = useState('2026-06-06');

  // Search filter
  const filteredInstallments = useMemo(() => {
    if (!searchTerm.trim()) return installments;
    const term = searchTerm.toLowerCase();
    return installments.filter(i => 
      i.contractNo.toLowerCase().includes(term) ||
      i.customerName.toLowerCase().includes(term) ||
      i.productName.toLowerCase().includes(term)
    );
  }, [installments, searchTerm]);

  // Open add dialog
  const handleOpenAdd = () => {
    if (customers.length > 0) {
      setFormCustomerId(customers[0].id);
    }
    setFormProductName('');
    setFormProductPrice(1000);
    setFormDownPayment(200);
    setFormInterestRate(1.2);
    setFormTermMonths(6);
    setFormStartDate('2026-06-06');
    setIsAddOpen(true);
  };

  // Submit Add Installment
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerId || !formProductName.trim() || formProductPrice <= 0) return;

    const matchedCust = customers.find(c => c.id === formCustomerId);
    if (!matchedCust) return;

    const remainingBalance = formProductPrice - formDownPayment;
    if (remainingBalance < 0) {
      alert(lang === 'KH' ? 'ប្រាក់កក់មិនអាចធំជាងតម្លៃទំនិញទេ!' : 'Down payment cannot exceed product price!');
      return;
    }

    // Amortization installment monthly calculation
    const monthlyPrincipal = remainingBalance / formTermMonths;
    const monthlyInterest = remainingBalance * (formInterestRate / 100);
    const monthlyPayment = parseFloat((monthlyPrincipal + monthlyInterest).toFixed(2));

    const schedule: InstallmentScheduleItem[] = [];
    const baseDate = new Date(formStartDate);

    for (let m = 1; m <= formTermMonths; m++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(baseDate.getMonth() + m);

      schedule.push({
        monthNo: m,
        dueDate: dueDate.toISOString().split('T')[0],
        amountDue: monthlyPayment,
        paidAmount: 0,
        status: 'Pending'
      });
    }

    const nextId = `INS-300${installments.length + 1}`;
    const contractNo = `INS-10${installments.length + 1}`;

    const newContract: InstallmentContract = {
      id: nextId,
      contractNo,
      customerId: formCustomerId,
      customerName: matchedCust.fullName,
      productName: formProductName,
      productPrice: formProductPrice,
      downPayment: formDownPayment,
      remainingBalance,
      interestRate: formInterestRate,
      termMonths: formTermMonths,
      monthlyPayment,
      startDate: formStartDate,
      status: 'Active',
      schedule
    };

    onCreateInstallment(newContract);
    setIsAddOpen(false);
  };

  const handlePayMonth = (c: InstallmentContract, item: InstallmentScheduleItem) => {
    if (confirm(lang === 'KH'
      ? `តើចង់កត់ត្រាការបង់រំលស់ខែទី ${item.monthNo} ចំនួន $${item.amountDue} សម្រាប់ផលិតផល ${c.productName} មែនទេ?`
      : `Confirm receipt of $${item.amountDue} for installment month ${item.monthNo} (${c.productName})?`)) {
      onPayInstallmentItem(c.id, item.monthNo, item.amountDue);
      setSelectedContractDetails(null); // Close or refresh active details drawer
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calculator className="w-5.5 h-5.5 text-indigo-500" />
            <span>{t('navInstallments')}</span>
          </h2>
          <p className="text-xs text-slate-500">{lang === 'KH' ? 'ទិញទំនិញបង់រំលស់ គ្រឿងអេឡិចត្រូនិច ទូរស័ព្ទ និងម៉ូតូដែលមានកិច្ចសន្យា' : 'Process client hire purchases with partial down payments, recurring monthly interest, and electronic amortization tracking'}</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl shadow-xs hover:shadow-md font-sans text-sm font-bold transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'KH' ? 'បង្កើតសេវារំលស់ថ្មី' : 'New Amortization Plan'}</span>
        </button>
      </div>

      {/* Search Input Filter */}
      <div className="relative">
        <input 
          type="text"
          placeholder={lang === 'KH' ? 'ស្វែងរកលេខកិច្ចសន្យារំលស់ ឈ្មោះផលិតផល ឬអតិថិជន...' : 'Search financed contracts, products, debtor names...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-600 shadow-2xs font-sans"
        />
        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
      </div>

      {/* Cards list */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredInstallments.map((i) => (
          <div key={i.id} className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded select-all">
                    {i.contractNo}
                  </span>
                  <h4 className="font-extrabold text-slate-900 tracking-tight text-base mt-1.5">
                    {i.productName}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">{lang === 'KH' ? 'អតិថិជន' : 'Debtor'}: <span className="font-semibold text-slate-700">{i.customerName}</span></p>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
                  i.status === 'Active' ? 'bg-indigo-100 text-[#4f46e5]' :
                  i.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-rose-100 text-rose-800 animate-pulse'
                }`}>
                  {i.status}
                </span>
              </div>

              {/* Installment cost boxes */}
              <div className="space-y-1.5 text-xs text-gray-600 pt-1 border-t border-gray-50/50">
                <div className="flex justify-between">
                  <span>{lang === 'KH' ? 'តម្លៃទំនិញដើម' : 'Market Price'}</span>
                  <span className="font-bold text-slate-800">${i.productPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>{lang === 'KH' ? 'ប្រាក់កក់មុន (Down Payment)' : 'Deposit Credit'}</span>
                  <span className="font-semibold text-slate-700">${i.downPayment}</span>
                </div>
                <div className="flex justify-between">
                  <span>{lang === 'KH' ? 'ប្រាក់ត្រូវបង់ប្រចាំខែ' : 'Monthly Retainer'}</span>
                  <span className="font-extrabold text-indigo-600 text-sm font-mono">${i.monthlyPayment}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-50 mt-4">
              <button
                onClick={() => setSelectedContractDetails(i)}
                className="flex-1 inline-flex items-center justify-center gap-1 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-lg text-xs transition-colors"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>{lang === 'KH' ? 'ពិនិត្យខែបង់រំលស់' : 'Amortization Plan'}</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* --- ADD NEW AMORTIZATION FORM --- */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto w-full select-none">
          <form onSubmit={handleAddSubmit} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-bold text-slate-900 text-lg">
                {lang === 'KH' ? 'សរសើរកិច្ចសន្យាបង់រំលស់ថ្មី' : 'Structure Product Installment'}
              </h3>
              <button type="button" onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-gray-900 p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'KH' ? 'ជ្រើសរើសអតិថិជន *' : 'Select Customer Debtor *'}</label>
                <select 
                  value={formCustomerId} onChange={(e) => setFormCustomerId(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.id} — {c.fullName} ({c.phoneNumber})</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('productName')} *</label>
                <input 
                  type="text" required placeholder="Honda Dream C125, iPhone 16 Pro Max, etc."
                  value={formProductName} onChange={(e) => setFormProductName(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('productPrice')} (USD) *</label>
                <input 
                  type="number" required min={1}
                  value={formProductPrice} onChange={(e) => setFormProductPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('downPayment')} (USD) *</label>
                <input 
                  type="number" required min={0}
                  value={formDownPayment} onChange={(e) => setFormDownPayment(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'KH' ? 'រយៈពេលរំលស់ (ជាខែ) *' : 'Amortization Term (Months) *'}</label>
                <input 
                  type="number" required min={1} max={60}
                  value={formTermMonths} onChange={(e) => setFormTermMonths(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'KH' ? 'អត្រាការប្រាក់រំលស់ (%/ខែ) *' : 'Down Monthly Interest Rate (%) *'}</label>
                <input 
                  type="number" required step="0.05"
                  value={formInterestRate} onChange={(e) => setFormInterestRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                />
              </div>

              <div className="space-y-1 font-mono col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('startDate')}</label>
                <input 
                  type="date"
                  value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end items-center space-x-2 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700">
                {t('cancel')}
              </button>
              <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-lg text-sm shadow-xs transition-colors">
                {t('save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- INSTALLMENT PLAN CALENDAR SCHEDULE DRAWER --- */}
      {selectedContractDetails && (
        <div className="fixed inset-y-0 right-0 max-w-xl w-full bg-white shadow-2xl border-l border-gray-205 z-50 flex flex-col justify-between animate-slideIn select-none">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-900 text-white">
            <div>
              <h4 className="font-extrabold tracking-tight text-white mb-0.5">{selectedContractDetails.productName}</h4>
              <p className="text-xs text-indigo-100 font-mono">{lang === 'KH' ? 'លេខកិច្ចសន្យារំលស់' : 'Finance ID'}: {selectedContractDetails.contractNo} | Clientele: {selectedContractDetails.customerName}</p>
            </div>
            <button 
              onClick={() => setSelectedContractDetails(null)} 
              className="text-indigo-100 hover:text-white p-2 rounded-lg bg-indigo-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <h5 className="font-black text-slate-800 text-sm">{lang === 'KH' ? 'តារាងជុំសងប្រចាំខែ' : 'Amortization Plan Logs'}</h5>
            
            <div className="divide-y divide-gray-100">
              {selectedContractDetails.schedule.map((item, index) => (
                <div key={index} className="py-3.5 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-5 h-5 bg-indigo-50 font-black font-mono text-indigo-600 rounded-full flex items-center justify-center text-[10px]">
                        {item.monthNo}
                      </span>
                      <span className="font-bold text-slate-800 font-mono flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" /> {new Date(item.dueDate).toLocaleDateString()}
                      </span>
                      <span className={`px-2 py-0.5 font-bold uppercase rounded text-[9px] ${
                        item.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'Late' ? 'bg-rose-100 text-rose-800 animate-pulse' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="font-extrabold text-slate-900 font-mono text-sm">${item.amountDue}</span>
                    {item.status !== 'Paid' && (
                      <button
                        type="button"
                        onClick={() => handlePayMonth(selectedContractDetails, item)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-[11px] font-sans"
                      >
                        {t('pay')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 bg-slate-50 flex justify-end">
            <button 
              onClick={() => setSelectedContractDetails(null)}
              className="px-5 py-2.5 bg-indigo-900 text-white rounded-xl text-xs font-bold font-sans"
            >
              {lang === 'KH' ? 'បិទតារាងរំលស់' : 'Dismiss Calendars'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
