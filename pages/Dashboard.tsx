
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, GeneratedResponse } from '../types';
import { generateDailyQuote } from '../services/ai';
import { KoalaIcon } from '../constants';

interface DashboardProps {
  user: User | null;
  history: GeneratedResponse[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Fix: Use a standard easing string to avoid TypeScript errors with cubic-bezier arrays in inferred variant objects
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const Dashboard: React.FC<DashboardProps> = ({ user, history }) => {
  const [quote, setQuote] = useState<string>('');
  const [quoteLoading, setQuoteLoading] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      const today = new Date().toISOString().split('T')[0];
      const savedQuote = localStorage.getItem('koala_daily_quote');
      const savedDate = localStorage.getItem('koala_quote_date');
      if (savedQuote && savedDate === today) {
        setQuote(savedQuote);
      } else {
        setQuoteLoading(true);
        const newQuote = await generateDailyQuote();
        setQuote(newQuote);
        localStorage.setItem('koala_daily_quote', newQuote);
        localStorage.setItem('koala_quote_date', today);
        setQuoteLoading(false);
      }
    };
    fetchQuote();
  }, []);

  if (!user) return null;

  const usageText = user.maxResponses === 999999 ? `${user.responsesUsed} / ∞` : `${user.responsesUsed} / ${user.maxResponses}`;

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible" 
      className="space-y-10 md:space-y-16 pb-24 md:pb-0"
    >
      <motion.section variants={itemVariants} className="bg-[#1B4332] text-white p-10 md:p-16 rounded-[3rem] shadow-[0_40px_80px_rgba(27,67,50,0.15)] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 group">
        <div className="relative z-10 flex-1">
          {user.businessName && (
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-green-300">🏢 {user.businessName}</span>
            </div>
          )}
          <h2 className="text-4xl md:text-5xl xl:text-6xl font-black tracking-tighter mb-4 leading-none">Dag, {user.fullName}! 👋</h2>
          <p className="text-green-300 font-medium text-lg md:text-xl opacity-90">Klaar om tijd te besparen?</p>
        </div>
        <Link to="/new" className="relative z-10 bg-[#FFC300] text-[#1B4332] w-full md:w-auto px-10 py-6 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl active:scale-95 hover:scale-105 hover:-rotate-1 transition-all duration-500 flex items-center justify-center gap-4">
          <span className="text-2xl">✍️</span><span>Nieuw bericht</span>
        </Link>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-white/5 rounded-full blur-[100px]"></div>
      </motion.section>

      <motion.section variants={itemVariants}>
        <div className="bg-white p-10 md:p-14 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl">⏱️</span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Quote van de dag</span>
          </div>
          {quoteLoading ? <div className="h-16 w-full bg-gray-50 animate-pulse rounded-2xl"></div> : <p className="text-xl md:text-2xl font-black italic text-[#1B4332] leading-tight tracking-tight">"{quote}"</p>}
        </div>
      </motion.section>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        <StatCard label="Gebruik" value={usageText} icon="📊" color="bg-green-50 text-green-700" />
        <StatCard label="Winst" value={`${user.timeSaved || 0}m`} icon="⏳" color="bg-blue-50 text-blue-700" />
        <StatCard label="Plan" value={user.plan} icon="💎" color="bg-yellow-50 text-yellow-700" />
      </motion.div>

      <motion.section variants={itemVariants}>
        <div className="flex justify-between items-end mb-8 px-4">
          <div>
            <h3 className="text-3xl font-black text-[#1B4332] tracking-tighter">Recent Werk</h3>
          </div>
          <Link to="/history" className="text-[#2D6A4F] text-[10px] font-black uppercase tracking-widest hover:translate-x-1 transition-transform inline-flex items-center gap-2 bg-green-50 px-6 py-3 rounded-full border border-green-100">Alle <span>&rarr;</span></Link>
        </div>
        
        {history.length === 0 ? (
          <div className="bg-white p-20 md:p-32 rounded-[3.5rem] border border-gray-100 text-center">
            <p className="text-gray-400 font-bold mb-10 text-lg italic">Nog geen antwoorden gegenereerd.</p>
            <Link to="/new" className="inline-block bg-[#1B4332] text-white px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-[#2D6A4F] transition-all">Start nu</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {history.slice(0, 4).map((item) => (
              <motion.div whileHover={{ y: -5 }} key={item.id}>
                <Link to="/history" className="bg-white p-8 md:p-10 rounded-[3rem] border border-gray-50 hover:border-green-100 hover:shadow-2xl transition-all duration-500 group shadow-sm flex flex-col gap-6">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-black text-green-700 bg-green-50 px-4 py-2 rounded-xl uppercase tracking-widest">{item.intent}</span>
                    <span className="text-[9px] text-gray-300 font-black uppercase">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-base md:text-lg text-gray-600 line-clamp-2 italic font-medium leading-relaxed group-hover:text-[#1B4332]">"{item.originalMessage}"</p>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>
    </motion.div>
  );
};

const StatCard = ({ label, value, icon, color }: any) => (
  <motion.div whileHover={{ y: -8 }} className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-gray-50 relative overflow-hidden">
    <div className="relative z-10 flex items-center gap-6">
      <div className={`w-16 h-16 ${color} rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner shrink-0 border border-black/5`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">{label}</p>
        <p className="text-3xl md:text-4xl font-black text-[#1B4332] leading-none tracking-tighter break-words">{value}</p>
      </div>
    </div>
  </motion.div>
);

export default Dashboard;
