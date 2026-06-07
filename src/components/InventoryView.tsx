import React, { useState, useMemo } from 'react';
import { 
  Inbox, 
  Search, 
  MapPin, 
  Lock, 
  AlertOctagon, 
  FileCheck, 
  Hammer, 
  Layers, 
  X, 
  Tag, 
  BadgeAlert 
} from 'lucide-react';
import { PawnContract, Language } from '../types';

interface InventoryViewProps {
  pawnContracts: PawnContract[];
  lang: Language;
  t: (key: string) => string;
  onUpdateInventoryLocation: (contractId: string, newLoc: string) => void;
  onReportLostItem: (contractId: string) => void;
}

export default function InventoryView({
  pawnContracts,
  lang,
  t,
  onUpdateInventoryLocation,
  onReportLostItem
}: InventoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [selectedItemForLocation, setSelectedItemForLocation] = useState<PawnContract | null>(null);
  const [newLocationVal, setNewLocationVal] = useState('');

  // Search filter
  const filteredInventory = useMemo(() => {
    let result = pawnContracts;

    if (filterCategory !== 'All') {
      result = result.filter(item => item.category === filterCategory);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.itemName.toLowerCase().includes(term) ||
        item.contractNo.toLowerCase().includes(term) ||
        item.storageLocation.toLowerCase().includes(term)
      );
    }
    return result;
  }, [pawnContracts, filterCategory, searchTerm]);

  // Unique categories
  const categoriesList = ['All', 'Gold', 'Silver', 'Phone', 'Laptop', 'Motorbike', 'Car', 'Electronics', 'Others'];

  // Vault/Storage summary stats
  const stats = useMemo(() => {
    const totalStored = pawnContracts.filter(p => p.status === 'Active' || p.status === 'Extended' || p.status === 'Expired').length;
    const underAuction = pawnContracts.filter(p => p.status === 'Auction').length;
    const itemsReleased = pawnContracts.filter(p => p.status === 'Redeemed').length;
    
    return {
      totalStored,
      underAuction,
      itemsReleased
    };
  }, [pawnContracts]);

  const handleUpdateLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForLocation || !newLocationVal.trim()) return;

    onUpdateInventoryLocation(selectedItemForLocation.id, newLocationVal);
    setSelectedItemForLocation(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Inbox className="w-5.5 h-5.5 text-amber-500" />
          <span>{t('navInventory')}</span>
        </h2>
        <p className="text-xs text-slate-500">{lang === 'KH' ? 'ឃ្លាំងរក្សាទុកទំនិញបញ្ចាំ មាស ពេជ្រ យានយន្ត និងការតាមដានសុវត្ថិភាព' : 'Monitor physical placement details of borrower assets under double lock safes and vaults'}</p>
      </div>

      {/* QUICK INVENTORY METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-2xs flex items-center space-x-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase">{lang === 'KH' ? 'គ្រឿងក្នុងឃ្លាំងសុវត្ថិភាព' : 'Currently Stored in Safe'}</div>
            <div className="text-xl font-black text-slate-900 mt-1">{stats.totalStored} {lang === 'KH' ? 'គ្រឿង' : 'items'}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-2xs flex items-center space-x-3.5">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Hammer className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase">{lang === 'KH' ? 'ទំនិញដាក់ដេញថ្លៃឡៃឡុង' : 'Pawn items on Auction'}</div>
            <div className="text-xl font-black text-amber-600 mt-1">{stats.underAuction} {lang === 'KH' ? 'គ្រឿង' : 'items'}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-2xs flex items-center space-x-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase">{lang === 'KH' ? 'គ្រឿងបញ្ចាំបានលោះរួច' : 'Redeemed & Released'}</div>
            <div className="text-xl font-black text-emerald-600 mt-1">{stats.itemsReleased} {lang === 'KH' ? 'គ្រឿង' : 'items'}</div>
          </div>
        </div>
      </div>

      {/* CATEGORIES BUTTON FILTER */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
        {categoriesList.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition-all ${
              filterCategory === cat 
                ? 'bg-amber-500 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            {cat === 'All' ? (lang === 'KH' ? 'ទាំងអស់' : 'All') : t(cat)}
          </button>
        ))}
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <input 
          type="text"
          placeholder={lang === 'KH' ? 'ស្វែងរកឈ្មោះទំនិញ លេខកិច្ចសន្យា ឬទីកន្លែងថែរក្សា...' : 'Search item nomenclature, contract ID, storage location...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 shadow-2xs font-sans"
        />
        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
      </div>

      {/* Inventory grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredInventory.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-150 shadow-xs hover:shadow-xs transition-all p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded select-all">
                    {item.contractNo}
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-base mt-1.5 leading-tight">{item.itemName}</h4>
                  <p className="text-xs text-gray-400 mt-1">{lang === 'KH' ? 'ម្ចាស់បញ្ចាំ' : 'Collateral Owner'}: <span className="font-semibold text-slate-700">{item.customerName}</span></p>
                </div>
                <span className={`px-2 py-0.5 font-bold uppercase rounded text-[9px] ${
                  item.status === 'Active' || item.status === 'Extended' ? 'bg-emerald-100 text-emerald-800' :
                  item.status === 'Redeemed' ? 'bg-blue-100 text-blue-800' :
                  item.status === 'Expired' ? 'bg-rose-100 text-rose-800 animate-pulse' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {item.status === 'Redeemed' ? (lang === 'KH' ? 'បានលោះរួច' : 'Released') : t(item.status)}
                </span>
              </div>

              {/* Physical placement indicators */}
              <div className="border-t border-gray-50 pt-3 space-y-2 text-xs">
                <div className="flex items-center text-slate-600 gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">{lang === 'KH' ? 'ទីតាំងថែរក្សា' : 'Vault Location'}</div>
                    <div className="font-extrabold text-slate-800 mt-0.5">{item.storageLocation}</div>
                  </div>
                </div>

                <div className="flex items-center text-slate-600 gap-2">
                  <Layers className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">{t('category')}</div>
                    <div className="font-semibold text-slate-800 mt-0.5">{t(item.category)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Change Safe/Spot Box action */}
            {item.status !== 'Redeemed' && (
              <div className="flex gap-2 pt-4 border-t border-gray-50 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedItemForLocation(item);
                    setNewLocationVal(item.storageLocation);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors"
                >
                  <MapPin className="w-3 h-3" />
                  <span>{lang === 'KH' ? 'ប្ដូរទីតាំងប្រអប់' : 'Update Locker'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(lang === 'KH' ? `តើអ្នកចង់ចាត់ទុកទំនិញ ${item.itemName} ជាបាត់បង់មែនទេ? (ប្រព័ន្ធនឹងកត់ត្រាសំណង)` : `Report pawned asset under contract ${item.contractNo} as physical lost or misplaced?`)) {
                      onReportLostItem(item.id);
                    }
                  }}
                  className="p-1.5 border border-red-200 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Lost Report"
                >
                  <AlertOctagon className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        ))}
      </div>

      {/* --- UPDATE LOCKER DRAWER MODAL --- */}
      {selectedItemForLocation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleUpdateLocationSubmit} className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-bold text-slate-900 text-base">
                {lang === 'KH' ? 'កែប្រែទីតាំងថែរក្សាក្នុងឃ្លាំង' : 'Change Storage Drawer Placement'}
              </h3>
              <button type="button" onClick={() => setSelectedItemForLocation(null)} className="text-gray-400 hover:text-gray-900 p-1 rounded bg-slate-50">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <div className="font-bold text-slate-800">{selectedItemForLocation.itemName}</div>
                <div className="text-gray-400 font-mono mt-0.5">Contract: {selectedItemForLocation.contractNo}</div>
              </div>

              <div className="space-y-1 pt-2">
                <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'KH' ? 'បញ្ចូលឈ្មោះបញ្ជរ/បន្ទប់/កន្លែងផ្ដល់ថ្មី *' : 'Enter New Vault / Shelf / Slot *'}</label>
                <input 
                  type="text" required
                  value={newLocationVal} onChange={(e) => setNewLocationVal(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white"
                  placeholder="Locker Spot A-2"
                />
              </div>
            </div>

            <div className="flex justify-end items-center space-x-2 pt-4 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => setSelectedItemForLocation(null)} 
                className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                {t('cancel')}
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
              >
                {lang === 'KH' ? 'បញ្ជាក់ប្ដូរ' : 'Comply Shift'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
