
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { GeneratedResponse, User, PlanType } from '../types';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface HistoryProps {
  history: GeneratedResponse[];
  user: User | null;
  onDelete?: (id: string) => void;
  onUpdate?: () => Promise<void>;
}

const History: React.FC<HistoryProps> = ({ history, user, onDelete }) => {
  const [filter, setFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); 
  const [selectedItem, setSelectedItem] = useState<GeneratedResponse | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dateOptions = [
    { value: 'all', label: 'Altijd' },
    { value: 'today', label: 'Vandaag' },
    { value: 'week', label: '7 Dagen' },
    { value: 'month', label: '30 Dagen' }
  ];

  const activeLabel = dateOptions.find(o => o.value === dateFilter)?.label || 'Altijd';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredHistory = useMemo(() => {
    let items = [...history];

    if (user?.plan === PlanType.STARTER) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      items = items.filter(item => new Date(item.createdAt) >= thirtyDaysAgo);
    }

    if (filter) {
      const lowerFilter = filter.toLowerCase();
      items = items.filter(h => 
        h.originalMessage.toLowerCase().includes(lowerFilter) ||
        h.aiResponseA.toLowerCase().includes(lowerFilter) ||
        h.intent.toLowerCase().includes(lowerFilter)
      );
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      items = items.filter(h => {
        const date = new Date(h.createdAt);
        if (dateFilter === 'today') return date.toDateString() === now.toDateString();
        if (dateFilter === 'week') {
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          return date >= weekAgo;
        }
        if (dateFilter === 'month') {
          const monthAgo = new Date();
          monthAgo.setMonth(now.getMonth() - 1);
          return date >= monthAgo;
        }
        return true;
      });
    }

    return items;
  }, [history, filter, dateFilter, user]);

  const confirmDelete = () => {
    if (selectedItem && onDelete) {
      onDelete(selectedItem.id);
      setSelectedItem(null);
      setIsConfirmingDelete(false);
    }
  };

  if (user?.plan === PlanType.FREE) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in zoom-in-95 duration-700 max-w-2xl mx-auto">
        <div className="w-24 h-24 bg-yellow-50 rounded-[2.5rem] flex items-center justify-center text-4xl mb-8 shadow-inner border border-yellow-100">🔒</div>
        <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tighter text-[#1B4332] uppercase">Premium Feature</h2>
        <p className="text-gray-400 mb-10 text-sm font-bold uppercase tracking-widest leading-relaxed">Historiek is exclusief beschikbaar voor onze Starter, Pro en Unlimited plannen.</p>
        <Link to="/pricing" className="w-full max-w-xs bg-[#1B4332] text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-[#2D6A4F] active:scale-95 transition-all">Bekijk Plannen &rarr;</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-700 pb-32">
      
      <AnimatePresence mode="wait">
        {!selectedItem ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-10"
          >
            {/* --- HEADER --- */}
            <header className="px-1 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-[#1B4332] tracking-tighter mb-2">Historiek</h1>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Al jouw professionele communicatie op één plek</p>
              </div>
              
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 text-lg">🔍</span>
                  <input 
                    type="text" 
                    placeholder="Zoek bericht..." 
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-[#2D6A4F] outline-none transition-all font-bold text-sm shadow-sm"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                </div>
                
                {/* Custom Styled Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full sm:w-48 flex items-center justify-between px-6 py-4 rounded-2xl bg-white border-2 border-transparent hover:border-gray-50 focus:border-[#2D6A4F] outline-none shadow-sm transition-all group"
                  >
                    <span className="font-black uppercase tracking-[0.2em] text-[10px] text-[#1B4332]">{activeLabel}</span>
                    <motion.span 
                      animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                      className="text-[#2D6A4F] text-xs font-black opacity-40 group-hover:opacity-100"
                    >
                      ▼
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 left-0 sm:left-auto sm:w-full mt-2 bg-white rounded-[1.5rem] shadow-2xl border border-gray-50 overflow-hidden z-[100]"
                      >
                        <div className="py-2">
                          {dateOptions.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => {
                                setDateFilter(opt.value);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full text-left px-6 py-4 flex items-center justify-between transition-colors ${
                                dateFilter === opt.value ? 'bg-green-50' : 'hover:bg-gray-50'
                              }`}
                            >
                              <span className={`font-black uppercase tracking-[0.2em] text-[10px] ${
                                dateFilter === opt.value ? 'text-[#2D6A4F]' : 'text-gray-400'
                              }`}>
                                {opt.label}
                              </span>
                              {dateFilter === opt.value && (
                                <span className="text-[#2D6A4F] text-[10px] font-black">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </header>

            {/* --- LIST GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-1">
              {filteredHistory.length === 0 ? (
                <div className="col-span-full py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center px-8 shadow-sm">
                   <div className="text-5xl mb-6 opacity-20 grayscale">📜</div>
                   <p className="text-gray-300 font-black uppercase tracking-[0.2em] text-sm">Geen resultaten gevonden</p>
                   {filter && (
                     <button onClick={() => setFilter('')} className="mt-6 text-[10px] font-black text-[#2D6A4F] uppercase tracking-widest underline">Wis filters</button>
                   )}
                </div>
              ) : (
                filteredHistory.map((item) => (
                  <motion.button 
                    whileHover={{ y: -5 }}
                    key={item.id}
                    onClick={() => { setSelectedItem(item); setIsConfirmingDelete(false); window.scrollTo(0,0); }}
                    className="w-full text-left p-8 md:p-10 rounded-[2.5rem] bg-white border border-gray-50 hover:border-green-100 transition-all duration-300 relative group overflow-hidden shadow-sm flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-6 z-10">
                      <div className="flex flex-col gap-1.5 items-start bg-green-50 px-5 py-3 rounded-[1.25rem] border border-green-100 group-hover:bg-[#2D6A4F] transition-all duration-300">
                        <span className="text-[10px] font-black uppercase text-[#2D6A4F] group-hover:text-white transition-colors tracking-tight">
                          {item.intent}
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-[0.15em] text-[#2D6A4F]/50 group-hover:text-white/60 transition-colors">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-base md:text-lg font-medium text-gray-700 line-clamp-3 italic leading-relaxed mb-6 group-hover:text-[#1B4332] transition-colors">"{item.originalMessage}"</p>
                    
                    <div className="mt-auto pt-4 flex items-center gap-2 text-[#2D6A4F] font-black uppercase tracking-widest text-[9px] opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                      <span>Bekijk Details</span>
                      <span className="text-sm">→</span>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full space-y-8 md:space-y-12"
          >
            {/* --- TOP ACTIONS --- */}
            <div className="flex items-center justify-between px-1">
              <button 
                onClick={() => setSelectedItem(null)} 
                className="flex items-center gap-4 text-[10px] font-black uppercase text-[#2D6A4F] active:scale-95 transition-all bg-white hover:bg-green-50 px-8 py-5 rounded-[2rem] border border-gray-50 shadow-sm group"
              >
                <span className="group-hover:-translate-x-1 transition-transform text-lg leading-none">←</span>
                <span>Terug naar overzicht</span>
              </button>
              
              {!isConfirmingDelete && (
                <button 
                  onClick={() => setIsConfirmingDelete(true)} 
                  className="w-14 h-14 md:w-16 md:h-16 bg-red-50 text-red-600 rounded-[1.5rem] md:rounded-[2rem] hover:bg-red-600 hover:text-white active:scale-90 transition-all shadow-sm flex items-center justify-center border border-red-100"
                >
                  <span className="text-xl">🗑️</span>
                </button>
              )}
            </div>

            {/* --- HERO DETAIL --- */}
            <section className={`relative bg-[#113225] text-white rounded-[2.5rem] md:rounded-[4rem] shadow-2xl overflow-hidden min-h-[160px] md:min-h-[220px] flex flex-col justify-center p-8 md:p-12`}>
              <div className="relative z-10 space-y-4">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-none uppercase">{selectedItem.intent}</h2>
                <div className="inline-flex items-center bg-[#FFC300] px-4 py-2 rounded-xl shadow-lg border-2 border-white/20">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#1B4332]">Urgentie: {selectedItem.urgency || 'Laag'}</span>
                </div>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">{new Date(selectedItem.createdAt).toLocaleString()}</p>
              </div>
            </section>

            {/* --- DELETE CONFIRMATION --- */}
            {isConfirmingDelete && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 p-10 rounded-[2.5rem] border-2 border-red-100 text-center shadow-inner space-y-6">
                <h3 className="text-xl md:text-2xl font-black text-red-700 uppercase tracking-tighter">Bericht verwijderen?</h3>
                <p className="text-red-600/70 text-sm font-bold uppercase tracking-widest">Deze actie kan niet ongedaan gemaakt worden.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <button onClick={confirmDelete} className="bg-red-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 transition-all">Definitief Verwijderen</button>
                  <button onClick={() => setIsConfirmingDelete(false)} className="bg-white text-gray-400 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] border border-gray-100 active:scale-95 transition-all">Annuleren</button>
                </div>
              </motion.div>
            )}

            {/* --- CONTENT CARDS --- */}
            <div className="grid grid-cols-1 gap-8 md:gap-12">
              {/* Original Message */}
              <div className="bg-white p-8 md:p-14 rounded-[3rem] shadow-sm border border-gray-50 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-sm">💬</div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Origineel bericht</h4>
                </div>
                <div className="p-8 md:p-12 bg-gray-50 rounded-[2rem] text-lg md:text-2xl italic font-medium leading-relaxed border-l-[10px] border-[#2D6A4F] shadow-inner text-gray-600">
                  "{selectedItem.originalMessage}"
                </div>
              </div>

              {/* AI Variants */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <DetailVariantCard 
                  label="Variant A - Direct" 
                  content={selectedItem.aiResponseA} 
                  color="border-green-100"
                  icon="⚡"
                />
                <DetailVariantCard 
                  label="Variant B - Warm" 
                  content={selectedItem.aiResponseB} 
                  color="border-yellow-100"
                  icon="🤗"
                />
              </div>

              {/* Stats Footer */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                <DetailStat label="Stijl" value={selectedItem.tone} icon="🎨" />
                <DetailStat label="Lengte" value={selectedItem.length} icon="📏" />
                <DetailStat label="Intentie" value={selectedItem.intent} icon="🎯" />
                <DetailStat label="Datum" value={new Date(selectedItem.createdAt).toLocaleDateString()} icon="📅" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DetailVariantCard = ({ label, content, color, icon }: any) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border-2 ${color} flex flex-col gap-8 group hover:shadow-xl transition-all duration-500`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{label}</h3>
        </div>
        <button 
          onClick={handleCopy} 
          className={`text-[10px] font-black uppercase px-6 py-3 rounded-2xl transition-all active:scale-95 shadow-sm border ${
            copied ? 'bg-green-600 text-white border-green-600' : 'bg-green-50 text-[#2D6A4F] border-green-100 hover:bg-[#2D6A4F] hover:text-white'
          }`}
        >
          {copied ? 'Gekopieerd!' : 'Kopieer'}
        </button>
      </div>
      <div className="flex-1 text-base md:text-xl leading-relaxed text-gray-800 font-medium whitespace-pre-wrap italic">
        {content}
      </div>
    </div>
  );
};

const DetailStat = ({ label, value, icon }: any) => (
  <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col items-center gap-3 text-center group hover:shadow-md transition-all">
    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">{icon}</div>
    <div>
      <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-[11px] md:text-sm font-black text-[#1B4332] uppercase tracking-tight break-words">{value}</p>
    </div>
  </div>
);

export default History;
