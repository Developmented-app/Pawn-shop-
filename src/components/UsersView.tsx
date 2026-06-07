import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  ShieldAlert, 
  UserPlus, 
  Clock, 
  X, 
  KeyRound, 
  FileText, 
  Lock
} from 'lucide-react';
import { User, ActivityLog, Language } from '../types';

interface UsersViewProps {
  users: User[];
  activityLogs: ActivityLog[];
  lang: Language;
  t: (key: string) => string;
  onAddUser: (user: User) => void;
}

export default function UsersView({
  users,
  activityLogs,
  lang,
  t,
  onAddUser
}: UsersViewProps) {
  const [activeTab, setActiveTab] = useState<'Users' | 'Audits'>('Users');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<User['role']>('Staff');
  const [formBranch, setFormBranch] = useState('Phnom Penh');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    const nextId = `USR-${200 + users.length + 1}`;
    const defaultPermissions = 
      formRole === 'Super Admin' ? ['all'] :
      formRole === 'Admin' ? ['manage_customers', 'manage_pawn', 'manage_loans', 'manage_installments', 'view_reports'] :
      formRole === 'Manager' ? ['manage_customers', 'manage_pawn', 'manage_loans', 'view_reports'] :
      ['manage_customers', 'create_pawn', 'create_loan', 'receive_payment'];

    const newUser: User = {
      id: nextId,
      name: formName,
      email: formEmail,
      role: formRole,
      branch: formBranch,
      status: 'Active',
      lastLogin: new Date().toISOString(),
      permissions: defaultPermissions
    };

    onAddUser(newUser);
    setIsAddOpen(false);
    setFormName('');
    setFormEmail('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5.5 h-5.5 text-blue-600" />
            <span>{t('navUsers')}</span>
          </h2>
          <p className="text-xs text-slate-500">{lang === 'KH' ? 'គ្រប់គ្រងគណនីបុគ្គលិក កំណត់សិទ្ធិប្រព័ន្ធ និងពិនិត្យកំណត់ហេតុសុវត្ថិភាពសកម្ម' : 'Delegate staff privileges, modify roles and audit every dashboard mutation'}</p>
        </div>
        
        {activeTab === 'Users' && (
          <button 
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs hover:shadow-md font-sans text-sm font-bold transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>{lang === 'KH' ? 'បន្ថែមបុគ្គលិកថ្មី' : 'Onboard Officer'}</span>
          </button>
        )}
      </div>

      {/* SEGMENT TABS */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-60 select-none">
        <button 
          onClick={() => setActiveTab('Users')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold font-sans transition-all ${
            activeTab === 'Users' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {lang === 'KH' ? 'បញ្ជីឈ្មោះបុគ្គលិក' : 'Officer Registry'}
        </button>
        <button 
          onClick={() => setActiveTab('Audits')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold font-sans transition-all ${
            activeTab === 'Audits' ? 'bg-white text-slate-905 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {lang === 'KH' ? 'កំណត់ហេតុសកម្ម' : 'Audit Trails'}
        </button>
      </div>

      {/* --- SEGMENT 1: USER LISTS --- */}
      {activeTab === 'Users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {users.map((u) => (
            <div key={u.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {u.id}
                  </span>
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                     u.role === 'Super Admin' ? 'bg-red-50 text-red-600 border border-red-150' :
                     u.role === 'Admin' ? 'bg-blue-50 text-blue-600 border border-blue-150' :
                     u.role === 'Accountant' ? 'bg-slate-100 text-slate-800 border border-slate-250' :
                     'bg-slate-50 text-slate-700 border border-slate-200'
                  }`}>
                    {u.role}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-950 text-base">{u.name}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{u.email}</p>
                </div>
              </div>

              <div className="border-t border-gray-50 pt-3 mt-4 flex justify-between items-center text-[11px] text-gray-500 font-semibold font-sans">
                <div className="flex gap-1 items-center">
                  <KeyRound className="w-3.5 h-3.5 text-gray-400" />
                  <span>{u.branch}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-mono text-[10px] text-gray-400">{new Date(u.lastLogin).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- SEGMENT 2: ACTIVITY SYSTEM AUDIT LOGS --- */}
      {activeTab === 'Audits' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs select-none">
          <div className="p-4 font-bold text-slate-950 border-b border-gray-50 uppercase tracking-widest flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-900" />
            <span>Immutable Integrity Security Logs (Audit Ledger)</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase">
                  <th className="py-2.5 px-4 font-sans">Timestamp (UTC)</th>
                  <th className="py-2.5 px-4 font-sans">{lang === 'KH' ? 'អ្នកអនុវត្ត' : 'Officer Agent'}</th>
                  <th className="py-2.5 px-4 font-sans">{lang === 'KH' ? 'មូឌុល' : 'Resource Model'}</th>
                  <th className="py-2.5 px-4 font-sans">{lang === 'KH' ? 'សកម្មភាព' : 'Trigger Action'}</th>
                  <th className="py-2.5 px-4 font-sans">Device IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-semibold">
                {activityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/40 text-slate-550">
                    <td className="py-3 px-4 font-mono text-[10px] text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.userName}</td>
                    <td className="py-3 px-4 uppercase font-bold text-indigo-700">{log.module}</td>
                    <td className="py-3 px-4 text-slate-650 font-medium">{log.description}</td>
                    <td className="py-3 px-4 font-mono text-[10px] text-gray-400">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ADD NEW SYSTEM OFFICER MODAL --- */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddSubmit} className="bg-white rounded-xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl space-y-4 select-none">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-bold text-slate-900 text-base">
                {lang === 'KH' ? 'ចុះឈ្មោះគណនីមន្ត្រីថ្មី' : 'Grant Vault Officer Access'}
              </h3>
              <button type="button" onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-gray-900 p-1 rounded bg-slate-50">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'KH' ? 'ឈ្មោះពេញរបស់មន្ត្រី *' : 'Officer Full Name *'}</label>
                <input 
                  type="text" required placeholder="Sok San, etc."
                  value={formName} onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'KH' ? 'អាសយដ្ឋានអ៊ីមែល *' : 'Officer Email *'}</label>
                <input 
                  type="email" required placeholder="sok.san@riem.com"
                  value={formEmail} onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'KH' ? 'តួនាទីសិទ្ធិ' : 'Access Role'}</label>
                  <select 
                    value={formRole} onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:bg-white font-bold"
                  >
                    <option value="Staff">Staff Officer</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Administrator</option>
                    <option value="Accountant">Accountant Ledger</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'KH' ? 'សាខាប្រចាំការ' : 'Branch Assign'}</label>
                  <select 
                    value={formBranch} onChange={(e) => setFormBranch(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded px-2.5 py-1 focus:outline-none"
                  >
                    <option value="Phnom Penh">Phnom Penh</option>
                    <option value="Siem Reap">Siem Reap</option>
                    <option value="Battambang">Battambang</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center space-x-2 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setIsAddOpen(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700">
                {t('cancel')}
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors">
                {lang === 'KH' ? 'បង្កើតគណនី' : 'Grant Privileges'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
