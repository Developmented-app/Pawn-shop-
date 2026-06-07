import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Search, 
  Printer, 
  X, 
  Undo2, 
  ArrowRight, 
  BadgeCheck, 
  Wallet,
  Coins,
  DollarSign,
  CheckCircle2,
  QrCode,
  Smartphone
} from 'lucide-react';
import { PaymentReceipt, Customer, Language, PaymentMethod, PaymentType } from '../types';
import { Barcode, CustomQRCode, KHQRBox } from './BarcodeQR';

interface PaymentsViewProps {
  payments: PaymentReceipt[];
  customers: Customer[];
  lang: Language;
  t: (key: string) => string;
  onRefundPayment: (id: string) => void;
}

export default function PaymentsView({
  payments,
  customers,
  lang,
  t,
  onRefundPayment
}: PaymentsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);

  // Layout custom states
  const [printBarcode, setPrintBarcode] = useState(true);
  const [printVerificationQR, setPrintVerificationQR] = useState(true);
  const [receiptType, setReceiptType] = useState<'Standard' | 'Compact' | 'Detailed'>('Detailed');
  const [customMemoText, setCustomMemoText] = useState('');
  const [rightPanelTab, setRightPanelTab] = useState<'custom' | 'scanner'>('custom');

  // Core payload generator
  const generateVerificationUrl = (receipt: PaymentReceipt) => {
    const baseUrl = "https://verify.riem-finance.gov.kh/receipt";
    const params = new URLSearchParams({
      id: receipt.receiptNo,
      customer: receipt.customerName,
      amount: receipt.amount.toString(),
      type: receipt.paymentType,
      date: new Date(receipt.paymentDate).toISOString().split('T')[0],
      sign: `RIEM-${receipt.id.substring(receipt.id.length - 4).toUpperCase()}`
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const handlePrintReceipt = () => {
    const printContents = document.getElementById('repay-receipt-print')?.innerHTML;
    if (printContents) {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
      
      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`
          <html>
            <head>
              <title>Print Receipt - ${selectedReceipt?.receiptNo || 'Riem Finance'}</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
                
                body { 
                  font-family: "Plus Jakarta Sans", "Inter", sans-serif; 
                  background: white; 
                  margin: 0; 
                  padding: 20px; 
                  color: #1e293b;
                }
                #repay-receipt-print { 
                  max-width: 320px; /* Thermal 80mm standard format size limit */
                  margin: 0 auto; 
                }
                .flex { display: flex; }
                .flex-col { flex-direction: column; }
                .items-center { align-items: center; }
                .justify-center { justify-content: center; }
                .justify-between { justify-content: space-between; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .pb-3 { padding-bottom: 12px; }
                .pt-2 { padding-top: 8px; }
                .pt-3 { padding-top: 12px; }
                .p-2 { padding: 8px; }
                .p-3 { padding: 12px; }
                .mb-1 { margin-bottom: 4px; }
                .mb-1.5 { margin-bottom: 6px; }
                .mb-2 { margin-bottom: 8px; }
                .mt-0.5 { margin-top: 2px; }
                .mt-1 { margin-top: 4px; }
                .py-3 { padding-top: 12px; padding-bottom: 12px; }
                .gap-1 { gap: 4px; }
                .gap-4 { gap: 16px; }
                .space-y-1 > * + * { margin-top: 4px; }
                .space-y-1.5 > * + * { margin-top: 6px; }
                .space-y-4 > * + * { margin-top: 16px; }
                .border-b { border-bottom: 1px solid #e2e8f0; }
                .border-t { border-top: 1px solid #e2e8f0; }
                .border { border: 1px solid #cbd5e1; }
                .border-dashed { border-style: dashed; }
                .rounded { border-radius: 4px; }
                .bg-white { background-color: #ffffff; }
                .bg-slate-50 { background-color: #f8fafc; }
                .text-2xl { font-size: 24px; }
                .text-sm { font-size: 14px; }
                .text-xs { font-size: 12px; }
                .text-\\[11px\\] { font-size: 11px; }
                .text-\\[10px\\] { font-size: 10px; }
                .text-\\[9px\\] { font-size: 9px; }
                .text-\\[8.5px\\] { font-size: 8.5px; }
                .text-\\[8px\\] { font-size: 8px; }
                .font-black { font-weight: 900; }
                .font-bold { font-weight: 700; }
                .font-semibold { font-weight: 600; }
                .font-medium { font-weight: 500; }
                .font-mono { font-family: "JetBrains Mono", monospace; }
                .text-slate-900 { color: #0f172a; }
                .text-slate-800 { color: #1e293b; }
                .text-slate-850 { color: #223047; }
                .text-gray-900 { color: #111827; }
                .text-gray-700 { color: #374151; }
                .text-gray-500 { color: #6b7280; }
                .text-gray-400 { color: #9ca3af; }
                .uppercase { text-transform: uppercase; }
                .tracking-wider { letter-spacing: 0.05em; }
                .tracking-widest { letter-spacing: 0.1em; }
                .leading-normal { line-height: 1.5; }
                .italic { font-style: italic; }
                .select-none { user-select: none; }
                .block { display: block; }
                .w-32 { width: 128px; }
                .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
              </style>
            </head>
            <body onload="window.print(); window.parent.document.body.removeChild(window.frameElement);">
              <div id="repay-receipt-print">
                ${printContents}
              </div>
            </body>
          </html>
        `);
        doc.close();
      }
    }
  };

  // Search filter
  const filteredPayments = useMemo(() => {
    if (!searchTerm.trim()) return payments;
    const term = searchTerm.toLowerCase();
    return payments.filter(p => 
      p.receiptNo.toLowerCase().includes(term) ||
      p.customerName.toLowerCase().includes(term) ||
      p.paymentType.toLowerCase().includes(term) ||
      p.paymentMethod.toLowerCase().includes(term)
    );
  }, [payments, searchTerm]);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Wallet className="w-5.5 h-5.5 text-blue-600" />
          <span>{t('navPayments')}</span>
        </h2>
        <p className="text-xs text-slate-500">{lang === 'KH' ? 'បញ្ជរគ្រប់គ្រងការទូទាត់ប្រាក់ វិក្កយបត្រស្កេន និងត្រួតពិនិត្យប្រវត្តិគណនេយ្យ' : 'Consolidated payments counter showing Cash, ABA, ACLEDA, and KHQR transactions with full receipt registers'}</p>
      </div>

      {/* Search Input Filter */}
      <div className="relative">
        <input 
          type="text"
          placeholder={lang === 'KH' ? 'ស្វែងរកលេខវិក្កយបត្រ ឈ្មោះអតិថិជន ឬវិធីសាស្ត្រទូទាត់...' : 'Search receipt code, payer, payment method...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-blue-600 shadow-2xs font-sans"
        />
        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 font-bold uppercase bg-slate-50">
                <th className="py-3.5 px-4">{t('receiptNo')}</th>
                <th className="py-3.5 px-4">{t('fullName')}</th>
                <th className="py-3.5 px-4">{t('paymentType')}</th>
                <th className="py-3.5 px-4">{t('paymentMethod')}</th>
                <th className="py-3.5 px-4">{t('amount')}</th>
                <th className="py-3.5 px-4">{t('paymentDate')}</th>
                <th className="py-3.5 px-4 select-none">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredPayments.map((p) => {
                const isPawn = p.paymentType.includes('Pawn');
                const isLoan = p.paymentType.includes('Loan');
                const isInstallment = p.paymentType.includes('Installment');

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{p.receiptNo}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{p.customerName}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        isPawn ? 'bg-amber-100 text-amber-800' :
                        isLoan ? 'bg-emerald-100 text-emerald-800' :
                        'bg-indigo-100 text-[#4f46e5]'
                      }`}>
                        {p.paymentType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium">
                      <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-gray-400">{new Date(p.paymentDate).toLocaleString()}</td>
                    <td className="py-3.5 px-4 flex items-center space-x-2">
                       <button 
                        onClick={() => {
                          setSelectedReceipt(p);
                          // Default values sync
                          setCustomMemoText('');
                        }}
                        className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Printer className="w-3 h-3" />
                        <span>{t('view')}</span>
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(lang === 'KH' ? 'តើអ្នកប្រាកដជាចង់ធ្វើការបង្វិលសងចំណាយនេះវិញមែនទេ?' : 'Confirm rollback refund for this transaction receipt? This action is irreversible.')) {
                            onRefundPayment(p.id);
                          }
                        }}
                        className="p-1.5 border border-red-150 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Refund"
                      >
                        <Undo2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- RECEIPT DIALOG PRINT SIMULATOR --- */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl flex flex-col md:flex-row gap-6 relative select-none">
            
            <button 
              type="button" 
              onClick={() => setSelectedReceipt(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left Printable Box */}
            <div id="repay-receipt-print" className="flex-1 bg-slate-50 p-6 rounded-xl border border-gray-200 max-h-[85vh] overflow-y-auto font-sans text-xs text-slate-800 space-y-4">
              {/* Receipt Header */}
              {receiptType !== 'Compact' ? (
                <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-300">
                  <div className="text-2xl">🦁</div>
                  <h4 className="font-sans font-black text-sm text-slate-900">គ្រឹះស្ថាន បញ្ចាំ និងកម្ចី រៀម</h4>
                  <p className="text-[10px] text-gray-400 font-medium font-mono">RIEM FINANCIAL CAPITAL</p>
                  <p className="text-[9px] text-gray-450">ផ្ទះលេខ ១២A ផ្លូវ ២៧១ សង្កាត់បឹងកេងកងទី ៣ ខណ្ឌបឹងកេងកង ភ្នំពេញ</p>
                  <p className="text-[9px] text-gray-450 font-mono font-medium">TEL: 012 888 999</p>
                </div>
              ) : (
                <div className="text-center space-y-0.5 pb-2 border-b border-dashed border-gray-300">
                  <h4 className="font-sans font-black text-xs text-slate-900">គ្រឹះស្ថាន បញ្ចាំ និងកម្ចី រៀម</h4>
                  <p className="text-[9px] text-gray-450 font-mono font-medium">RIEM CAPS | TEL: 012 888 999</p>
                </div>
              )}

              <div className="text-center font-bold uppercase text-slate-900 tracking-wider">
                {receiptType === 'Compact' ? 'បង្កាន់ដៃទូទាត់' : 'វិក្កយបត្របង់ប្រាក់ផ្លូវការ'} <br />
                <span className="text-[9px] text-gray-405 font-medium">{receiptType === 'Compact' ? 'PAYMENT SLIP' : 'OFFICIAL PAYMENT RECEIPT'}</span>
              </div>

              {/* Receipt Metadata Section */}
              <div className="space-y-1.5 border-b border-dashed border-gray-300 pb-3 font-medium text-[11px]">
                <div className="flex justify-between">
                  <span>លេខវិក្កយបត្រ / Receipt No:</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedReceipt.receiptNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>អតិថិជន / Payer Name:</span>
                  <span className="font-bold text-slate-900">{selectedReceipt.customerName}</span>
                </div>
                {receiptType !== 'Compact' && (
                  <div className="flex justify-between">
                    <span>លេខសម្គាល់ / Client ID:</span>
                    <span className="font-mono text-slate-900">{selectedReceipt.customerId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>បង់លើកិច្ចសន្យា / Ref Contract:</span>
                  <span className="font-mono">{selectedReceipt.referenceId}</span>
                </div>
                <div className="flex justify-between">
                  <span>ប្រភេទការបង់ / Pay Type:</span>
                  <span className="font-bold text-slate-850">{selectedReceipt.paymentType}</span>
                </div>
              </div>

              {/* Monies Section */}
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between font-extrabold text-slate-900 text-sm">
                  <span>ទឹកប្រាក់បានបង់ / Net Paid (USD):</span>
                  <span>${selectedReceipt.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-700">
                  <span>វិធីទូទាត់ / Paid Via:</span>
                  <span>{selectedReceipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 border-b border-dashed border-gray-300 pb-3">
                  <span>ជាលុយរៀលជាមធ្យម / Equivalent KHR:</span>
                  <span className="font-mono">៛{(selectedReceipt.amount * selectedReceipt.exchangeRate).toLocaleString()}</span>
                </div>
              </div>

              {/* Audit/Agent Details */}
              <div className="space-y-1.5 p-2 bg-white rounded border border-gray-200 font-medium text-[10px]/relaxed">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>កត់ត្រាដោយ / Cashier Agent:</span>
                  <span>{selectedReceipt.collectedBy}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>ថ្ងៃបង់ប្រាក់ / Paid Date:</span>
                  <span>{new Date(selectedReceipt.paymentDate).toLocaleString()}</span>
                </div>
                {/* Dynamically integrated notes (both predefined note and custom live-typed notes!) */}
                {(selectedReceipt.note || customMemoText) && (
                  <div className="text-[9px] text-gray-400 border-t border-slate-100 pt-1 mt-1 block">
                    Memo: {[selectedReceipt.note, customMemoText].filter(Boolean).join(' | ')}
                  </div>
                )}
              </div>

              {/* Dynamic printable QR and Barcode codeblock */}
              <div className="flex flex-col items-center justify-center gap-4 py-3 border-t border-b border-dashed border-gray-200 select-none">
                {printVerificationQR && (
                  <div className="flex flex-col items-center text-center space-y-1">
                    <CustomQRCode 
                      value={generateVerificationUrl(selectedReceipt)} 
                      size={110}
                    />
                    <span className="text-[8.5px] font-sans font-bold text-slate-700 uppercase tracking-wider block mt-1">
                      {lang === 'KH' ? 'ស្កេនដើម្បីផ្ទៀងផ្ទាត់សង្គតិភាព' : 'Scan to Verify Authenticity'}
                    </span>
                  </div>
                )}
                {printBarcode && (
                  <Barcode value={selectedReceipt.receiptNo} height={32} width={160} />
                )}
              </div>

              <div className="text-[8.5px] text-gray-450 text-center leading-normal pt-2">
                សូមរក្សាទុកបង្កាន់ដៃនេះដើម្បីផ្ទៀងផ្ទាត់ឥណទានរបស់អ្នក។ ទឹកប្រាក់បានទូទាត់រួចនឹងបញ្ជូនទៅកាន់ធនាគារកណ្ដាល Bakong។ <br />
                <span className="italic block mt-0.5">Thank you for your business. Security is our absolute focus.</span>
              </div>
            </div>

            {/* Right Printable Controls with Dynamic Tabs & Test Scanner Simulator */}
            <div className="flex-1 flex flex-col justify-between items-stretch py-2 space-y-4 max-h-[85vh] overflow-y-auto pr-1">
              
              {/* Tabs */}
              <div className="flex border-b border-gray-100 pb-0.5 select-none">
                <button
                  type="button"
                  onClick={() => setRightPanelTab('custom')}
                  className={`flex-1 pb-2 text-xs font-bold border-b-2 tracking-wide transition-colors cursor-pointer ${
                    rightPanelTab === 'custom' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5" />
                    {lang === 'KH' ? 'ការកំណត់វិក្កយបត្រ' : 'Configure Custom'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRightPanelTab('scanner')}
                  className={`flex-1 pb-2 text-xs font-bold border-b-2 tracking-wide transition-colors cursor-pointer ${
                    rightPanelTab === 'scanner' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" />
                    {lang === 'KH' ? 'សាកល្បងស្កេន QR' : 'Test QR Verify (Sim)'}
                  </span>
                </button>
              </div>

              {/* Tab Contents: Customization */}
              {rightPanelTab === 'custom' && (
                <div className="flex-1 flex flex-col justify-between text-left space-y-4">
                  <div className="space-y-3.5">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        {lang === 'KH' ? 'ជម្រើសនៃការបោះពុម្ព' : 'Printable Artifact Options'}
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {lang === 'KH' ? 'ជ្រើសរើសធាតុដែលត្រូវបោះពុម្ពលើបង្កាន់ដៃ' : 'Toggle secure codes and metadata for the thermal handout'}
                      </p>
                    </div>

                    {/* Checkbox fields */}
                    <div className="bg-slate-50 border border-gray-150 rounded-xl p-3 space-y-2.5">
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 select-none">
                        <input 
                          type="checkbox" 
                          checked={printVerificationQR}
                          onChange={(e) => setPrintVerificationQR(e.target.checked)}
                          className="rounded border-gray-350 text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                        <span>{lang === 'KH' ? 'បោះពុម្ព QR ស្កេនផ្ទៀងផ្ទាត់' : 'Print Verification QR'}</span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 select-none">
                        <input 
                          type="checkbox" 
                          checked={printBarcode}
                          onChange={(e) => setPrintBarcode(e.target.checked)}
                          className="rounded border-gray-350 text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                        <span>{lang === 'KH' ? 'បោះពុម្ពកូដរបារ (Receipt Barcode)' : 'Print Barcode'}</span>
                      </label>
                    </div>

                    {/* Receipt Type Selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        {lang === 'KH' ? 'ប្រភេទបង្កាន់ដៃ / Copy Label' : 'Invoice Mode Layout'}
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
                        {(['Standard', 'Compact', 'Detailed'] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setReceiptType(type)}
                            className={`py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                              receiptType === type 
                                ? 'bg-white text-slate-900 shadow-3xs' 
                                : 'text-gray-500 hover:text-slate-800'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dynamic Memo Text Box */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        {lang === 'KH' ? 'កំណត់ចំណាំបន្ថែមលើបង្កាន់ដៃ' : 'Custom Inline Memo Notes'}
                      </label>
                      <textarea
                        value={customMemoText}
                        onChange={(e) => setCustomMemoText(e.target.value)}
                        placeholder={lang === 'KH' ? 'ឧទាហរណ៍៖ ទូទាត់បានជោគជ័យ គ្មានការផាកពិន័យ...' : 'e.g., Promotion applied, outstanding settled...'}
                        className="w-full text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 h-14 resize-none font-sans"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-lg flex items-start gap-2 text-[10px] text-blue-700 leading-normal mb-3 text-left">
                      <QrCode className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>{lang === 'KH' ? 'ការស្កេនរលូន' : 'Instant Verification Enabled'}</strong>: 
                        {lang === 'KH' 
                          ? ' QR ស្កេនផ្ទៀងផ្ទាត់នឹងរក្សាទុកព័ត៌មានលម្អិតរបស់វិក្កយបត្រដើម្បីការពារការក្លែងបន្លំ។' 
                          : ' The system-generated Verification QR simplifies ledger tracking for mobile phone cameras.'}
                      </div>
                    </div>

                    <div className="flex gap-2 w-full">
                      <button 
                        onClick={handlePrintReceipt}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold font-sans text-sm hover:bg-slate-805 hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>{lang === 'KH' ? 'បោះពុម្ពវិក្កយបត្រ' : 'Print Invoice'}</span>
                      </button>
                      <button 
                        onClick={() => setSelectedReceipt(null)}
                        className="px-4 py-2.5 border border-gray-250 text-slate-700 hover:bg-slate-100 font-bold rounded-xl text-sm transition-colors cursor-pointer"
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Contents: Scan Simulator */}
              {rightPanelTab === 'scanner' && (
                <div className="flex-1 flex flex-col items-center justify-between space-y-4">
                  <div className="w-full text-left space-y-1">
                    <h4 className="font-bold text-slate-800 text-xs">
                      {lang === 'KH' ? 'ស្មាតហ្វូនស្កេនផ្ទៀងផ្ទាត់សាកល្បង' : 'Smartphone Scanning Portal'}
                    </h4>
                    <p className="text-[10px] text-gray-500 leading-normal">
                      {lang === 'KH' 
                        ? 'ព័ត៌មានខាងក្រោមនឹងបង្ហាញឡើងនៅពេលអតិថិជនស្កេនព័ត៌មាន QR របស់វិក្កយបត្រជាមួយទូរស័ព្ទដៃរបស់ពួកគេ'
                        : 'Simulated customer view upon scanning the secure QR from the printed layout'}
                    </p>
                  </div>

                  {/* Simulated Mobile Mockup */}
                  <div className="w-56 bg-slate-950 rounded-[28px] p-2 border-4 border-slate-800 shadow-xl overflow-hidden text-left relative">
                    {/* Speaker & camera notch */}
                    <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 w-16 h-3.5 bg-slate-800 rounded-b-md z-20 flex justify-center items-center">
                      <div className="w-1 h-1 bg-slate-900 rounded-full"></div>
                    </div>
                    
                    {/* Screen Container */}
                    <div className="bg-slate-900 text-white p-2.5 pt-4 rounded-[18px] text-[10px] h-[260px] overflow-y-auto space-y-2.5 font-sans relative">
                      {/* Browser address bar */}
                      <div className="bg-slate-805 bg-slate-800/80 px-2 py-0.5 rounded text-[8px] text-gray-400 font-mono flex items-center justify-between select-none">
                        <span className="flex items-center gap-1">
                          <span className="text-emerald-400">🔒</span>
                          verify.riem-finance...
                        </span>
                        <span>🔄</span>
                      </div>

                      {/* Genuine Bouncing Badge */}
                      <div className="text-center py-1 space-y-0.5">
                        <div className="inline-flex items-center justify-center w-8 h-8 bg-emerald-500/10 rounded-full border border-emerald-500 animate-pulse text-emerald-400 mb-0.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <h5 className="font-bold text-emerald-400 text-[9px] uppercase tracking-wider">{lang === 'KH' ? 'ប្រតិបត្តិការត្រឹមត្រូវ' : 'Verified Secure'}</h5>
                        <p className="text-[8px] text-gray-400">{lang === 'KH' ? 'បានចុះបញ្ជីក្នុងប្រព័ន្ធរៀមហិរញ្ញវត្ថុ' : 'Registered in Riem Finance DB'}</p>
                      </div>

                      {/* Scanned Receipt Meta Summary */}
                      <div className="bg-white/5 rounded-lg p-2 space-y-1 border border-white/5 font-mono text-[8.5px]">
                        <div className="flex justify-between">
                          <span className="text-gray-400">RECEIPT:</span>
                          <span className="text-white font-bold">{selectedReceipt.receiptNo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">PAYER:</span>
                          <span className="text-white truncate max-w-[80px] font-bold">{selectedReceipt.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">AMOUNT:</span>
                          <span className="text-emerald-400 font-extrabold">${selectedReceipt.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">TYPE:</span>
                          <span className="text-blue-300">{selectedReceipt.paymentType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">DATE:</span>
                          <span>{new Date(selectedReceipt.paymentDate).toISOString().split('T')[0]}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">SIGN:</span>
                          <span className="text-yellow-400 font-bold">RIEM-HASH-{selectedReceipt.id.substring(selectedReceipt.id.length - 4).toUpperCase()}</span>
                        </div>
                      </div>

                      {/* Footer lock stamp */}
                      <div className="text-center text-[7.5px] text-gray-500 font-medium">
                        {lang === 'KH' ? '🔒 ប្រព័ន្ធសុវត្ថិភាពទិន្នន័យ Bakong 256-bit' : '🔒 256-Bit SSL Secured Ledger Network'}
                      </div>
                    </div>
                  </div>

                  <div className="w-full">
                    <button
                      onClick={() => setRightPanelTab('custom')}
                      className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      {lang === 'KH' ? '← ត្រលប់ទៅការកំណត់' : '← Back to Config'}
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
