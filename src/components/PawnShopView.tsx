import React, { useState, useMemo } from 'react';
import { 
  Tag, 
  Search, 
  Plus, 
  Layers, 
  Printer, 
  Calendar, 
  DollarSign, 
  RefreshCcw, 
  ShieldAlert, 
  X, 
  Lock, 
  UserCheck, 
  Key, 
  BadgeAlert,
  Inbox,
  FolderSync
} from 'lucide-react';
import { PawnContract, Customer, Language, PawnItemCategory, PawnStatus, PaymentReceipt } from '../types';
import { Barcode, CustomQRCode, KHQRBox } from './BarcodeQR';

interface PawnShopViewProps {
  pawnContracts: PawnContract[];
  customers: Customer[];
  lang: Language;
  t: (key: string) => string;
  onCreatePawnContract: (contract: PawnContract) => void;
  onRenewPawnContract: (contractId: string, interestPaid: number, collector: string) => void;
  onRedeemPawnContract: (contractId: string, redeemPaid: number, collector: string) => void;
  onAuctionPawnContract: (contractId: string) => void;
  onExtendPawnContract: (contractId: string, days: number) => void;
}

export default function PawnShopView({
  pawnContracts,
  customers,
  lang,
  t,
  onCreatePawnContract,
  onRenewPawnContract,
  onRedeemPawnContract,
  onAuctionPawnContract,
  onExtendPawnContract
}: PawnShopViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | PawnStatus>('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedReceiptContract, setSelectedReceiptContract] = useState<PawnContract | null>(null);

  // Form states
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formItemName, setFormItemName] = useState('');
  const [formCategory, setFormCategory] = useState<PawnItemCategory>('Gold');
  const [formBrand, setFormBrand] = useState('');
  const [formSerial, setFormSerial] = useState('');
  const [formEstimatedVal, setFormEstimatedVal] = useState(0);
  const [formLoanAmount, setFormLoanAmount] = useState(0);
  const [formInterestRate, setFormInterestRate] = useState(3.0);
  const [formPawnDate, setFormPawnDate] = useState('2026-06-06');
  const [formExpiryDate, setFormExpiryDate] = useState('2026-10-06');
  const [formLocation, setFormLocation] = useState('Safe Drawer A');

  // Search filter
  const filteredContracts = useMemo(() => {
    let list = pawnContracts;
    
    // Status Filter
    if (activeTab !== 'All') {
      list = list.filter(c => c.status === activeTab);
    }
    
    // Search Term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(c => 
        c.contractNo.toLowerCase().includes(term) ||
        c.customerName.toLowerCase().includes(term) ||
        c.itemName.toLowerCase().includes(term) ||
        c.serialNumber.toLowerCase().includes(term)
      );
    }
    return list;
  }, [pawnContracts, activeTab, searchTerm]);

  // Open Add Form
  const handleOpenAdd = () => {
    if (customers.length > 0) {
      setFormCustomerId(customers[0].id);
    }
    setFormItemName('');
    setFormCategory('Gold');
    setFormBrand('');
    setFormSerial('');
    setFormEstimatedVal(0);
    setFormLoanAmount(0);
    setFormInterestRate(3.0);
    setFormPawnDate('2026-06-06');
    setFormExpiryDate('2026-10-06');
    setFormLocation('Vault Box B-3');
    setIsAddOpen(true);
  };

  // Submit Add Pawn
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formItemName.trim() || !formCustomerId || formLoanAmount <= 0) return;

    const matchedCust = customers.find(c => c.id === formCustomerId);
    if (!matchedCust) return;

    const nextId = `PAWN-${1000 + pawnContracts.length + 1}`;
    const contractNo = `P-${2000 + pawnContracts.length + 1}`;

    const newContract: PawnContract = {
      id: nextId,
      contractNo,
      customerId: formCustomerId,
      customerName: matchedCust.fullName,
      itemName: formItemName,
      category: formCategory,
      brand: formBrand,
      serialNumber: formSerial,
      estimatedValue: formEstimatedVal,
      loanAmount: formLoanAmount,
      interestRate: formInterestRate,
      pawnDate: formPawnDate,
      expiryDate: formExpiryDate,
      status: 'Active',
      storageLocation: formLocation,
      extensionCount: 0
    };

    onCreatePawnContract(newContract);
    setIsAddOpen(false);
  };

  // Trigger Action utilities
  const handleRenew = (c: PawnContract) => {
    const interest = parseFloat(((c.loanAmount * (c.interestRate / 100))).toFixed(2));
    if (confirm(lang === 'KH' 
      ? `តើអ្នកចង់ទទួលការប្រាក់ចំនួន $${interest} ដើម្បីបន្តកិច្ចសន្យាបញ្ចាំ ${c.contractNo} មែនទេ? (ប្រព័ន្ធនិងពន្យារពេល ៣០ ថ្ងៃ)`
      : `Complete pawn interest payment of $${interest} and auto-extend contract ${c.contractNo} expiry date by 30 days?`)) {
      onRenewPawnContract(c.id, interest, 'Chanthou Sopheap');
    }
  };

  const handleRedeem = (c: PawnContract) => {
    const interest = parseFloat(((c.loanAmount * (c.interestRate / 100))).toFixed(2));
    const totalRedeem = c.loanAmount + interest;
    
    if (confirm(lang === 'KH'
      ? `តើអតិថិជនបានលោះទំនិញដើមទុន $${c.loanAmount} + ការប្រាក់បង្គរ $${interest} សរុបចំនួន $${totalRedeem} រួចហើយមែនទេ? (ប្រព័ន្ធនិងបញ្ចេញទំនិញពីឃ្លាំង)`
      : `Process total redemption of $${totalRedeem} (Principal: $${c.loanAmount} + Interest: $${interest}) for contract ${c.contractNo}? This will mark item released from Vault.`)) {
      onRedeemPawnContract(c.id, totalRedeem, 'Chanthou Sopheap');
    }
  };

  const handleAuction = (c: PawnContract) => {
    if (confirm(lang === 'KH'
      ? `តើអ្នកចង់ផ្លាស់ប្តូរគ្រឿងបញ្ចាំ ${c.contractNo} ទៅជាស្ថានភាពលក់ឡៃឡុងមែនទេ?`
      : `Are you sure you want to transfer pawned item under contract ${c.contractNo} to Auction Status?`)) {
      onAuctionPawnContract(c.id);
    }
  };

  const handleExtend = (c: PawnContract) => {
    const days = parseInt(prompt(lang === 'KH' ? 'បញ្ចូលចំនួនថ្ងៃពន្យារបន្ថែម (ឧ. 15, 30, 60):' : 'Enter number of days for contract extension (e.g. 15, 30, 45):') || '0');
    if (days > 0) {
      onExtendPawnContract(c.id, days);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5.5 h-5.5 text-blue-600" />
            <span>{t('navPawnShop')}</span>
          </h2>
          <p className="text-xs text-slate-500">{lang === 'KH' ? 'បញ្ចាំគ្រឿងអលង្ការ មាស ប្រាក់ ទូរស័ព្ទ កុំព្យូទ័រ ម៉ូតូ និងសរសេរវិក្កយបត្រ' : 'Process gold collateral, electronics, motor vehicle deposits with custom interest amortizations'}</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-750 text-white rounded-xl shadow-xs font-sans text-sm font-bold transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'KH' ? 'បង្កើតកិច្ចសន្យាបញ្ចាំ' : 'New Pawn Contract'}</span>
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
        {(['All', 'Active', 'Extended', 'Expired', 'Redeemed', 'Auction'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition-all ${
              activeTab === tab 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            {tab === 'All' ? (lang === 'KH' ? 'ទាំងអស់' : 'All') : tab}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input 
          type="text"
          placeholder={lang === 'KH' ? 'ស្វែងរកលេខកិច្ចសន្យា ឈ្មោះអតិថិជន ឬប្រភេទគ្រឿងបញ្ចាំ...' : 'Search pawn ID, client names, serial numbers...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-250 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs font-sans text-slate-800"
        />
        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
      </div>

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredContracts.map((p) => {
          const interestAmt = parseFloat(((p.loanAmount * (p.interestRate / 100))).toFixed(2));
          return (
            <div key={p.id} className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between">
              
              {/* Header Box */}
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] font-black font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded select-all">
                      {p.contractNo}
                    </span>
                    <h4 className="font-extrabold text-slate-900 tracking-tight text-base mt-1 text-ellipsis overflow-hidden">
                      {p.itemName}
                    </h4>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md ${
                    p.status === 'Active' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                    p.status === 'Extended' ? 'bg-slate-100 text-slate-850 border border-slate-350' :
                    p.status === 'Expired' ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' :
                    p.status === 'Redeemed' ? 'bg-slate-900 text-white' :
                    'bg-slate-50 text-slate-600 border border-slate-200'
                  }`}>
                    {p.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 border-t border-gray-50 pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">{t('fullName')}</span>
                    <span className="font-bold text-slate-800">{p.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">{t('category')}</span>
                    <span className="font-bold text-slate-800">{t(p.category)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">{t('serialNo')}</span>
                    <span className="font-mono text-slate-800 font-sm">{p.serialNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">{lang === 'KH' ? 'ទីតាំងប្រអប់' : 'Vault Location'}</span>
                    <span className="font-medium text-slate-700 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-600" /> {p.storageLocation}
                    </span>
                  </div>
                </div>

                {/* Micro Finances Breakdown */}
                <div className="my-4 bg-slate-50 p-3 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-gray-400 font-sans">{lang === 'KH' ? 'ប្រាក់បញ្ចេញ' : 'Disbursed Amt'}</div>
                    <div className="font-black text-slate-900 text-sm mt-0.5">${p.loanAmount}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 font-sans">{lang === 'KH' ? 'ការប្រាក់ (%/ខែ)' : 'Interest/mo'}</div>
                    <div className="font-black text-indigo-600 text-sm mt-0.5">
                      ${interestAmt} <span className="text-[10px] font-normal text-gray-400">({p.interestRate}%)</span>
                    </div>
                  </div>
                  <div className="col-span-2 border-t border-slate-250 pt-2 flex justify-between text-[11px] font-semibold text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(p.expiryDate).toLocaleDateString()}
                    </span>
                    <span>{p.extensionCount > 0 ? `${p.extensionCount} ${lang === 'KH' ? 'ដងពន្យារ' : 'extensions'}` : ''}</span>
                  </div>
                </div>
              </div>

              {/* Pawns Interactive Panel Controls */}
              <div className="space-y-2 border-t border-gray-50 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  {p.status !== 'Redeemed' && p.status !== 'Auction' && (
                    <>
                      <button 
                        onClick={() => handleRenew(p)}
                        className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] font-bold rounded-lg text-xs transition-colors"
                      >
                        <RefreshCcw className="w-3 h-3" />
                        <span>{t('renew')}</span>
                      </button>
                      <button 
                        onClick={() => handleRedeem(p)}
                        className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs transition-colors"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>{t('redeem')}</span>
                      </button>
                    </>
                  )}
                </div>

                <div className="flex gap-2 items-center">
                  <button 
                    onClick={() => setSelectedReceiptContract(p)}
                    className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-semibold rounded-lg text-xs transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{t('print')}</span>
                  </button>

                  {p.status !== 'Redeemed' && p.status !== 'Auction' && (
                    <>
                      <button 
                        onClick={() => handleExtend(p)}
                        className="p-1.5 border border-slate-200 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg"
                        title={t('extend')}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleAuction(p)}
                        className="p-1.5 border border-rose-200 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                        title={t('auction')}
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* --- CREATE NEW CONTRACT DIALOG --- */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form onSubmit={handleAddSubmit} className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-bold text-slate-900 text-lg">
                {lang === 'KH' ? 'បង្កើតកិច្ចសន្យាបញ្ចាំថ្មី' : 'Create Pawn Agreement'}
              </h3>
              <button type="button" onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-gray-900 p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'KH' ? 'ជ្រើសរើសអតិថិជន *' : 'Select Customer *'}</label>
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
                <label className="text-xs font-bold text-gray-500 uppercase">{t('category')}</label>
                <select 
                  value={formCategory} onChange={(e) => setFormCategory(e.target.value as PawnItemCategory)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white"
                >
                  <option value="Gold">Gold / មាស</option>
                  <option value="Silver">Silver / ប្រាក់</option>
                  <option value="Phone">Smartphones / ទូរស័ព្ទ</option>
                  <option value="Laptop">Comps & Laptops</option>
                  <option value="Motorbike">Motorbike / ម៉ូតូ</option>
                  <option value="Car">Car / ឡាន</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('itemName')} *</label>
                <input 
                  type="text" required placeholder="iPhone 15, Honda Dream, etc."
                  value={formItemName} onChange={(e) => setFormItemName(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('brand')}</label>
                <input 
                  type="text" placeholder="Apple, Honda, custom..."
                  value={formBrand} onChange={(e) => setFormBrand(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('serialNo')}</label>
                <input 
                  type="text" placeholder="IMEI or Chassis Chassis No."
                  value={formSerial} onChange={(e) => setFormSerial(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('estimatedValue')} (USD) *</label>
                <input 
                  type="number" required min={0}
                  value={formEstimatedVal} onChange={(e) => setFormEstimatedVal(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('loanAmount')} (USD) *</label>
                <input 
                  type="number" required min={1}
                  value={formLoanAmount} onChange={(e) => setFormLoanAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('interestRate')} *</label>
                <input 
                  type="number" required step="0.1" min={0}
                  value={formInterestRate} onChange={(e) => setFormInterestRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1 font-mono">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('pawnDate')}</label>
                <input 
                  type="date"
                  value={formPawnDate} onChange={(e) => setFormPawnDate(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1 font-mono">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('expiryDate')}</label>
                <input 
                  type="date"
                  value={formExpiryDate} onChange={(e) => setFormExpiryDate(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'KH' ? 'ទីតាំងឧបករណ៍' : 'Storage Box Spot'}</label>
                <input 
                  type="text"
                  value={formLocation} onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white"
                  placeholder="Drawer Spot A"
                />
              </div>
            </div>

            <div className="flex justify-end items-center space-x-2 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700">
                {t('cancel')}
              </button>
              <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-sm shadow-xs transition-colors">
                {t('save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- RECEIPT MODAL PRINT PREVIEW SIMULATOR --- */}
      {selectedReceiptContract && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col md:flex-row gap-6 relative">
            <button 
              type="button" 
              onClick={() => setSelectedReceiptContract(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left Col: Khmer Styled Receipt Invoice (Standard 80mm style wrapped beautifully) */}
            <div id="pawn-receipt-invoice" className="flex-1 bg-slate-50 p-6 rounded-xl border border-gray-200 max-h-[80vh] overflow-y-auto font-sans text-xs text-slate-800 space-y-4">
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-300">
                <div className="text-2xl">🦁</div>
                <h4 className="font-sans font-black text-sm text-slate-900">គ្រឹះស្ថានបញ្ចាំ រៀម ហ្គោល</h4>
                <p className="text-[10px] text-gray-500 font-medium">RIEM PAWN & LOAN CAPITAL</p>
                <p className="text-[9px] text-gray-400 max-w-[250px] mx-auto">ផ្ទះលេខ ១២A ផ្លូវ ២៧១ សង្កាត់បឹងកេងកងទី ៣ ខណ្ឌបឹងកេងកង ភ្នំពេញ</p>
                <p className="text-[9px] text-gray-400 font-mono">TEL: 012 888 999</p>
              </div>

              <div className="text-center font-bold uppercase text-slate-900 tracking-wider">
                កិច្ចសន្យា និងបង្កាន់ដៃបញ្ចាំ <br />
                <span className="text-[10px] text-gray-400 font-medium">COLLATERAL DEPOSIT & CONTRACT</span>
              </div>

              {/* Items mapping */}
              <div className="space-y-1.5 border-b border-dashed border-gray-300 pb-3 font-medium text-[11px]">
                <div className="flex justify-between">
                  <span>លេខកិច្ចសន្យា / Contract No:</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedReceiptContract.contractNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>អតិថិជន / Customer:</span>
                  <span className="font-bold text-slate-900">{selectedReceiptContract.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>លេខសម្គាល់ / Client ID:</span>
                  <span className="font-mono text-slate-900">{selectedReceiptContract.customerId}</span>
                </div>
                <div className="flex justify-between">
                  <span>ទំនិញបញ្ចាំ / Pledge Item:</span>
                  <span className="font-bold text-slate-900">{selectedReceiptContract.itemName}</span>
                </div>
                <div className="flex justify-between">
                  <span>ស៊េរី/លេខម៉ាស៊ីន / Serial No:</span>
                  <span className="font-mono">{selectedReceiptContract.serialNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>ទីតាំងរក្សាទុក / Safe Box:</span>
                  <span className="font-bold text-slate-950">{selectedReceiptContract.storageLocation}</span>
                </div>
              </div>

              {/* Monetary Breakdown */}
              <div className="space-y-1 text-[11px] border-b border-dashed border-gray-300 pb-3">
                <div className="flex justify-between font-bold">
                  <span>តម្លៃប៉ាន់ស្មាន / Market Valuation:</span>
                  <span className="text-slate-900">${selectedReceiptContract.estimatedValue}</span>
                </div>
                <div className="flex justify-between font-extrabold text-blue-700 text-sm">
                  <span>ទឹកប្រាក់បញ្ចេញ / Disbursed:</span>
                  <span>${selectedReceiptContract.loanAmount}.00</span>
                </div>
                <div className="flex justify-between font-bold text-gray-700">
                  <span>អត្រាការប្រាក់ / Monthly Interest:</span>
                  <span>{selectedReceiptContract.interestRate}% / ខែ</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>ជាលុយរៀលជាមធ្យម / Equivalent KHR:</span>
                  <span className="font-mono font-bold">៛{(selectedReceiptContract.loanAmount * 4100).toLocaleString()}</span>
                </div>
              </div>

              {/* Calendar limits */}
              <div className="space-y-1.5 p-2 bg-white rounded border border-gray-250 font-medium text-[10px]">
                <div className="flex justify-between">
                  <span>ថ្ងៃបញ្ចាំ / Pledge Date:</span>
                  <span className="font-mono">{new Date(selectedReceiptContract.pawnDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>ថ្ងៃផុតកំណត់ / Maturity Expiry:</span>
                  <span className="font-mono font-bold">{new Date(selectedReceiptContract.expiryDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Barcode vector asset */}
              <div className="flex justify-center pt-3 select-none">
                <Barcode value={selectedReceiptContract.contractNo} height={40} width={180} />
              </div>

              {/* Khmer rules disclaimer text */}
              <div className="text-[8px] text-gray-400 text-center leading-normal pt-2 border-t border-gray-200">
                គ្រឹះស្ថានរក្សាសិទ្ធិក្នុងការលក់ឡៃឡុងចំពោះទំនិញទាំងឡាយដែលយឺតយ៉ាវហួសកាលកំណត់លើសពី ១៥ថ្ងៃ ដោយមិនមានការបន្តការប្រាក់។ <br />
                <span className="italic block mt-1">Please keep this contract safe. Collaterals are kept under dual key locks.</span>
              </div>
            </div>

            {/* Right Col: Companion Scan KHQR and Printing Option */}
            <div className="flex-1 flex flex-col justify-between items-center py-4 text-center space-y-4">
              <div>
                <h4 className="font-bold text-slate-800 text-base">{lang === 'KH' ? 'ស្កេនទូទាត់ការបញ្ចាំ' : 'Scan to pay interest / redeem'}</h4>
                <p className="text-xs text-gray-500 mt-1">{lang === 'KH' ? 'ការប្រាក់ប្រចាំខែដើម្បីបន្តកិច្ចសន្យាបញ្ចាំ' : 'Required monthly interest or total payment'}</p>
              </div>

              <KHQRBox 
                value={`00020101021230380016AbaBankCambodia0114ABA0129482745204599953038405802KH5910RIEM_PAWN6010PHNOM_PENH62140110REC-26-00046304EDCA`}
                merchantName="RIEM PAWN & LOAN"
                amount={parseFloat(((selectedReceiptContract.loanAmount * (selectedReceiptContract.interestRate / 100))).toFixed(2))}
                currency="USD"
              />

              <div className="flex gap-2 w-full">
                <button 
                  onClick={() => {
                    const printContents = document.getElementById('pawn-receipt-invoice')?.innerHTML;
                    if (printContents) {
                      const originalContents = document.body.innerHTML;
                      document.body.innerHTML = printContents;
                      window.print();
                      document.body.innerHTML = originalContents;
                      window.location.reload(); // Quick restore state from memory
                    }
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold font-sans text-sm hover:bg-slate-800 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>{lang === 'KH' ? 'បោះពុម្ពឥឡូវនេះ' : 'Print Invoice'}</span>
                </button>
                <button 
                  onClick={() => setSelectedReceiptContract(null)}
                  className="px-4 py-2.5 border border-gray-200 text-slate-700 hover:bg-slate-100 font-bold rounded-xl text-sm transition-colors"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
