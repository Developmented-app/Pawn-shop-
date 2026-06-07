import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, FolderOpen, X, Phone, CreditCard, User, Tag, Calendar, Briefcase, Users, Landmark, AlertCircle } from 'lucide-react';
import { Customer, PawnContract, Loan, InstallmentContract, PaymentReceipt, Language } from '../types';

interface CustomerViewProps {
  customers: Customer[];
  pawnContracts: PawnContract[];
  loans: Loan[];
  installments: InstallmentContract[];
  payments: PaymentReceipt[];
  lang: Language;
  t: (key: string) => string;
  onAddCustomer: (cust: Customer) => void;
  onEditCustomer: (cust: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

export default function CustomerView({
  customers,
  pawnContracts,
  loans,
  installments,
  payments,
  lang,
  t,
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer
}: CustomerViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);
  const [dossierCust, setDossierCust] = useState<Customer | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formGender, setFormGender] = useState('Male');
  const [formDob, setFormDob] = useState('1990-01-01');
  const [formNationalId, setFormNationalId] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formOccupation, setFormOccupation] = useState('');
  const [formEmergencyName, setFormEmergencyName] = useState('');
  const [formEmergencyPhone, setFormEmergencyPhone] = useState('');
  const [formEmergencyRelation, setFormEmergencyRelation] = useState('');
  const [formPhoto, setFormPhoto] = useState('');

  // 1. Search Filter
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;
    const term = searchTerm.toLowerCase();
    return customers.filter(c => 
      c.fullName.toLowerCase().includes(term) ||
      c.id.toLowerCase().includes(term) ||
      c.phoneNumber.includes(term) ||
      c.nationalId.includes(term)
    );
  }, [customers, searchTerm]);

  // Open add modal
  const handleOpenAdd = () => {
    setFormName('');
    setFormGender('Male');
    setFormDob('1990-01-01');
    setFormNationalId('');
    setFormPhone('');
    setFormAddress('');
    setFormOccupation('');
    setFormEmergencyName('');
    setFormEmergencyPhone('');
    setFormEmergencyRelation('');
    setFormPhoto('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150');
    setIsAddOpen(true);
  };

  // Submit Add
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;
    
    const newId = `CUST-${String(customers.length + 1).padStart(4, '0')}`;
    const newCust: Customer = {
      id: newId,
      fullName: formName,
      gender: formGender,
      dob: formDob,
      nationalId: formNationalId,
      phoneNumber: formPhone,
      address: formAddress,
      occupation: formOccupation,
      emergencyContact: {
        name: formEmergencyName,
        phone: formEmergencyPhone,
        relation: formEmergencyRelation
      },
      photo: formPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      createdAt: new Date().toISOString()
    };
    
    onAddCustomer(newCust);
    setIsAddOpen(false);
  };

  // Open edit modal
  const handleOpenEdit = (c: Customer) => {
    setSelectedCust(c);
    setFormName(c.fullName);
    setFormGender(c.gender);
    setFormDob(c.dob);
    setFormNationalId(c.nationalId);
    setFormPhone(c.phoneNumber);
    setFormAddress(c.address);
    setFormOccupation(c.occupation);
    setFormEmergencyName(c.emergencyContact.name);
    setFormEmergencyPhone(c.emergencyContact.phone);
    setFormEmergencyRelation(c.emergencyContact.relation);
    setFormPhoto(c.photo);
    setIsEditOpen(true);
  };

  // Submit Edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCust || !formName.trim() || !formPhone.trim()) return;

    const updatedCust: Customer = {
      ...selectedCust,
      fullName: formName,
      gender: formGender,
      dob: formDob,
      nationalId: formNationalId,
      phoneNumber: formPhone,
      address: formAddress,
      occupation: formOccupation,
      emergencyContact: {
        name: formEmergencyName,
        phone: formEmergencyPhone,
        relation: formEmergencyRelation
      },
      photo: formPhoto
    };

    onEditCustomer(updatedCust);
    setIsEditOpen(false);
  };

  // Open dossier drawer
  const handleOpenDossier = (c: Customer) => {
    setDossierCust(c);
  };

  // Filter calculations for dossier
  const dossierData = useMemo(() => {
    if (!dossierCust) return null;
    const clientPawns = pawnContracts.filter(p => p.customerId === dossierCust.id);
    const clientLoans = loans.filter(l => l.customerId === dossierCust.id);
    const clientInstallments = installments.filter(i => i.customerId === dossierCust.id);
    const clientPayments = payments.filter(p => p.customerId === dossierCust.id);

    return {
      pawns: clientPawns,
      loans: clientLoans,
      installments: clientInstallments,
      payments: clientPayments
    };
  }, [dossierCust, pawnContracts, loans, installments, payments]);

  // Dynamic Risk Score calculation based on payments, active debt load, and punctuality
  const getCustomerRiskScore = (customerId: string) => {
    const clientPawns = pawnContracts.filter(p => p.customerId === customerId);
    const clientLoans = loans.filter(l => l.customerId === customerId);
    const clientInstallments = installments.filter(i => i.customerId === customerId);

    let totalActiveDebt = 0;
    let overdueItemsCount = 0;
    let activeAccountsCount = 0;

    // Pawns
    clientPawns.forEach(p => {
      if (p.status === 'Active' || p.status === 'Extended') {
        totalActiveDebt += p.loanAmount;
        activeAccountsCount++;
      } else if (p.status === 'Expired') {
        totalActiveDebt += p.loanAmount;
        overdueItemsCount += 2; // Expired pawns count as serious defaults
        activeAccountsCount++;
      }
    });

    // Loans
    clientLoans.forEach(l => {
      if (l.status === 'Active' || l.status === 'Overdue') {
        totalActiveDebt += l.remainingBalance;
        activeAccountsCount++;
      }
      if (l.status === 'Overdue' || l.status === 'Written Off') {
        overdueItemsCount += 3;
      }
      // Check schedule overdues
      l.schedule?.forEach(sched => {
        if (sched.status === 'Overdue') {
          overdueItemsCount++;
        }
      });
    });

    // Installments
    clientInstallments.forEach(ins => {
      if (ins.status === 'Active' || ins.status === 'Late') {
        totalActiveDebt += ins.remainingBalance;
        activeAccountsCount++;
      }
      if (ins.status === 'Late' || ins.status === 'Defaulted') {
        overdueItemsCount += 2;
      }
      ins.schedule?.forEach(sched => {
        if (sched.status === 'Late') {
          overdueItemsCount++;
        }
      });
    });

    // Base score is 100 (safest)
    // Decrement score for overdue events and debt loads
    let score = 100;
    
    // Impact of overdue events: 15 points per event
    score -= overdueItemsCount * 15;

    // Impact of debt-load ratio or general weight:
    if (totalActiveDebt > 8000) {
      score -= 30; // Very large leverage
    } else if (totalActiveDebt > 4000) {
      score -= 20;
    } else if (totalActiveDebt > 1500) {
      score -= 10;
    } else if (totalActiveDebt > 0) {
      score -= 5;
    }

    score = Math.max(5, Math.min(100, score)); // min score of 5 for extreme cases

    let level: 'A' | 'B' | 'C' | 'D' | 'F';
    let riskLabelEn: string;
    let riskLabelKh: string;
    let colorClass: string; // Tailwind class
    let borderClass: string;

    if (score >= 85) {
      level = 'A';
      riskLabelEn = 'Excellent';
      riskLabelKh = 'ល្អឥតខ្ចោះ';
      colorClass = 'bg-emerald-50 text-emerald-700';
      borderClass = 'border-emerald-200';
    } else if (score >= 70) {
      level = 'B';
      riskLabelEn = 'Good (Low)';
      riskLabelKh = 'ល្អ (ហានិភ័យទាប)';
      colorClass = 'bg-blue-50 text-blue-700';
      borderClass = 'border-blue-200';
    } else if (score >= 55) {
      level = 'C';
      riskLabelEn = 'Moderate';
      riskLabelKh = 'មធ្យម';
      colorClass = 'bg-yellow-50 text-yellow-700';
      borderClass = 'border-yellow-200';
    } else if (score >= 35) {
      level = 'D';
      riskLabelEn = 'High Risk';
      riskLabelKh = 'ហានិភ័យខ្ពស់';
      colorClass = 'bg-orange-50 text-orange-700';
      borderClass = 'border-orange-200';
    } else {
      level = 'F';
      riskLabelEn = 'Critical / Default';
      riskLabelKh = 'ធ្ងន់ធ្ងរ';
      colorClass = 'bg-red-50 text-red-700';
      borderClass = 'border-red-200';
    }

    return {
      score,
      level,
      riskLabelEn,
      riskLabelKh,
      colorClass,
      borderClass,
      totalActiveDebt,
      overdueItemsCount,
      activeAccountsCount
    };
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5.5 h-5.5 text-blue-600" />
            <span>{t('navCustomers')}</span>
          </h2>
          <p className="text-xs text-slate-500">{lang === 'KH' ? 'គ្រប់គ្រងព័ត៌មានអតិថិជន ប្រវត្តិឥណទាន និងកិច្ចសន្យាបញ្ចាំ' : 'A central repository for Cambodian customer identities, credit files, and contact rules'}</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl shadow-xs hover:bg-blue-700 hover:shadow-md font-sans text-sm font-bold transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'KH' ? 'បង្កើតអតិថិជនថ្មី' : 'Register Customer'}</span>
        </button>
      </div>

      {/* Search Input Panel */}
      <div className="relative w-full">
        <input 
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors shadow-2xs font-sans text-slate-800"
        />
        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredCustomers.map((cust) => (
          <div key={cust.id} className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between">
            <div className="flex items-start space-x-4">
              <img 
                src={cust.photo} 
                alt={cust.fullName} 
                className="w-14 h-14 rounded-xl object-cover border border-gray-200 shadow-2xs"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1.5 overflow-hidden">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                    {cust.id}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                    {cust.gender === 'Male' || cust.gender === 'ប្រុស' ? (lang === 'KH' ? 'ប្រុស' : 'Male') : (lang === 'KH' ? 'ស្រី' : 'Female')}
                  </span>
                  {(() => {
                    const risk = getCustomerRiskScore(cust.id);
                    return (
                      <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded border ${risk.colorClass} ${risk.borderClass}`}>
                        {lang === 'KH' ? risk.riskLabelKh : risk.riskLabelEn}
                      </span>
                    );
                  })()}
                </div>
                <h4 className="font-bold text-slate-900 tracking-tight text-base truncate">
                  {cust.fullName}
                </h4>
                <div className="flex items-center text-xs text-gray-500 font-medium">
                  <Phone className="w-3.5 h-3.5 mr-1 text-gray-400 shrink-0" />
                  <span className="font-mono">{cust.phoneNumber}</span>
                </div>
              </div>
            </div>

            {/* Quick Details List */}
            <div className="my-4 pt-3 border-t border-gray-50 space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">{t('nationalId')}</span>
                <span className="font-bold text-slate-800 font-mono">{cust.nationalId}</span>
              </div>
              <div className="flex justify-between items-center shrink-0">
                <span className="text-gray-400 font-medium">{t('occupation')}</span>
                <span className="font-semibold text-slate-800 truncate max-w-[150px]">{cust.occupation || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-400 font-medium">{lang === 'KH' ? 'ពិន្ទុឥណទាន (Credit Score)' : 'Credit Risk Profile'}</span>
                {(() => {
                  const risk = getCustomerRiskScore(cust.id);
                  return (
                    <div className="flex items-center space-x-1 font-sans">
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded font-mono ${
                        risk.score >= 85 ? 'bg-emerald-100 text-emerald-800' :
                        risk.score >= 70 ? 'bg-blue-100 text-blue-800' :
                        risk.score >= 55 ? 'bg-yellow-105 bg-yellow-100 text-yellow-850' :
                        risk.score >= 35 ? 'bg-orange-100 text-orange-900' :
                        'bg-red-100 text-red-900'
                      }`}>
                        {risk.score}/100
                      </span>
                      <span className="text-[10px] font-black text-slate-700">[{risk.level}]</span>
                    </div>
                  );
                })()}
              </div>
              <div className="flex justify-between items-center uppercase text-[10px] bg-slate-50 p-2 rounded border border-slate-100">
                <span className="font-bold text-slate-500">{t('emergencyContact')}:</span>
                <span className="font-bold text-slate-800 font-mono">{cust.emergencyContact.name} ({cust.emergencyContact.phone})</span>
              </div>
            </div>

            {/* Grid Footer Buttons */}
            <div className="flex items-center space-x-2 pt-2 border-t border-gray-50">
              <button 
                onClick={() => handleOpenDossier(cust)}
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>{t('customerHistory')}</span>
              </button>
              <button 
                onClick={() => handleOpenEdit(cust)}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title={t('edit')}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => {
                  if (confirm(lang === 'KH' ? 'តើអ្នកប្រាកដជាចង់លុបអតិថិជននេះមែនទេ?' : 'Are you sure you want to delete this customer record?')) {
                    onDeleteCustomer(cust.id);
                  }
                }}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title={t('delete')}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- ADD CUSTOMER DIALOG --- */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form onSubmit={handleAddSubmit} className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-bold text-slate-900 text-lg">
                {lang === 'KH' ? 'ចុះឈ្មោះអតិថិជនថ្មី' : 'Register New Customer'}
              </h3>
              <button type="button" onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-gray-900 p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('fullName')} *</label>
                <input 
                  type="text" required
                  value={formName} onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('gender')}</label>
                <select 
                  value={formGender} onChange={(e) => setFormGender(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white"
                >
                  <option value="Male">Male / ប្រុស</option>
                  <option value="Female">Female / ស្រី</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('dob')}</label>
                <input 
                  type="date"
                  value={formDob} onChange={(e) => setFormDob(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('nationalId')} *</label>
                <input 
                  type="text" required
                  value={formNationalId} onChange={(e) => setFormNationalId(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('phone')} *</label>
                <input 
                  type="text" required
                  value={formPhone} onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('occupation')}</label>
                <input 
                  type="text"
                  value={formOccupation} onChange={(e) => setFormOccupation(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'KH' ? 'តំណភ្ជាប់រូបថត (URL)' : 'Photo URL'}</label>
                <input 
                  type="text"
                  value={formPhoto} onChange={(e) => setFormPhoto(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white font-mono"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('address')}</label>
                <textarea 
                  value={formAddress} onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white min-h-[60px]"
                />
              </div>

              {/* Emergency info group */}
              <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-3">
                <div className="text-xs font-extrabold text-blue-700 tracking-wider uppercase border-b border-slate-200 pb-1 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{t('emergencyContact')}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1 col-span-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{t('emergencyName')}</label>
                    <input 
                      type="text"
                      value={formEmergencyName} onChange={(e) => setFormEmergencyName(e.target.value)}
                      className="w-full bg-white border border-gray-200 px-2.5 py-1.5 rounded text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{t('emergencyPhone')}</label>
                    <input 
                      type="text"
                      value={formEmergencyPhone} onChange={(e) => setFormEmergencyPhone(e.target.value)}
                      className="w-full bg-white border border-gray-200 px-2.5 py-1.5 rounded text-xs focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{t('emergencyRelation')}</label>
                    <input 
                      type="text"
                      value={formEmergencyRelation} onChange={(e) => setFormEmergencyRelation(e.target.value)}
                      className="w-full bg-white border border-gray-200 px-2.5 py-1.5 rounded text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center space-x-2 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700">
                {t('cancel')}
              </button>
              <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-xs hover:bg-blue-700">
                {t('save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- EDIT CUSTOMER DIALOG --- */}
      {isEditOpen && selectedCust && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form onSubmit={handleEditSubmit} className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-bold text-slate-900 text-lg">
                {t('edit')} {selectedCust.id}
              </h3>
              <button type="button" onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-900 p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('fullName')} *</label>
                <input 
                  type="text" required
                  value={formName} onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('gender')}</label>
                <select 
                  value={formGender} onChange={(e) => setFormGender(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white"
                >
                  <option value="Male">Male / ប្រុស</option>
                  <option value="Female">Female / ស្រី</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('dob')}</label>
                <input 
                  type="date"
                  value={formDob} onChange={(e) => setFormDob(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('nationalId')} *</label>
                <input 
                  type="text" required
                  value={formNationalId} onChange={(e) => setFormNationalId(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('phone')} *</label>
                <input 
                  type="text" required
                  value={formPhone} onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('occupation')}</label>
                <input 
                  type="text"
                  value={formOccupation} onChange={(e) => setFormOccupation(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'KH' ? 'តំណភ្ជាប់រូបថត (URL)' : 'Photo URL'}</label>
                <input 
                  type="text"
                  value={formPhoto} onChange={(e) => setFormPhoto(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white font-mono"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('address')}</label>
                <textarea 
                  value={formAddress} onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white min-h-[60px]"
                />
              </div>

              <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-3">
                <div className="text-xs font-extrabold text-blue-700 tracking-wider uppercase border-b border-slate-200 pb-1 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{t('emergencyContact')}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1 col-span-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{t('emergencyName')}</label>
                    <input 
                      type="text"
                      value={formEmergencyName} onChange={(e) => setFormEmergencyName(e.target.value)}
                      className="w-full bg-white border border-gray-200 px-2.5 py-1.5 rounded text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{t('emergencyPhone')}</label>
                    <input 
                      type="text"
                      value={formEmergencyPhone} onChange={(e) => setFormEmergencyPhone(e.target.value)}
                      className="w-full bg-white border border-gray-200 px-2.5 py-1.5 rounded text-xs focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{t('emergencyRelation')}</label>
                    <input 
                      type="text"
                      value={formEmergencyRelation} onChange={(e) => setFormEmergencyRelation(e.target.value)}
                      className="w-full bg-white border border-gray-200 px-2.5 py-1.5 rounded text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center space-x-2 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700">
                {t('cancel')}
              </button>
              <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-xs hover:bg-blue-700">
                {t('save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- CUSTOMER DOSSIER HISTORY IN SIDEBAR/PANEL --- */}
      {dossierCust && dossierData && (
        <div className="fixed inset-y-0 right-0 max-w-2xl w-full bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col justify-between animate-slideIn">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-900 text-white select-none">
            <div className="flex items-center space-x-3">
              <img src={dossierCust.photo} alt={dossierCust.fullName} className="w-11 h-11 rounded-lg object-cover" referrerPolicy="no-referrer" />
              <div>
                <h4 className="font-extrabold tracking-tight text-white">{dossierCust.fullName}</h4>
                <div className="text-xs text-slate-300 font-mono flex items-center gap-2 mt-0.5">
                  <span>{dossierCust.id}</span>
                  <span>|</span>
                  <span>{dossierCust.phoneNumber}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setDossierCust(null)} 
              className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            
            {/* CREDIT RISK ASSESSMENT CARD */}
            {(() => {
              const risk = getCustomerRiskScore(dossierCust.id);
              return (
                <div className="bg-slate-50 rounded-2xl border border-gray-200 p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">{lang === 'KH' ? 'របាយការណ៍វាយតម្លៃហានិភ័យឥណទាន' : 'Credit Risk Assessment'}</h5>
                      <p className="text-[10px] text-gray-400 mt-0.5">{lang === 'KH' ? 'ផ្អែកលើការបង់ប្រាក់ផ្ទាល់ និងបន្ទុកបំណុលសកម្ម' : 'Based on payment history & active leverage records'}</p>
                    </div>
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded border font-mono ${risk.colorClass} ${risk.borderClass}`}>
                      GRADE {risk.level}
                    </span>
                  </div>

                  {/* Meter bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-600">{lang === 'KH' ? 'ការបង់ប្រាក់ទាន់ពេល និងបន្ទុកបំណុល' : 'Score / Rating Index'}</span>
                      <span className="font-mono text-slate-900 font-extrabold">{risk.score} / 100</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          risk.score >= 85 ? 'bg-emerald-500' :
                          risk.score >= 70 ? 'bg-blue-500' :
                          risk.score >= 55 ? 'bg-yellow-500' :
                          risk.score >= 35 ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${risk.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Structural Assessment details */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wide">{lang === 'KH' ? 'បំណុលរួមសកម្ម' : 'Active Debt'}</span>
                      <span className="text-xs font-black text-slate-950 font-mono block mt-1">${risk.totalActiveDebt.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wide">{lang === 'KH' ? 'គណនីឥណទាន' : 'Active Accts'}</span>
                      <span className="text-xs font-black text-slate-950 font-mono block mt-1">{risk.activeAccountsCount}</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wide">{lang === 'KH' ? 'ប្រវត្តិកំហុស/យឺត' : 'Delinquencies'}</span>
                      <span className={`text-xs font-mono font-black block mt-1 ${risk.overdueItemsCount > 0 ? 'text-red-600 animate-pulse' : 'text-slate-500'}`}>
                        {risk.overdueItemsCount}
                      </span>
                    </div>
                  </div>

                  {/* Security recommendation text */}
                  <div className="text-[10px] text-slate-500 leading-normal bg-white p-2.5 rounded-lg border border-slate-250 flex items-start gap-2">
                    <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${risk.score < 55 ? 'text-red-500' : 'text-slate-400'}`} />
                    <div>
                      {risk.score >= 85 ? (
                        lang === 'KH' 
                          ? 'អតិថិជននេះមានប្រវត្តិទូទាត់ល្អឥតខ្ចោះ និងមានបន្ទុកបំណុលមានសុវត្ថិភាព។ ស្ថិតក្រោមលក្ខខណ្ឌគួរឲ្យទុកចិត្តបំផុត។' 
                          : 'This customer resides in a high-grade status with pristine payment consistency and secure amortization levels. Low credit risk.'
                      ) : risk.score >= 70 ? (
                        lang === 'KH' 
                          ? 'អតិថិជនមានគណនីសកម្ម ប៉ុន្តែរក្សាការទូទាត់ទាន់ពេលវេលាលម្អល្អ។ សមស្របសម្រាប់ការពង្រីកឥណទានកម្រិតមធ្យម។' 
                          : 'Valid active exposure managed with consistent punctuality. Highly suitable for conventional financial service requests.'
                      ) : risk.score >= 55 ? (
                        lang === 'KH' 
                          ? 'អតិថិជនមានបន្ទុកបំណុលបង្គួរ ឬមានការទូទាត់យឺតយ៉ាវស្រាលខ្លះៗ។ គួរមានការត្រួតពិនិត្យបន្ថែមមុននឹងបញ្ចេញកម្ចីថ្មី។' 
                          : 'Moderate risk indicators present. Review payment timelines and collateral coverage prior to authorizing further extensions.'
                      ) : (
                        lang === 'KH' 
                          ? 'កម្រិតហានិភ័យខ្ពស់! មានការទូទាត់ហួសកាលកំណត់ ឬបន្ទុកបំណុលហួសសមត្ថភាព។ ហាមបញ្ចេញឥណទានបន្ថែមដោយគ្មានវត្ថុបញ្ចាំរឹងមាំឡើយ។' 
                          : 'CRITICAL CREDIT RISK DETECTED. Customer has active delinquencies, expired conditions, or critical debt leverage. Exercise high compliance enforcement.'
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Pawns Record */}
            <div>
              <div className="flex items-center space-x-2 border-b border-gray-100 pb-2 mb-3">
                <Tag className="w-4 h-4 text-amber-500" />
                <h5 className="font-bold text-slate-900 text-sm">{t('navPawnShop')} ({dossierData.pawns.length})</h5>
              </div>
              {dossierData.pawns.length === 0 ? (
                <div className="text-xs text-gray-400 py-2 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> {lang === 'KH' ? 'គ្មានកំណត់ត្រាបញ្ចាំទេ' : 'No active pawn agreements'}</div>
              ) : (
                <div className="space-y-2">
                  {dossierData.pawns.map(p => (
                    <div key={p.id} className="p-3 bg-amber-50/50 rounded-lg border border-amber-100 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-slate-800">{p.itemName} ({p.category})</div>
                        <div className="text-gray-400 font-mono mt-0.5">{p.contractNo} | {lang === 'KH' ? 'ប្រាក់បញ្ចេញ' : 'Disbursed'}: <span className="font-extrabold text-slate-700">${p.loanAmount}</span></div>
                      </div>
                      <span className={`px-2 py-0.5 font-bold uppercase rounded text-[9px] ${
                        p.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 
                        p.status === 'Expired' ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>{p.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Loans Record */}
            <div>
              <div className="flex items-center space-x-2 border-b border-gray-100 pb-2 mb-3">
                <Landmark className="w-4 h-4 text-emerald-600" />
                <h5 className="font-bold text-slate-900 text-sm">{t('historyLoans')} ({dossierData.loans.length})</h5>
              </div>
              {dossierData.loans.length === 0 ? (
                <div className="text-xs text-gray-400 py-2 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> {lang === 'KH' ? 'គ្មានការកម្ចីសកម្មទេ' : 'No borrower accounts open'}</div>
              ) : (
                <div className="space-y-2">
                  {dossierData.loans.map(l => (
                    <div key={l.id} className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-slate-800 font-mono">{l.loanNo} | Principal: ${l.principalAmount}</div>
                        <div className="text-gray-400 mt-0.5 font-sans">{lang === 'KH' ? 'អត្រាការប្រាក់' : 'Rate'}: {l.interestRate}% ({l.paymentFrequency})</div>
                        <div className="text-[10px] font-bold text-emerald-700 mt-1">{lang === 'KH' ? 'ទឹកប្រាក់នៅសល់' : 'Outstanding Bal'}: ${l.remainingBalance}</div>
                      </div>
                      <span className={`px-2 py-0.5 font-bold uppercase rounded text-[9px] ${
                        l.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 
                        l.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>{l.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Installments Amortization */}
            <div>
              <div className="flex items-center space-x-2 border-b border-gray-100 pb-2 mb-3">
                <Briefcase className="w-4 h-4 text-purple-600" />
                <h5 className="font-bold text-slate-900 text-sm">{t('totalInstallments')} ({dossierData.installments.length})</h5>
              </div>
              {dossierData.installments.length === 0 ? (
                <div className="text-xs text-gray-400 py-2 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> {lang === 'KH' ? 'គ្មានសេវារំលស់ទេ' : 'No ongoing product installations'}</div>
              ) : (
                <div className="space-y-2">
                  {dossierData.installments.map(ins => (
                    <div key={ins.id} className="p-3 bg-indigo-50/30 rounded-lg border border-indigo-100 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-slate-800">{ins.productName}</div>
                        <div className="text-gray-400 font-mono mt-0.5">{ins.contractNo} | Financed: <span className="font-bold text-[#4f46e5]">${ins.remainingBalance}</span></div>
                      </div>
                      <span className="font-mono bg-indigo-50 text-[#4f46e5] font-bold px-2 py-0.5 rounded text-[10px]">${ins.monthlyPayment}/mo</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payments Log */}
            <div>
              <div className="flex items-center space-x-2 border-b border-gray-100 pb-2 mb-3">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <h5 className="font-bold text-slate-900 text-sm">{t('historyPayments')} ({dossierData.payments.length})</h5>
              </div>
              {dossierData.payments.length === 0 ? (
                <div className="text-xs text-gray-400 py-2 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> {lang === 'KH' ? 'គ្មានឯកសារទូទាត់ប្រាក់ទេ' : 'No paid receipts in this ledger'}</div>
              ) : (
                <div className="space-y-2">
                  {dossierData.payments.map(pay => (
                    <div key={pay.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-slate-800 font-mono">{pay.receiptNo} — {pay.paymentType}</div>
                        <div className="text-gray-400 mt-1 font-mono">{new Date(pay.paymentDate).toLocaleDateString()} via {pay.paymentMethod}</div>
                      </div>
                      <span className="text-sm font-black text-slate-900">${pay.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className="p-6 border-t border-gray-100 bg-slate-50 flex justify-end">
            <button 
              onClick={() => setDossierCust(null)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold font-sans"
            >
              {lang === 'KH' ? 'បិទឯកសារអតិថិជន' : 'Dossier Closed'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
