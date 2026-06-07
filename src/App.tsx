import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Clock, 
  HelpCircle, 
  LogOut, 
  Menu, 
  Globe2, 
  Wallet, 
  X, 
  Landmark, 
  Bookmark, 
  Calculator, 
  Inbox, 
  BadgeDollarSign, 
  FileSpreadsheet, 
  BellRing, 
  Settings as SettingsIcon,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

import { translations } from './khmerEn';
import { 
  initialCustomers, 
  initialPawnContracts, 
  initialLoans, 
  initialInstallmentContracts, 
  initialPayments, 
  initialExpenses, 
  initialIncomeLogs, 
  initialActivityLogs, 
  initialNotifications, 
  defaultSettings, 
  initialUsers 
} from './mockData';

// View Imports
import DashboardView from './components/DashboardView';
import CustomerView from './components/CustomerView';
import PawnShopView from './components/PawnShopView';
import LoansView from './components/LoansView';
import InstallmentsView from './components/InstallmentsView';
import PaymentsView from './components/PaymentsView';
import InventoryView from './components/InventoryView';
import AccountingView from './components/AccountingView';
import ReportsView from './components/ReportsView';
import NotificationsView from './components/NotificationsView';
import UsersView from './components/UsersView';
import SettingsView from './components/SettingsView';

import { 
  Customer, 
  PawnContract, 
  Loan, 
  InstallmentContract, 
  PaymentReceipt, 
  Expense, 
  Income, 
  ActivityLog, 
  Notification, 
  SystemSettings, 
  User, 
  Language, 
  NavValue 
} from './types';

export default function App() {
  // Locale State
  const [lang, setLang] = useState<Language>('KH');

  // Navigation Selection
  const [activeNav, setActiveNav] = useState<NavValue>('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Core Schema Databases State
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [pawnContracts, setPawnContracts] = useState<PawnContract[]>(initialPawnContracts);
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [installments, setInstallments] = useState<InstallmentContract[]>(initialInstallmentContracts);
  const [payments, setPayments] = useState<PaymentReceipt[]>(initialPayments);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [income, setIncome] = useState<Income[]>(initialIncomeLogs);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialActivityLogs);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  
  const [settings, setSettings] = useState<SystemSettings>({
    companyName: defaultSettings.companyName,
    address: defaultSettings.addressKh || defaultSettings.addressEn || '',
    phone: defaultSettings.phone,
    interestRatePawn: defaultSettings.defaultInterestRate,
    interestRateLoan: defaultSettings.defaultInterestRate - 0.5,
    interestRateInstallment: defaultSettings.defaultInterestRate - 1.0,
    exchangeRateUsdToKhr: 4100
  });

  const [users, setUsers] = useState<User[]>(initialUsers);

  // Active Authenticated user context
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]); // Chanthou Sopheap (Super Admin)

  // Language Translator Helper
  const t = (key: string): string => {
    return translations[lang]?.[key] || key;
  };

  // Log Activity Helper
  const logSystemAction = (module: string, description: string) => {
    const nextLogId = `LOG-${9000 + activityLogs.length + 1}`;
    const newLog: ActivityLog = {
      id: nextLogId,
      userId: currentUser.id,
      userName: currentUser.name,
      module,
      description,
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.102'
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // --- CUSTOMER ACTIONS ---
  const handleCreateCustomer = (cust: Customer) => {
    setCustomers(prev => [cust, ...prev]);
    logSystemAction('CUSTOMER', `Added new client dossier: ${cust.fullName}`);
  };

  const handleUpdateCustomer = (cust: Customer) => {
    setCustomers(prev => prev.map(c => c.id === cust.id ? cust : c));
    logSystemAction('CUSTOMER', `Updated profile credentials for client: ${cust.fullName}`);
  };

  const handleDeleteCustomer = (id: string) => {
    const cust = customers.find(c => c.id === id);
    if (!cust) return;
    setCustomers(prev => prev.filter(c => c.id !== id));
    logSystemAction('CUSTOMER', `Deleted client record: ${cust.fullName}`);
  };

  // --- PAWN ACTIONS ---
  const handleCreatePawnContract = (contract: PawnContract) => {
    setPawnContracts(prev => [contract, ...prev]);
    logSystemAction('PAWN', `Drafted Pawn Contract: ${contract.contractNo} for ${contract.itemName}`);
  };

  const handleRenewPawnContract = (contractId: string, extensionMonths: number, feePaid: number) => {
    setPawnContracts(prev => prev.map(item => {
      if (item.id === contractId) {
        const d = new Date(item.expiryDate);
        d.setMonth(d.getMonth() + extensionMonths);
        return {
          ...item,
          expiryDate: d.toISOString().split('T')[0],
          status: 'Extended'
        };
      }
      return item;
    }));

    const matchedContract = pawnContracts.find(item => item.id === contractId);
    if (matchedContract) {
      // Log income entry
      const newInc: Income = {
        id: `INC-AUTO-${900 + income.length + 1}`,
        category: 'Pawn Interest',
        amount: feePaid,
        currency: 'USD',
        date: new Date().toISOString().split('T')[0],
        description: `Pawn renewal fee under index ${matchedContract.contractNo}`
      };
      setIncome(prev => [newInc, ...prev]);

      // Create Receipt
      const newReceipt: PaymentReceipt = {
        id: `REC-${8000 + payments.length + 1}`,
        receiptNo: `REC-${1000 + payments.length + 1}`,
        customerId: matchedContract.customerId,
        customerName: matchedContract.customerName,
        referenceId: matchedContract.contractNo,
        paymentType: 'Pawn Renewal',
        paymentMethod: 'Cash',
        amount: feePaid,
        paymentDate: new Date().toISOString(),
        exchangeRate: settings.exchangeRateUsdToKhr,
        collectedBy: currentUser.name
      };
      setPayments(prev => [newReceipt, ...prev]);

      logSystemAction('PAWN', `Processed renewal extension of +${extensionMonths} months for contract ${matchedContract.contractNo}`);
    }
  };

  const handleRedeemPawnContract = (contractId: string, penaltyAmt: number) => {
    setPawnContracts(prev => prev.map(item => 
      item.id === contractId ? { ...item, status: 'Redeemed' } : item
    ));

    const itemObj = pawnContracts.find(item => item.id === contractId);
    if (itemObj) {
      // Log redemption income (principal + accrued interest)
      const totalRedeemedPaid = itemObj.loanAmount + penaltyAmt;
      const newInc: Income = {
        id: `INC-AUTO-${900 + income.length + 1}`,
        category: 'Pawn Interest',
        amount: totalRedeemedPaid,
        currency: 'USD',
        date: new Date().toISOString().split('T')[0],
        description: `Full redemption settlement: ${itemObj.contractNo}`
      };
      setIncome(prev => [newInc, ...prev]);

      // Create receipt
      const newReceipt: PaymentReceipt = {
        id: `REC-${8000 + payments.length + 1}`,
        receiptNo: `REC-${1500 + payments.length + 1}`,
        customerId: itemObj.customerId,
        customerName: itemObj.customerName,
        referenceId: itemObj.contractNo,
        paymentType: 'Collateral Redemption',
        paymentMethod: 'Cash',
        amount: totalRedeemedPaid,
        paymentDate: new Date().toISOString(),
        exchangeRate: settings.exchangeRateUsdToKhr,
        collectedBy: currentUser.name
      };
      setPayments(prev => [newReceipt, ...prev]);

      logSystemAction('PAWN', `Collateral Redeemed. Asset Released: ${itemObj.itemName}. Disbursed to: ${itemObj.customerName}`);
    }
  };

  const handleAuctionPawnItem = (contractId: string, finalSoldPrice: number) => {
    setPawnContracts(prev => prev.map(item => 
      item.id === contractId ? { ...item, status: 'Redeemed' } : item
    ));

    const itemObj = pawnContracts.find(item => item.id === contractId);
    if (itemObj) {
      // Record auction profit
      const newInc: Income = {
        id: `INC-AUTO-${900 + income.length + 1}`,
        category: 'Auction Income',
        amount: finalSoldPrice,
        currency: 'USD',
        date: new Date().toISOString().split('T')[0],
        description: `Pledge auction liquidation: ${itemObj.contractNo}`
      };
      setIncome(prev => [newInc, ...prev]);

      logSystemAction('PAWN', `Asset liquidated via foreclosure auction. Contract ${itemObj.contractNo} closed. Sold: $${finalSoldPrice}`);
    }
  };

  // --- LOAN ACTIONS ---
  const handleCreateLoan = (loan: Loan) => {
    setLoans(prev => [loan, ...prev]);
    logSystemAction('LOAN', `Authorized Micro-credit contract ${loan.loanNo} of $${loan.principalAmount} for borrower ${loan.customerName}`);
  };

  const handlePayLoanInstallment = (loanId: string, installmentNo: number, amountPaid: number, collector: string) => {
    setLoans(prev => prev.map(loan => {
      if (loan.id === loanId) {
        // Update remaining balance & individual schedule list item
        const updatedSchedule = loan.schedule.map(item => {
          if (item.installmentNo === installmentNo) {
            const nextPaid = item.paidAmount + amountPaid;
            const nextStatus = nextPaid >= item.amountDue ? 'Paid' : 'Unpaid';
            return {
              ...item,
              paidAmount: nextPaid,
              status: nextStatus
            };
          }
          return item;
        });

        const nextRemaining = Math.max(0, loan.remainingBalance - (amountPaid * 0.9)); // Amortization logic
        const fullyPaid = updatedSchedule.every(s => s.status === 'Paid');

        return {
          ...loan,
          remainingBalance: nextRemaining,
          status: fullyPaid ? 'Paid' : loan.status,
          schedule: updatedSchedule
        };
      }
      return loan;
    }));

    const matchedLoan = loans.find(l => l.id === loanId);
    if (matchedLoan) {
      // Log revenue
      const newInc: Income = {
        id: `INC-AUTO-${900 + income.length + 1}`,
        category: 'Loan Interest',
        amount: amountPaid,
        currency: 'USD',
        date: new Date().toISOString().split('T')[0],
        description: `Amortized installment collection #${installmentNo} for borrower ${matchedLoan.customerName}`
      };
      setIncome(prev => [newInc, ...prev]);

      // Save Receipt log
      const newRec: PaymentReceipt = {
        id: `REC-${8000 + payments.length + 1}`,
        receiptNo: `REC-LN-${3000 + payments.length + 1}`,
        customerId: matchedLoan.customerId,
        customerName: matchedLoan.customerName,
        referenceId: matchedLoan.loanNo,
        paymentType: `Amortized Collection #${installmentNo}`,
        paymentMethod: 'Cash',
        amount: amountPaid,
        paymentDate: new Date().toISOString(),
        exchangeRate: settings.exchangeRateUsdToKhr,
        collectedBy: collector
      };
      setPayments(prev => [newRec, ...prev]);

      logSystemAction('LOAN', `Processed installment payment #${installmentNo} of $${amountPaid} for contract ${matchedLoan.loanNo}`);
    }
  };

  const handleUpdateLoanStatus = (loanId: string, status: Loan['status']) => {
    setLoans(prev => prev.map(l => l.id === loanId ? { ...l, status } : l));
    logSystemAction('LOAN', `Updated Loan status to: ${status}`);
  };

  // --- INSTALLMENT LEASING ACTIONS ---
  const handleCreateInstallment = (contract: InstallmentContract) => {
    setInstallments(prev => [contract, ...prev]);
    // Log downpayment if applicable
    if (contract.downPayment > 0) {
      const newInc: Income = {
        id: `INC-AUTO-${1000 + income.length + 1}`,
        category: 'Installment Profit',
        amount: contract.downPayment,
        currency: 'USD',
        date: new Date().toISOString().split('T')[0],
        description: `Downpayment for finance lease ${contract.contractNo}`
      };
      setIncome(prev => [newInc, ...prev]);
    }
    logSystemAction('INSTALLMENT', `Approved product installment lease: ${contract.productName} for debtor ${contract.customerName}`);
  };

  const handlePayInstallmentItem = (contractId: string, monthNo: number, amountPaid: number) => {
    setInstallments(prev => prev.map(c => {
      if (c.id === contractId) {
        const nextSchedule = c.schedule.map(item => 
          item.monthNo === monthNo ? { ...item, status: 'Paid', paidAmount: amountPaid } : item
        );
        const nextRemaining = Math.max(0, c.remainingBalance - amountPaid);
        const allCompleted = nextSchedule.every(it => it.status === 'Paid');

        return {
          ...c,
          remainingBalance: nextRemaining,
          schedule: nextSchedule,
          status: allCompleted ? 'Completed' : c.status
        };
      }
      return c;
    }));

    const matchedInstallment = installments.find(i => i.id === contractId);
    if (matchedInstallment) {
      // Income ledger
      const newInc: Income = {
        id: `INC-AUTO-${1300 + income.length + 1}`,
        category: 'Installment Profit',
        amount: amountPaid,
        currency: 'USD',
        date: new Date().toISOString().split('T')[0],
        description: `Installment lease payment Month ${monthNo} for ${matchedInstallment.productName}`
      };
      setIncome(prev => [newInc, ...prev]);

      // Payment receipt
      const newRec: PaymentReceipt = {
        id: `REC-${8000 + payments.length + 1}`,
        receiptNo: `REC-INS-${4000 + payments.length + 1}`,
        customerId: matchedInstallment.customerId,
        customerName: matchedInstallment.customerName,
        referenceId: matchedInstallment.contractNo,
        paymentType: `Installment Hire Purchase #${monthNo}`,
        paymentMethod: 'Cash',
        amount: amountPaid,
        paymentDate: new Date().toISOString(),
        exchangeRate: settings.exchangeRateUsdToKhr,
        collectedBy: currentUser.name
      };
      setPayments(prev => [newRec, ...prev]);

      logSystemAction('INSTALLMENT', `Leasing payment month #${monthNo} of $${amountPaid} processed for ${matchedInstallment.productName}`);
    }
  };

  // --- WAREHOUSE COLLATERAL INVENTORY ACTIONS ---
  const handleUpdateInventoryLocation = (contractId: string, newLoc: string) => {
    setPawnContracts(prev => prev.map(p => 
      p.id === contractId ? { ...p, storageLocation: newLoc } : p
    ));
    logSystemAction('INVENTORY', `Shifted pawn storage unit: Contract ${contractId} to ${newLoc}`);
  };

  const handleReportLostItem = (contractId: string) => {
    setPawnContracts(prev => prev.map(p => 
      p.id === contractId ? { ...p, status: 'Expired', storageLocation: "DAMAGED/LOST REGISTERED" } : p
    ));
    logSystemAction('INVENTORY', `Logged physical damage or lost report for contract index ${contractId}`);
  };

  // --- LEDGER ACTIONS ---
  const handleAddExpense = (exp: Expense) => {
    setExpenses(prev => [exp, ...prev]);
    logSystemAction('ACCOUNTING', `Paid business expense invoice: ${exp.category} — $${exp.amount}`);
  };

  const handleAddIncome = (inc: Income) => {
    setIncome(prev => [inc, ...prev]);
    logSystemAction('ACCOUNTING', `Logged manual ledger profit item: ${inc.category} — $${inc.amount}`);
  };

  // --- GENERAL ACTIONS ---
  const handleRefundPayment = (receiptId: string) => {
    const matchedP = payments.find(p => p.id === receiptId);
    if (matchedP) {
      setPayments(prev => prev.filter(p => p.id !== receiptId));
      logSystemAction('PAYMENT', `Performed audit rollback refund for invoice ID: ${matchedP.receiptNo}`);
    }
  };

  const handleSendNotification = (notif: Notification) => {
    setNotifications(prev => [notif, ...prev]);
    logSystemAction('NOTIFICATION', `Dispatched outbound ${notif.channel} alert campaign for ${notif.customerName}`);
  };

  const handleAddUser = (user: User) => {
    setUsers(prev => [...prev, user]);
    logSystemAction('USER_MGMT', `Granted credentialed system privileges to: ${user.name} (${user.role})`);
  };

  const handleUpdateSettings = (newSet: SystemSettings) => {
    setSettings(newSet);
    logSystemAction('SETTINGS', 'Amended global system parameters and baseline operational criteria');
  };

  // Full Database Memory Dump Backup
  const fullBackupPayload = useMemo(() => ({
    backupMetadata: {
      timestamp: new Date().toISOString(),
      authorizedBy: currentUser.name,
      institution: settings.companyName,
      branch: 'Phnom Penh Headquarters'
    },
    customers,
    pawnContracts,
    loans,
    installments,
    payments,
    expenses,
    income,
    activityLogs,
    notifications,
    settings,
    users
  }), [customers, pawnContracts, loans, installments, payments, expenses, income, activityLogs, notifications, settings, users]);

  return (
    <div id="pawn-master-portal" className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-900">
      
      {/* 1. COLLAPSIBLE NAV SIDEBAR */}
      <aside className={`bg-slate-900 text-slate-300 w-64 flex flex-col justify-between shrink-0 select-none transition-all ${
        isSidebarOpen ? 'ml-0' : '-ml-64 sm:ml-0 sm:w-20'
      }`}>
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Logo Brand Brand block */}
          <div className="p-5 flex items-center justify-between border-b border-slate-805 bg-slate-950">
            <div className={`flex items-center gap-2.5 overflow-hidden transition-all ${!isSidebarOpen ? 'justify-center mx-auto' : ''}`}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-lg shrink-0">
                P
              </div>
              {isSidebarOpen && (
                <div>
                  <h1 className="text-sm font-black text-white tracking-widest uppercase">RIEM CAPITAL</h1>
                  <span className="text-[10px] text-blue-500 font-bold block leading-none mt-0.5 tracking-wider font-mono">PAWN & MICROFIN</span>
                </div>
              )}
            </div>
            {isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded bg-slate-850 hover:bg-slate-800 hidden sm:block"
                title="Collapse Sidebar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Navigation Links list */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto min-h-0">
            {[
              { label: t('navDashboard'), value: 'Dashboard', icon: BarChart3 },
              { label: t('navCustomers'), value: 'Customers', icon: Users },
              { label: t('navPawnShop'), value: 'PawnShop', icon: Bookmark },
              { label: t('navLoans'), value: 'Loans', icon: Landmark },
              { label: t('navInstallments'), value: 'Installments', icon: Calculator },
              { label: t('navPayments'), value: 'Payments', icon: Wallet },
              { label: t('navInventory'), value: 'Inventory', icon: Inbox },
              { label: t('navAccounting'), value: 'Accounting', icon: BadgeDollarSign },
              { label: t('navReports'), value: 'Reports', icon: FileSpreadsheet },
              { label: t('navNotifications'), value: 'Notifications', icon: BellRing },
              { label: t('navUsers'), value: 'Users', icon: ShieldAlert },
              { label: t('navSettings'), value: 'Settings', icon: SettingsIcon },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => setActiveNav(item.value as NavValue)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold font-sans transition-all group shrink-0 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-400 hover:bg-slate-850 hover:text-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-100'}`} />
                  {isSidebarOpen && <span className="font-sans leading-none">{item.label}</span>}
                </button>
              );
            })}
          </nav>

        </div>

        {/* Brand/Office bottom credit */}
        {isSidebarOpen && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-[10px] text-slate-500 font-semibold space-y-1">
            <p className="flex justify-between font-mono">
              <span>EXCHANGE:</span>
              <span className="text-amber-500 font-bold">${settings.exchangeRateUsdToKhr.toLocaleString()}៛</span>
            </p>
            <p className="flex justify-between font-mono">
              <span>HQ BRANCH:</span>
              <span>PHNOM PENH</span>
            </p>
          </div>
        )}
      </aside>

      {/* 2. PORTAL RUNTIME MAIN CANVAS SPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header navbar bar */}
        <header className="bg-white border-b border-gray-150 h-16 flex items-center justify-between px-6 shrink-0 z-10 shadow-3xs select-none">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-gray-500 mt-0.5 inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-150 py-1 px-3.5 rounded-xl uppercase tracking-wider text-indigo-850">
                <UserCheck className="w-3.5 h-3.5" />
                <span> {currentUser.name} ({currentUser.role})</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 select-none">
            
            {/* EN/KH Bilingual Translation switch */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button 
                onClick={() => setLang('KH')}
                className={`px-3 py-1 text-[10px] font-black rounded font-sans transition-colors ${
                  lang === 'KH' ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                ខ្មែរ
              </button>
              <button 
                onClick={() => setLang('EN')}
                className={`px-3 py-1 text-[10px] font-black rounded font-sans transition-colors ${
                  lang === 'EN' ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                ENG
              </button>
            </div>
            
          </div>
        </header>

        {/* Sub Routing Canvas area */}
        <main className="flex-1 overflow-y-auto p-6 focus:outline-none">
          {activeNav === 'Dashboard' && (
            <DashboardView 
              customers={customers}
              pawnContracts={pawnContracts}
              loans={loans}
              installments={installments}
              payments={payments}
              lang={lang}
              t={t}
              onNavigate={(v) => setActiveNav(v as any)}
            />
          )}

          {activeNav === 'Customers' && (
            <CustomerView 
              customers={customers}
              pawnContracts={pawnContracts}
              loans={loans}
              installments={installments}
              payments={payments}
              lang={lang}
              t={t}
              onAddCustomer={handleCreateCustomer}
              onEditCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
            />
          )}

          {activeNav === 'PawnShop' && (
            <PawnShopView 
              pawnContracts={pawnContracts}
              customers={customers}
              lang={lang}
              t={t}
              onCreatePawnContract={handleCreatePawnContract}
              onRenewPawnContract={(contractId, interestPaid, collector) => handleRenewPawnContract(contractId, 1, interestPaid)}
              onRedeemPawnContract={(contractId, redeemPaid, collector) => handleRedeemPawnContract(contractId, redeemPaid - (pawnContracts.find(p => p.id === contractId)?.loanAmount || 0))}
              onAuctionPawnContract={(contractId) => handleAuctionPawnItem(contractId, pawnContracts.find(p => p.id === contractId)?.estimatedValue || 0)}
              onExtendPawnContract={(contractId, days) => {
                setPawnContracts(prev => prev.map(p => {
                  if (p.id === contractId) {
                    const expiry = new Date(p.expiryDate);
                    expiry.setDate(expiry.getDate() + days);
                    return { ...p, expiryDate: expiry.toISOString().split('T')[0], status: 'Extended' };
                  }
                  return p;
                }));
                logSystemAction('PAWN', `Extended contract ${contractId} by ${days} days`);
              }}
            />
          )}

          {activeNav === 'Loans' && (
            <LoansView 
              loans={loans}
              customers={customers}
              lang={lang}
              t={t}
              onCreateLoan={handleCreateLoan}
              onPayInstallment={handlePayLoanInstallment}
              onUpdateLoanStatus={handleUpdateLoanStatus}
            />
          )}

          {activeNav === 'Installments' && (
            <InstallmentsView 
              installments={installments}
              customers={customers}
              lang={lang}
              t={t}
              onCreateInstallment={handleCreateInstallment}
              onPayInstallmentItem={handlePayInstallmentItem}
            />
          )}

          {activeNav === 'Payments' && (
            <PaymentsView 
              payments={payments}
              customers={customers}
              lang={lang}
              t={t}
              onRefundPayment={handleRefundPayment}
            />
          )}

          {activeNav === 'Inventory' && (
            <InventoryView 
              pawnContracts={pawnContracts}
              lang={lang}
              t={t}
              onUpdateInventoryLocation={handleUpdateInventoryLocation}
              onReportLostItem={handleReportLostItem}
            />
          )}

          {activeNav === 'Accounting' && (
            <AccountingView 
              incomeLogs={income}
              expenseLogs={expenses}
              lang={lang}
              t={t}
              onAddExpense={handleAddExpense}
              onAddIncome={handleAddIncome}
            />
          )}

          {activeNav === 'Reports' && (
            <ReportsView 
              customers={customers}
              pawnContracts={pawnContracts}
              loans={loans}
              installments={installments}
              lang={lang}
              t={t}
            />
          )}

          {activeNav === 'Notifications' && (
            <NotificationsView 
              notifications={notifications}
              customers={customers}
              lang={lang}
              t={t}
              onSendNotification={handleSendNotification}
            />
          )}

          {activeNav === 'Users' && (
            <UsersView 
              users={users}
              activityLogs={activityLogs}
              lang={lang}
              t={t}
              onAddUser={handleAddUser}
            />
          )}

          {activeNav === 'Settings' && (
            <SettingsView 
              settings={settings}
              lang={lang}
              t={t}
              onUpdateSettings={handleUpdateSettings}
              allDataBackupPayload={fullBackupPayload}
            />
          )}
        </main>

      </div>

    </div>
  );
}
