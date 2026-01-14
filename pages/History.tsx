
import React, { useState, useMemo } from 'react';
import { GeneratedResponse, User, PlanType } from '../types';
import { Link } from 'react-router-dom';

interface HistoryProps {
  history: GeneratedResponse[];
  user: User | null;
  onDelete?: (id: string) => void;
}

const History: React.FC<HistoryProps> = ({ history, user, onDelete }) => {
  const [filter, setFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // today, week, month, all (last year)
  const [selectedItem, setSelectedItem] = useState<GeneratedResponse | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

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
    } else {
      // 'all' filter is nu '1 Jaar'
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      items = items.filter(h => new Date(h.createdAt) >= yearAgo);
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
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in zoom-in-95 duration-700">
        <div className="w-20 h-20 bg-yellow-50 rounded-2xl flex items-center justify-center text-4xl mb-8 shadow-inner animate-bounce">🔒</div>
        <h2 className="text-2xl font-black mb-4 tracking-tight text-[#1C1C1C]">Premium Feature</h2>
        <p className="text-gray-500 mb-10 text-sm font-medium">Historiek is enkel voor betalende klanten.</p>
        <Link to="/pricing" className="w-full max-w-xs bg-[#1B4332] text-white py-5 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-[#2D6A4F] active:scale-95 transition-all">Bekijk Plannen</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-500 pb-20 px-2 md:px-0">
      
      {/* Header & Filters Section - Verbergen als een item geselecteerd is voor maximale rust */}
      {!selectedItem && (
        <div className="bg-white p-6 md:p-14 rounded-[2.5rem] md:rounded-[3.5rem] border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-top-4 duration-500">
          <div className="relative group max-w-3xl mx-auto w-full">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#2D6A4F] transition-colors text-xl">🔍</span>
            <input 
              type="text" 
              placeholder="Zoeken door je historiek..." 
              className="w-full pl-14 pr-6 py-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#2D6A4F] focus:bg-white transition-all font-bold text-base outline-none shadow-inner"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          <div className="flex justify-center w-full overflow-x-auto no-scrollbar">
            <div className="flex gap-2 p-2 bg-gray-50 rounded-[1.5rem] border border-gray-100">
              {['today', 'week', 'month', 'all'].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateFilter(range)}
                  className={`px-4 md:px-8 py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 ${
                    dateFilter === range 
                      ? 'bg-[#1B4332] text-white shadow-lg scale-[1.05]' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {range === 'today' ? 'Vandaag' : range === 'week' ? '7 Dagen' : range === 'month' ? '30 Dagen' : '1 Jaar'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center">
        
        {/* List Section - Alleen tonen als er GEEN item geselecteerd is */}
        {!selectedItem && (
          <div className="w-full space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredHistory.length === 0 ? (
                <div className="col-span-full text-center py-40 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 font-black text-gray-300 text-xl animate-in fade-in">
                  Geen resultaten gevonden
                </div>
              ) : (
                filteredHistory.map((item, idx) => (
                  <button 
                    key={item.id}
                    onClick={() => { setSelectedItem(item); setIsConfirmingDelete(false); }}
                    className="w-full text-left p-8 rounded-[2.5rem] border-2 border-white bg-white hover:border-[#2D6A4F]/20 transition-all duration-500 relative group animate-in fade-in slide-in-from-bottom-4 fill-mode-both hover:shadow-2xl hover:-translate-y-2"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <div className="flex flex-col items-start gap-2 mb-5">
                      <span className="text-[9px] font-black uppercase bg-[#2D6A4F]/10 text-[#2D6A4F] px-4 py-2 rounded-xl group-hover:bg-[#2D6A4F] group-hover:text-white transition-all duration-300">{item.intent}</span>
                      <span className="text-[9px] text-gray-300 font-black group-hover:text-gray-600 transition-colors ml-1">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800 line-clamp-2 italic transition-colors leading-relaxed mb-4 group-hover:text-[#1B4332]">"{item.originalMessage}"</p>
                    
                    <div className="flex items-center gap-2 text-[#2D6A4F] font-black uppercase tracking-widest text-[8px] opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                      <span>Bekijk Details</span>
                      <span className="text-xs">→</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Detail Panel - Tonen over de volledige breedte als er een item geselecteerd is voor een rustige ervaring */}
        {selectedItem && (
          <div className="w-full max-w-5xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-700 fill-mode-both">
            <div className="bg-white p-8 md:p-16 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.08)] border border-gray-50 relative overflow-hidden">
              
              {/* Back button */}
              <button 
                onClick={() => setSelectedItem(null)} 
                className="mb-12 flex items-center gap-4 text-[10px] font-black uppercase text-[#2D6A4F] active:scale-95 transition-all bg-green-50 hover:bg-green-100 px-8 py-4 rounded-[1.5rem] border border-green-100 shadow-sm group w-full sm:w-auto justify-center sm:justify-start"
              >
                <span className="group-hover:-translate-x-1 transition-transform text-lg leading-none">←</span>
                <span>Terug naar overzicht</span>
              </button>

              {/* Delete Confirmation */}
              {isConfirmingDelete && (
                <div className="mb-12 p-10 bg-red-50 rounded-[2.5rem] border-2 border-red-100 animate-in zoom-in-95 duration-300 shadow-inner text-center">
                  <p className="text-[#1C1C1C] font-black text-lg mb-8 leading-tight">Bericht definitief verwijderen?</p>
                  <div className="flex gap-4 max-w-xs mx-auto">
                    <button 
                      onClick={confirmDelete}
                      className="flex-1 bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all"
                    >
                      Verwijder
                    </button>
                    <button 
                      onClick={() => setIsConfirmingDelete(false)}
                      className="flex-1 bg-white text-gray-400 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-gray-100 active:scale-95 transition-all"
                    >
                      Annuleer
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-start mb-16 gap-8 animate-in fade-in duration-700 delay-200">
                <div className="space-y-2">
                  <h3 className="text-3xl md:text-5xl font-black tracking-tighter leading-[0.9] text-[#1B4332]">Bericht Detail</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{new Date(selectedItem.createdAt).toLocaleString()}</p>
                </div>
                {!isConfirmingDelete && (
                  <button 
                    onClick={() => setIsConfirmingDelete(true)} 
                    className="p-6 bg-red-50 text-red-600 rounded-[2rem] hover:bg-red-100 active:scale-90 transition-all shadow-sm group border border-red-100 flex items-center justify-center"
                  >
                    <span className="text-2xl group-hover:scale-125 transition-transform inline-block opacity-40 group-hover:opacity-100">🗑️</span>
                  </button>
                )}
              </div>

              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
                <section>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase mb-6 tracking-[0.3em] px-1 flex items-center gap-4">
                    <span className="w-12 h-px bg-gray-200"></span>
                    Origineel bericht
                  </h4>
                  <div className="p-8 md:p-12 bg-gray-50 rounded-[2.5rem] text-base md:text-xl italic font-medium leading-relaxed border-l-[8px] border-[#2D6A4F] shadow-inner text-gray-600">
                    "{selectedItem.originalMessage}"
                  </div>
                </section>

                <section className="space-y-12">
                  <div className="space-y-6 group">
                    <div className="flex justify-between items-center px-1">
                      <h4 className="text-[10px] font-black text-green-700 bg-green-50 px-5 py-2.5 rounded-xl uppercase tracking-widest group-hover:bg-green-100 transition-colors">Variant A - Formeel</h4>
                      <button onClick={() => { navigator.clipboard.writeText(selectedItem.aiResponseA); alert('Gekopieerd!'); }} className="text-[10px] font-black uppercase text-[#2D6A4F] hover:bg-green-50 px-6 py-3 rounded-2xl transition-all active:scale-95 shadow-sm border border-transparent hover:border-green-100">Kopieer</button>
                    </div>
                    <div className="p-8 md:p-12 rounded-[2.5rem] border-2 border-gray-50 bg-white font-medium text-gray-800 leading-relaxed text-sm md:text-xl whitespace-pre-wrap shadow-sm group-hover:shadow-2xl group-hover:border-green-100 transition-all duration-500">
                      {selectedItem.aiResponseA}
                    </div>
                  </div>

                  <div className="space-y-6 group">
                    <div className="flex justify-between items-center px-1">
                      <h4 className="text-[10px] font-black text-yellow-700 bg-yellow-50 px-5 py-2.5 rounded-xl uppercase tracking-widest group-hover:bg-yellow-100 transition-colors">Variant B - Persoonlijk</h4>
                      <button onClick={() => { navigator.clipboard.writeText(selectedItem.aiResponseB); alert('Gekopieerd!'); }} className="text-[10px] font-black uppercase text-[#2D6A4F] hover:bg-yellow-50 px-6 py-3 rounded-2xl transition-all active:scale-95 shadow-sm border border-transparent hover:border-yellow-100">Kopieer</button>
                    </div>
                    <div className="p-8 md:p-12 rounded-[2.5rem] border-2 border-gray-50 bg-white font-medium text-gray-800 leading-relaxed text-sm md:text-xl whitespace-pre-wrap shadow-sm group-hover:shadow-2xl group-hover:border-yellow-100 transition-all duration-500">
                      {selectedItem.aiResponseB}
                    </div>
                  </div>
                </section>

                <div className="grid grid-cols-2 gap-6 pt-12 border-t border-gray-50">
                  <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-inner group hover:bg-white transition-all duration-500 text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-3 tracking-widest">STIJL</p>
                    <p className="text-xs md:text-lg font-black text-[#2D6A4F] uppercase tracking-tight">{selectedItem.tone}</p>
                  </div>
                  <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-inner group hover:bg-white transition-all duration-500 text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-3 tracking-widest">LENGTE</p>
                    <p className="text-xs md:text-lg font-black text-[#2D6A4F] uppercase tracking-tight">{selectedItem.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
