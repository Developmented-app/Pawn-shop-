import React, { useState } from 'react';
import { 
  BellRing, 
  Send, 
  MessageSquare, 
  Mail, 
  PhoneCall, 
  BadgeAlert, 
  CheckCircle2, 
  X, 
  RefreshCcw,
  Bot
} from 'lucide-react';
import { Notification, Customer, Language } from '../types';

interface NotificationsViewProps {
  notifications: Notification[];
  customers: Customer[];
  lang: Language;
  t: (key: string) => string;
  onSendNotification: (notif: Notification) => void;
}

export default function NotificationsView({
  notifications,
  customers,
  lang,
  t,
  onSendNotification
}: NotificationsViewProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formType, setFormType] = useState<Notification['type']>('Payment Due');
  const [formChannel, setFormChannel] = useState<Notification['channel']>('Telegram');
  const [formMsg, setFormMsg] = useState('');

  // Submit Alert dispatch
  const handleAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerId || !formMsg.trim()) return;

    const matchedCust = customers.find(c => c.id === formCustomerId);
    if (!matchedCust) return;

    const nextId = `NOT-${1000 + notifications.length + 1}`;
    const newNotif: Notification = {
      id: nextId,
      customerId: formCustomerId,
      customerName: matchedCust.fullName,
      type: formType,
      message: formMsg,
      channel: formChannel,
      status: 'Sent',
      sentAt: new Date().toISOString()
    };

    onSendNotification(newNotif);
    setIsAlertOpen(false);
    setFormMsg('');
  };

  // Populate dynamic message bodies on selection
  const handleTemplateSelect = (type: Notification['type']) => {
    setFormType(type);
    const matchedCust = customers.find(c => c.id === formCustomerId) || customers[0];
    const clientName = matchedCust ? matchedCust.fullName : "[Client]";
    
    if (type === 'Payment Due') {
      setFormMsg(`RIEM FINANCIAL REMINDER: Dear ${clientName}, your installment payment is due in 3 days. Please prepare cash or use ABA KHQR.`);
    } else if (type === 'Overdue Alert') {
      setFormMsg(`URGENT NOTICE: Dear ${clientName}, your loan account is currently OVERDUE. Penalty rates of 0.2%/day are accruing. Avoid legal action.`);
    } else {
      setFormMsg(`PAWN NOTICE: Dear ${clientName}, your pawned item is expiring soon. Please visit the branch to renew monthly interest or redeem.`);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BellRing className="w-5.5 h-5.5 text-blue-600" />
            <span>{t('navNotifications')}</span>
          </h2>
          <p className="text-xs text-slate-500">{lang === 'KH' ? 'ប្រព័ន្ធបញ្ជូនសាររំលឹកសងប្រាក់ និងលោះទំនិញបញ្ចាំតាមទូរស័ព្ទដៃ និង Telegram Bot' : 'Track automated late warning letters and broadcast Telegram bot reminders to active clients'}</p>
        </div>
        <button 
          onClick={() => {
            if (customers.length > 0) {
              setFormCustomerId(customers[0].id);
            }
            setIsAlertOpen(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs hover:shadow-md font-sans text-sm font-bold transition-all"
        >
          <Send className="w-4 h-4" />
          <span>{t('sendNotification')}</span>
        </button>
      </div>

      {/* Grid layouts detailing communications history */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden text-xs select-none">
        <div className="p-4 font-bold text-slate-950 border-b border-gray-50 uppercase tracking-wider">{lang === 'KH' ? 'ប្រវត្តិបញ្ជូនសារផ្សព្វផ្សាយរបស់ប្រព័ន្ធ' : 'Telecommunications Outbound Campaign Logs'}</div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50 text-slate-400 font-bold uppercase">
                <th className="py-3 px-4">Campaign ID</th>
                <th className="py-3 px-4">{t('fullName')}</th>
                <th className="py-3 px-4">{lang === 'KH' ? 'ប្រភេទសារ' : 'Alert Trigger'}</th>
                <th className="py-3 px-4">{lang === 'KH' ? 'ខ្លឹមសារ' : 'Message Context'}</th>
                <th className="py-3 px-4">{lang === 'KH' ? 'ប្រព័ន្ធបញ្ជូន' : 'Channel Pipeline'}</th>
                <th className="py-3 px-4">{t('status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-slate-800 font-semibold">
              {notifications.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-mono text-slate-700 font-bold">{n.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{n.customerName}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block font-mono text-[9px] font-bold px-2 py-0.5 rounded ${
                      n.type === 'Overdue Alert' ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-blue-50 text-blue-800'
                    }`}>
                      {n.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 max-w-[250px] truncate font-medium text-slate-500" title={n.message}>{n.message}</td>
                  <td className="py-3.5 px-4 font-mono flex items-center gap-1">
                    {n.channel === 'Telegram' && <Bot className="w-3.5 h-3.5 text-blue-500" />}
                    {n.channel === 'SMS' && <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />}
                    {n.channel === 'Email' && <Mail className="w-3.5 h-3.5 text-amber-500" />}
                    <span>{n.channel}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                      n.status === 'Sent' ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{n.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- OUTBOUND CAMPAIGN DIALOG MODAL --- */}
      {isAlertOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAlertSubmit} className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 select-none">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-bold text-slate-900 text-base">
                {lang === 'KH' ? 'បញ្ជូនសាររំលឹកបង់លុយសកម្ម' : 'Broadcast Outbound Alert'}
              </h3>
              <button type="button" onClick={() => setIsAlertOpen(false)} className="text-gray-400 hover:text-gray-900 p-1 rounded bg-slate-50">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'KH' ? 'គោលដៅអតិថិជន *' : 'Target Client *'}</label>
                <select 
                  value={formCustomerId} onChange={(e) => setFormCustomerId(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName} ({c.phoneNumber})</option>
                  ))}
                </select>
              </div>

              {/* Template shortcuts buttons */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">{lang === 'KH' ? 'គំរូសាររំលឹក' : 'Template Quick-Pick'}</label>
                <div className="flex gap-1.5 flex-wrap">
                  <button 
                    type="button" 
                    onClick={() => handleTemplateSelect('Payment Due')}
                    className="p-1 px-2.5 bg-blue-50 text-blue-800 rounded font-semibold text-[10px]"
                  >
                    Payment Due
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleTemplateSelect('Overdue Alert')}
                    className="p-1 px-2.5 bg-rose-50 text-rose-800 rounded font-semibold text-[10px]"
                  >
                    Overdue
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleTemplateSelect('Pawn Expiring')}
                    className="p-1 px-2.5 bg-amber-50 text-amber-800 rounded font-semibold text-[10px]"
                  >
                    Pawn Expiring
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'KH' ? 'ប្រភេទសារ' : 'Alert Type'}</label>
                  <select 
                    value={formType} onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-gray-200 rounded px-2.5 py-1 focus:outline-none"
                  >
                    <option value="Payment Due">Payment Due</option>
                    <option value="Overdue Alert">Overdue Alert</option>
                    <option value="Pawn Expiring">Pawn Expiring</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'KH' ? 'ប្រព័ន្ធបញ្ជូន' : 'Broadcasting Pipeline'}</label>
                  <select 
                    value={formChannel} onChange={(e) => setFormChannel(e.target.value as any)}
                    className="w-full bg-slate-50 border border-gray-200 rounded px-2.5 py-1 focus:outline-none font-bold"
                  >
                    <option value="Telegram">Telegram Channel</option>
                    <option value="SMS">SMS Text Message</option>
                    <option value="Email">Official Email</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'KH' ? 'ខ្លឹមសារសារជាអក្សរ *' : 'Alert Message Body *'}</label>
                <textarea 
                  value={formMsg} onChange={(e) => setFormMsg(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none min-h-[80px]"
                  placeholder="Enter message body here..."
                />
              </div>
            </div>

            <div className="flex justify-end items-center space-x-2 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setIsAlertOpen(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700">
                {t('cancel')}
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs tracking-wider uppercase transition-colors">
                Send Alert
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
