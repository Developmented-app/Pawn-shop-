import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  DollarSign, 
  Save, 
  Database, 
  DatabaseBackup, 
  CheckCircle2, 
  KeyRound,
  FileSpreadsheet
} from 'lucide-react';
import { SystemSettings, Language } from '../types';

interface SettingsViewProps {
  settings: SystemSettings;
  lang: Language;
  t: (key: string) => string;
  onUpdateSettings: (newSettings: SystemSettings) => void;
  allDataBackupPayload: any; // Entire memory state backup
}

export default function SettingsView({
  settings,
  lang,
  t,
  onUpdateSettings,
  allDataBackupPayload
}: SettingsViewProps) {
  const [compName, setCompName] = useState(settings.companyName);
  const [compAddress, setCompAddress] = useState(settings.address);
  const [compPhone, setCompPhone] = useState(settings.phone);
  const [ratePawn, setRatePawn] = useState(settings.interestRatePawn);
  const [rateLoan, setRateLoan] = useState(settings.interestRateLoan);
  const [rateInstallment, setRateInstallment] = useState(settings.interestRateInstallment);
  const [baseExRate, setBaseExRate] = useState(settings.exchangeRateUsdToKhr);
  const [isSaved, setIsSaved] = useState(false);

  // Trigger Save Settings
  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      companyName: compName,
      address: compAddress,
      phone: compPhone,
      interestRatePawn: ratePawn,
      interestRateLoan: rateLoan,
      interestRateInstallment: rateInstallment,
      exchangeRateUsdToKhr: baseExRate
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3050);
  };

  // Full Database JSON sandbox backup downloader!
  const handleFullDatabaseBackup = () => {
    const jsonStr = JSON.stringify(allDataBackupPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `RIEM_SYSTEM_BACKUP_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert(lang === 'KH' ? 'ប្រព័ន្ធបានធ្វើការថតចម្លង (Auto Backup) ជោគជ័យ!' : 'Full Microfinance Database Schema & JSON entries backup downloaded successfully!');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5.5 h-5.5 text-indigo-700" />
          <span>{t('navSettings')}</span>
        </h2>
        <p className="text-xs text-slate-500">{lang === 'KH' ? 'កំណត់ព័ត៌មានក្រុមហ៊ុន អត្រាការប្រាក់ទូទៅរបស់ប្រព័ន្ធ និងការបម្រុងទុកទិន្នន័យ' : 'Manage global system configurations, interest baseline thresholds, and cryptographic database exports'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form blocks - Configurations settings */}
        <form onSubmit={handleSaveSubmit} className="lg:col-span-2 bg-white rounded-2xl border border-gray-150 p-6 shadow-xs space-y-6 select-none">
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5 border-b border-gray-50 pb-2">
              <Building2 className="w-4.5 h-4.5 text-slate-400" />
              <span>{lang === 'KH' ? 'ព័ត៌មានក្រុមហ៊ុន / គ្រឹះស្ថាន' : 'Registrar Identity Information'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-gray-500 uppercase">{lang === 'KH' ? 'ឈ្មោះក្រុមហ៊ុន (សាឡន/បញ្ចាំ)' : 'Institution Name *'}</label>
                <input 
                  type="text" required
                  value={compName} onChange={(e) => setCompName(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 uppercase">{lang === 'KH' ? 'លេខទូរស័ព្ទរបស់គ្រឹះស្ថាន' : 'Institution Hotline *'}</label>
                <input 
                  type="text" required
                  value={compPhone} onChange={(e) => setCompPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-gray-500 uppercase">{lang === 'KH' ? 'អាសយដ្ឋានទីតាំង' : 'Physical HQ Address *'}</label>
                <input 
                  type="text" required
                  value={compAddress} onChange={(e) => setCompAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5 border-b border-gray-50 pb-2">
              <DollarSign className="w-4.5 h-4.5 text-slate-400" />
              <span>System-Wide Loan Amortization & Currency Parameters</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-gray-500 uppercase">Pawn Interest %</label>
                <input 
                  type="number" step="0.1" required
                  value={ratePawn} onChange={(e) => setRatePawn(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 uppercase">Micro-Loan %</label>
                <input 
                  type="number" step="0.1" required
                  value={rateLoan} onChange={(e) => setRateLoan(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 uppercase">Installment %</label>
                <input 
                  type="number" step="0.1" required
                  value={rateInstallment} onChange={(e) => setRateInstallment(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 uppercase">Exchange Rate (៛)</label>
                <input 
                  type="number" required
                  value={baseExRate} onChange={(e) => setBaseExRate(parseInt(e.target.value) || 4000)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            {isSaved && (
              <span className="text-emerald-600 font-extrabold text-xs inline-flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>{lang === 'KH' ? 'រក្សាទុកការកំណត់ទទួលបានជោគជ័យ!' : 'Parameters updated successfully!'}</span>
              </span>
            )}
            <button
              type="submit"
              className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-750 text-white hover:bg-slate-900 rounded-xl font-sans text-xs font-bold transition-colors shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{lang === 'KH' ? 'រក្សាទុកការកំណត់' : 'Apply Settings'}</span>
            </button>
          </div>

        </form>

        {/* Right Form segment - Automatic backup JSON log actions */}
        <div className="bg-white rounded-2xl border border-gray-155 p-6 shadow-xs flex flex-col justify-between select-none">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5 border-b border-gray-55 pb-2">
              <Database className="w-4.5 h-4.5 text-indigo-600" />
              <span>Full Database Storage Backup (JSON)</span>
            </h3>

            <p className="text-xs/relaxed text-gray-500 font-sans">
              Deploy our automated local recovery system. Press backup to construct 
              a complete schemas image containing customer files, active pledges, active ledgers, 
              accounting books, and user profiles.
            </p>
          </div>

          <div className="space-y-2 mt-6">
            <button
              type="button"
              onClick={handleFullDatabaseBackup}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border-2 border-indigo-200 border-dashed hover:border-indigo-600 hover:bg-indigo-50/50 rounded-xl font-bold font-sans text-xs text-indigo-700 transition-all cursor-pointer"
            >
              <DatabaseBackup className="w-4.5 h-4.5" />
              <span>{lang === 'KH' ? 'បម្រុងទុកទិន្នន័យ (Auto Backup)' : 'Backup Database Registry'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
