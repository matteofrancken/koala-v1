
import React, { useState } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, PlanType } from '../types';
import { KoalaIcon } from '../constants';
import { backendService } from '../services/backend';

interface SettingsProps {
  user: User | null;
  onUpdate: (user: User) => void;
  onLogout?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdate, onLogout }) => {
  if (!user) return null;

  const navigate = useNavigate();
  const location = useLocation();
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [message, setMessage] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOverlayActive = location.pathname.split('/').length > 2 || isConfirmingDelete || showSupportModal;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ ...user, fullName, email });
    setMessage('Gegevens succesvol bijgewerkt!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await backendService.deleteAccount(user.id, user.email);
      onLogout?.();
    } catch (error) {
      alert("Er is een fout opgetreden bij het verwijderen van je account.");
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-28 px-2 space-y-10 md:space-y-16">
      <div className={`space-y-10 md:space-y-16 transition-all duration-700 ${isOverlayActive ? 'blur-md scale-[0.98] opacity-60 pointer-events-none' : ''}`}>
        
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-[#1B4332] tracking-tighter mb-2">Instellingen</h1>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Beheer je account en voorkeuren</p>
        </div>

        {/* PROFIEL SECTIE */}
        <section className="bg-white p-10 md:p-16 rounded-[3.5rem] shadow-sm border border-gray-100">
          <h2 className="text-2xl font-black mb-10 tracking-tight text-[#1B4332]">Mijn Profiel</h2>
          <form onSubmit={handleSave} className="space-y-8">
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase text-gray-300 mb-2 tracking-[0.2em] px-2">Volledige naam</label>
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                className="w-full px-8 py-5 rounded-2xl border-2 border-transparent bg-gray-50 focus:bg-white focus:border-[#2D6A4F] outline-none font-bold text-gray-700 shadow-inner transition-all text-lg" 
              />
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase text-gray-300 mb-2 tracking-[0.2em] px-2">E-mailadres</label>
              <input 
                type="email" 
                value={email} 
                readOnly 
                className="w-full px-8 py-5 rounded-2xl border-2 border-transparent bg-gray-100 text-gray-400 font-bold shadow-inner cursor-not-allowed text-lg" 
              />
            </div>
            {message && <div className="p-5 bg-green-50 text-green-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-green-100 text-center animate-in zoom-in-95">{message}</div>}
            <button type="submit" className="w-full bg-[#1B4332] text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-[#2D6A4F] active:scale-95 transition-all">
              Opslaan & Bijwerken
            </button>
          </form>
        </section>

        {/* SUPPORT SECTIE */}
        <section className="bg-white p-10 md:p-16 rounded-[3.5rem] shadow-sm border border-gray-100 space-y-10">
          <h2 className="text-3xl font-black tracking-tight text-[#1B4332]">Support</h2>
          <button 
            onClick={() => setShowSupportModal(true)}
            className="w-full flex items-center justify-between px-8 py-7 bg-gray-50/50 rounded-[1.5rem] border border-gray-100 hover:bg-white hover:border-[#2D6A4F]/20 transition-all group shadow-sm"
          >
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-500">Contacteer ons</span>
            <span className="text-xl opacity-60 group-hover:scale-125 transition-transform">📧</span>
          </button>
        </section>

        {/* JURIDISCH SECTIE */}
        <section className="bg-white p-10 md:p-16 rounded-[3.5rem] shadow-sm border border-gray-100 space-y-10">
          <h2 className="text-3xl font-black tracking-tight text-[#1B4332]">Juridisch</h2>
          <div className="space-y-4">
            <LegalLink to="terms" label="Gebruiksvoorwaarden" />
            <LegalLink to="privacy" label="Privacybeleid" />
            <LegalLink to="eula" label="EULA" />
            <LegalLink to="ai-transparency" label="AI-transparantieverklaring" />
          </div>
        </section>

        <section className="bg-white p-10 md:p-16 rounded-[3.5rem] shadow-sm border border-gray-100">
          <button onClick={() => onLogout?.()} className="w-full flex items-center justify-center gap-4 py-6 bg-red-50 text-red-600 rounded-[2rem] font-black uppercase tracking-widest text-[11px] border border-red-100 active:scale-95 shadow-lg hover:bg-red-100 transition-all">
            <span>🚪</span><span>Uitloggen uit Koala</span>
          </button>
        </section>

        <div className="p-12 text-center">
          <button 
            onClick={() => setIsConfirmingDelete(true)}
            className="text-gray-300 text-[10px] font-black uppercase tracking-widest border-b border-gray-200 pb-1 hover:text-red-400 hover:border-red-200 transition-all"
          >
            Mijn account definitief verwijderen
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isConfirmingDelete && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6 bg-[#1B4332]/40 backdrop-blur-2xl">
            <div className="absolute inset-0" onClick={() => setIsConfirmingDelete(false)}></div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md bg-white p-12 rounded-[3.5rem] shadow-2xl border border-red-50 relative text-center"
            >
              <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-10 shadow-inner">⚠️</div>
              <h2 className="text-3xl font-black mb-6 tracking-tight text-red-600 uppercase">Ben je zeker?</h2>
              <p className="text-gray-500 mb-12 font-medium text-base leading-relaxed">Accountverwijdering is definitief.</p>
              <div className="space-y-4">
                <button onClick={handleDeleteAccount} className="w-full bg-red-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl">{isDeleting ? 'Bezig...' : 'Ja, verwijder mijn account'}</button>
                <button onClick={() => setIsConfirmingDelete(false)} className="w-full py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Annuleren</button>
              </div>
            </motion.div>
          </div>
        )}

        {showSupportModal && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6 bg-[#1B4332]/30 backdrop-blur-2xl">
            <div className="absolute inset-0" onClick={() => setShowSupportModal(false)}></div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-white p-14 rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.25)] border border-gray-50 relative text-center"
            >
              <div className="w-24 h-24 bg-green-50/50 text-[#1B4332] rounded-[2.5rem] flex items-center justify-center text-4xl mx-auto mb-10 shadow-inner">✉️</div>
              <h2 className="text-[22px] font-black mb-6 tracking-tighter text-[#1B4332] uppercase">Support</h2>
              <p className="text-gray-500 mb-12 font-medium text-lg leading-relaxed tracking-tight">info@koala-ai.be</p>
              <button 
                onClick={() => setShowSupportModal(false)} 
                className="w-full bg-[#1B4332] text-white py-6 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 transition-all"
              >
                SLUITEN
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Outlet />
    </div>
  );
};

const LegalLink = ({ to, label }: { to: string; label: string }) => (
  <Link 
    to={to} 
    className="w-full flex items-center justify-between px-8 py-7 bg-gray-50/50 rounded-[1.5rem] border border-gray-100 hover:bg-white hover:border-[#2D6A4F]/20 transition-all group shadow-sm"
  >
    <span className="text-[11px] font-black uppercase tracking-widest text-gray-500">{label}</span>
    <span className="text-gray-300 group-hover:translate-x-1 transition-transform">→</span>
  </Link>
);

export default Settings;
