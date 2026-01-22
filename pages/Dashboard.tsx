
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { User, GeneratedResponse } from '../types';
import { generateDailyQuote } from '../services/ai';
import { KoalaIcon } from '../constants';

interface DashboardProps {
  user: User | null;
  history: GeneratedResponse[];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
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
  const needsPersonalization = !user.businessName || user.businessName.trim() === '';

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible" 
      className="space-y-8 md:space-y-12 pb-24 md:pb-0 w-full overflow-x-hidden relative"
    >
      {/* --- PERSONALIZATION REMINDER --- */}
      {needsPersonalization && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FFC300]/10 border-2 border-[#FFC300]/20 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm"
        >
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="text-2xl">✨</div>
            <div>
              <p className="text-[#1B4332] font-black uppercase text-[11px] tracking-widest">Personaliseer Koala</p>
              <p className="text-gray-500 font-bold text-[10px] uppercase tracking-tight">Vul in de instellingen uw bedrijfsnaam in. Zo kan Koala uw berichten personaliseren.</p>
            </div>
          </div>
          <Link 
            to="/settings" 
            className="bg-[#1B4332] text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg hover:bg-[#2D6A4F] transition-all whitespace-nowrap"
          >
            Ga naar instellingen
          </Link>
        </motion.div>
      )}

      {/* --- HERO --- */}
      <motion.section 
        variants={itemVariants} 
        className="relative bg-[#113225] text-white rounded-[2.5rem] md:rounded-[4rem] shadow-2xl overflow-hidden min-h-[400px] lg:min-h-[450px] flex flex-col justify-end p-8 md:p-16"
      >
        {/* Background Vibe Image */}
        {user.businessVibeUrl ? (
          <div className="absolute inset-0 z-0">
            <motion.img 
              initial={{ scale: 1.05, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2 }}
              src={user.businessVibeUrl} 
              className="w-full h-full object-cover object-center" 
              alt="Dashboard vibe" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#113225]/90 via-[#113225]/30 to-transparent md:bg-gradient-to-r md:from-[#113225]/80 md:via-[#113225]/20 md:to-transparent"></div>
          </div>
        ) : (
          <div className="absolute inset-0 z-0 opacity-10 flex items-center justify-center">
             <KoalaIcon className="w-64 h-64" />
          </div>
        )}

        {/* Content Layer */}
        <div className="relative z-10 space-y-4 md:space-y-6 max-w-3xl">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] drop-shadow-md">
              Welkom terug, {user.fullName.split(' ')[0]}
            </h2>
          </div>

          <div className="inline-flex items-center bg-white/10 backdrop-blur-xl px-5 py-2 rounded-2xl border border-white/20 shadow-lg">
            <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.15em] text-[#FFC300]">
              Laat Koala je e-mails schrijven en bespaar uw tijd!
            </span>
          </div>
        </div>
      </motion.section>

      {/* --- QUICK ACTION SECTION --- */}
      <motion.section variants={itemVariants} className="px-1 flex flex-col md:flex-row gap-4">
        <Link 
          to="/new" 
          className="flex-1 bg-[#FFC300] text-[#1B4332] p-8 md:p-10 rounded-[2.5rem] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-between group border-4 border-white"
        >
          <div className="space-y-1">
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter">Nieuw bericht</h3>
            <p className="text-[10px] font-bold uppercase opacity-60 tracking-widest">Start direct een generatie</p>
          </div>
          <span className="text-4xl group-hover:rotate-12 transition-transform">✍️</span>
        </Link>
        
        <Link 
          to="/history" 
          className="flex-1 bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 hover:border-green-100 transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <h3 className="text-xl md:text-2xl font-black text-[#1B4332] uppercase tracking-tighter">Historiek</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bekijk je vorige werk</p>
          </div>
          <span className="text-4xl grayscale group-hover:grayscale-0 transition-all">📜</span>
        </Link>
      </motion.section>

      {/* Quote Section */}
      <motion.section variants={itemVariants} className="px-1">
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-500">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center text-base">💡</div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300">Quote van de dag</span>
          </div>
          {quoteLoading ? (
            <div className="space-y-2">
              <div className="h-5 w-3/4 bg-gray-50 animate-pulse rounded-lg"></div>
              <div className="h-5 w-1/2 bg-gray-50 animate-pulse rounded-lg"></div>
            </div>
          ) : (
            <p className="text-lg md:text-2xl font-black italic text-[#1B4332] leading-tight tracking-tight">"{quote}"</p>
          )}
        </div>
      </motion.section>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 px-1">
        <StatCard label="Verbruik" value={usageText} icon="📊" color="bg-green-50 text-green-700" />
        <StatCard label="Tijd Bespaard" value={`${user.timeSaved || 0}m`} icon="⏳" color="bg-blue-50 text-blue-700" />
        <StatCard label="Abonnement" value={user.plan} icon="💎" color="bg-yellow-50 text-yellow-700" />
      </motion.div>

      {/* Recent Work Section */}
      <motion.section variants={itemVariants} className="px-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 px-4">
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-[#1B4332] tracking-tight">Recente generaties</h3>
          </div>
        </div>
        
        {history.length === 0 ? (
          <div className="bg-white p-16 md:p-24 rounded-[3rem] border border-gray-100 text-center shadow-sm">
            <p className="text-gray-400 font-bold mb-8 text-base italic">Nog geen antwoorden gegenereerd.</p>
            <Link to="/new" className="inline-block bg-[#1B4332] text-white px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-[#2D6A4F] transition-all">Start je eerste bericht</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {history.slice(0, 4).map((item) => (
              <motion.div whileHover={{ y: -5 }} key={item.id}>
                <Link to="/history" className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-50 hover:border-green-100 hover:shadow-xl transition-all duration-300 group shadow-sm flex flex-col gap-5 h-full">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-black text-green-700 bg-green-50 px-4 py-2 rounded-xl border border-green-100 group-hover:bg-[#2D6A4F] group-hover:text-white transition-all duration-300">{item.intent}</span>
                    <span className="text-[9px] text-gray-300 font-black uppercase">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-base text-gray-600 line-clamp-3 italic font-medium leading-relaxed group-hover:text-[#1B4332]">"{item.originalMessage}"</p>
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
  <motion.div whileHover={{ y: -5 }} className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-50 relative overflow-hidden group">
    <div className="relative z-10 flex items-center gap-6">
      <div className={`w-14 h-14 md:w-16 md:h-16 ${color} rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-inner shrink-0 border border-black/5`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-black uppercase text-gray-400 mb-1 tracking-widest">{label}</p>
        <p className="text-2xl md:text-3xl font-black text-[#1B4332] leading-none tracking-tight break-words">{value}</p>
      </div>
    </div>
  </motion.div>
);

export default Dashboard;
