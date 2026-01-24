
import React, { useState } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, PlanType } from '../types';
import { KoalaIcon } from '../constants';
import { backendService } from '../services/backend';
import { GoogleGenAI } from "@google/genai";
import { stripeService } from '../services/stripe';

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
  const [businessName, setBusinessName] = useState(user.businessName);
  const [message, setMessage] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  
  const [regeneratingVibe, setRegeneratingVibe] = useState(false);
  const [tempVibeUrl, setTempVibeUrl] = useState<string | undefined>(user.businessVibeUrl);
  const [hasNewGeneration, setHasNewGeneration] = useState(false);

  // Juridische documenten paden
  const isJuridicalOpen = location.pathname.includes('/terms') || 
                          location.pathname.includes('/privacy') || 
                          location.pathname.includes('/eula') || 
                          location.pathname.includes('/ai-transparency');
  
  // Alleen dimmen voor kritieke systeem-overlays (verwijderen/support)
  // De juridische documenten (isJuridicalOpen) worden NIET meer toegevoegd aan de blur-logica
  const isOverlayActive = isConfirmingDelete || showSupportModal;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = { ...user, fullName, email, businessName };
    await onUpdate(updatedUser);
    setMessage('Profielgegevens definitief opgeslagen! ✅');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleOpenPortal = async () => {
    if (!user.stripeCustomerId) {
      alert("Er is geen actief betaald abonnement gevonden voor dit account. Upgrade eerst je plan.");
      navigate('/pricing');
      return;
    }
    
    setPortalLoading(true);
    try {
      const session = await stripeService.createPortalSession(user.stripeCustomerId);
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error("Geen portaal URL ontvangen.");
      }
    } catch (err: any) {
      console.error("[Settings] Portaal fout:", err);
      alert("Fout bij het openen van het Stripe portaal. Probeer het later opnieuw.");
    } finally {
      setPortalLoading(false);
    }
  };

  const handleGenerateVibe = async () => {
    setRegeneratingVibe(true);
    setMessage('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `A professional high-end 3D minimalist illustration of a cute, friendly koala sitting in a modern high-end minimalist corporate office. The image MUST contain NO text. Clean Belgian aesthetic, soft lighting, green and white color palette. 16:9 aspect ratio.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const newUrl = `data:image/png;base64,${part.inlineData.data}`;
          setTempVibeUrl(newUrl);
          setHasNewGeneration(true);
          break;
        }
      }
    } catch (err) {
      console.error("Vibe generation failed", err);
    } finally {
      setRegeneratingVibe(false);
    }
  };

  const handleSaveVibe = async () => {
    if (!tempVibeUrl) return;
    const updatedUser = { ...user, businessVibeUrl: tempVibeUrl };
    await onUpdate(updatedUser);
    setHasNewGeneration(false);
    setMessage('Jouw Koala Vibe is definitief opgeslagen! ✨');
    setTimeout(() => setMessage(''), 5000);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await backendService.deleteAccount(user.id, user.email);
      onLogout?.();
    } catch (error) {
      alert("Er is een fout opgetreden.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-32 px-4 space-y-8 md:space-y-12 relative">
      {/* Container die alleen dimt/blurrt bij kritieke popups, niet bij documenten */}
      <div className={`space-y-8 md:space-y-12 transition-all duration-700 ease-in-out ${isOverlayActive ? 'opacity-70 pointer-events-none' : ''}`}>
        
        {/* --- HEADER --- */}
        <header className="px-1 text-center md:text-left">
          <h1 className="text-3xl md:text-6xl font-black text-[#1B4332] tracking-tighter mb-2">Instellingen</h1>
          <p className="text-[10px] md:text-[12px] font-black uppercase text-gray-400 tracking-widest">Beheer je account en uitstraling</p>
        </header>

        {/* --- VIBE SECTION --- */}
        <section className="bg-[#113225] rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-green-900/10">
          <div className="relative z-10 space-y-10 flex flex-col items-center">
            <div className="space-y-8 flex flex-col items-center w-full max-w-2xl text-center">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none uppercase">Jouw <span className="text-[#FFC300]">Koala Vibe</span>.</h2>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-2 w-full justify-center">
                <button 
                  onClick={handleGenerateVibe} 
                  disabled={regeneratingVibe} 
                  className="flex-1 bg-white/10 backdrop-blur-xl text-white border border-white/20 px-10 py-6 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-lg active:scale-95 disabled:opacity-50 transition-all hover:bg-white/20"
                >
                  {regeneratingVibe ? 'Bezig...' : 'Genereer Vibe'}
                </button>
                {hasNewGeneration && (
                  <button 
                    onClick={handleSaveVibe} 
                    className="flex-1 bg-[#FFC300] text-[#1B4332] px-10 py-6 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 transition-all border-4 border-white/20"
                  >
                    Opslaan ✅
                  </button>
                )}
              </div>
            </div>
            
            <div className="w-full aspect-video rounded-[2.5rem] md:rounded-[4rem] bg-black/20 border border-white/10 overflow-hidden shadow-inner relative group ring-1 ring-white/10">
              {tempVibeUrl ? (
                <img src={tempVibeUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Vibe preview" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                   <KoalaIcon className="w-32 h-32 grayscale" />
                </div>
              )}
            </div>
          </div>
        </section>

        {message && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-[#1B4332] text-white rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.2em] text-center shadow-2xl border border-white/10">
            {message}
          </motion.div>
        )}

        {/* --- PROFILE FORM --- */}
        <section className="bg-white p-10 md:p-16 rounded-[3rem] md:rounded-[4rem] shadow-sm border border-gray-50 group hover:shadow-2xl transition-all duration-500">
          <div className="flex items-center gap-5 mb-12">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-green-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-green-100">👤</div>
            <h2 className="text-2xl md:text-4xl font-black tracking-tighter text-[#1B4332] uppercase">Profiel & Bedrijf</h2>
          </div>
          <form onSubmit={handleSaveProfile} className="space-y-10 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] px-2">Volledige naam</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-8 py-6 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#2D6A4F] focus:bg-white outline-none font-bold text-gray-800 transition-all text-lg shadow-inner" required />
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] px-2">Bedrijfsnaam</label>
                <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full px-8 py-6 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#2D6A4F] focus:bg-white outline-none font-bold text-gray-800 transition-all text-lg shadow-inner" required />
              </div>
            </div>
            <div className="pt-4">
              <button type="submit" className="w-full sm:w-auto bg-[#1B4332] text-white px-16 py-6 rounded-[2rem] font-black uppercase tracking-widest text-[12px] shadow-xl hover:bg-[#2D6A4F] transition-all active:scale-95">Profiel Opslaan ✅</button>
            </div>
          </form>
        </section>

        {/* --- SUBSCRIPTION --- */}
        <section className="bg-white p-10 md:p-14 rounded-[3rem] md:rounded-[4rem] shadow-sm border border-gray-50 flex flex-col md:flex-row items-center justify-between gap-10 group hover:shadow-2xl transition-all duration-500">
          <div className="flex items-center gap-8 text-center md:text-left">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-green-50 rounded-[2.5rem] flex items-center justify-center text-4xl border border-green-100 shadow-inner group-hover:scale-105 transition-transform duration-500">💎</div>
            <div className="space-y-2">
              <h3 className="font-black text-[#1B4332] uppercase text-2xl md:text-4xl tracking-tighter leading-none">{user.plan} Plan</h3>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Status: <span className="text-[#2D6A4F]">{user.subscriptionStatus || 'Actief'}</span></p>
            </div>
          </div>
          <button 
            onClick={handleOpenPortal}
            disabled={portalLoading}
            className="w-full md:w-auto px-12 py-6 bg-[#1B4332] text-white rounded-[2rem] font-black uppercase text-[12px] tracking-widest hover:bg-[#2D6A4F] transition-all shadow-xl flex items-center justify-center gap-4 active:scale-95"
          >
            {portalLoading ? 'Laden...' : 'Beheer Abonnement'}
          </button>
        </section>

        {/* --- SUPPORT --- */}
        <button 
          onClick={() => setShowSupportModal(true)} 
          className="w-full bg-white p-12 md:p-14 rounded-[3rem] md:rounded-[4rem] shadow-sm border border-gray-50 flex items-center group hover:shadow-2xl transition-all duration-500"
        >
          <div className="flex items-center gap-8">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-3xl group-hover:bg-green-50 transition-colors shadow-inner">✉️</div>
            <div className="text-left">
              <h4 className="text-xl md:text-3xl font-black text-[#1B4332] uppercase tracking-tighter">Support nodig?</h4>
              <p className="text-[10px] md:text-[12px] font-black text-gray-300 uppercase tracking-widest">We helpen je graag verder</p>
            </div>
          </div>
        </button>

        {/* --- LEGAL & EXIT --- */}
        <div className="space-y-10">
          <section className="bg-white p-10 md:p-14 rounded-[3rem] md:rounded-[4rem] shadow-sm border border-gray-50 space-y-6">
             <header className="px-2 mb-4">
                <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Juridische documentatie</h4>
             </header>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LegalLink to="terms" label="Gebruiksvoorwaarden" />
                <LegalLink to="privacy" label="Privacybeleid" />
                <LegalLink to="ai-transparency" label="AI Transparantie" />
                <LegalLink to="eula" label="EULA Overeenkomst" />
             </div>
          </section>
          
          <div className="flex flex-col sm:flex-row gap-8 pt-8 items-center justify-center">
            <button onClick={() => onLogout?.()} className="w-full sm:w-auto px-16 py-6 bg-gray-100 text-gray-400 rounded-3xl font-black uppercase tracking-widest text-[11px] hover:bg-gray-200 hover:text-gray-600 transition-all active:scale-95 shadow-sm">Uitloggen</button>
            <button onClick={() => setIsConfirmingDelete(true)} className="text-red-300 hover:text-red-500 text-[10px] font-black uppercase tracking-[0.4em] transition-colors py-4 px-10">Account Verwijderen</button>
          </div>
        </div>
      </div>

      {/* --- OVERLAYS --- */}
      <AnimatePresence>
        {isConfirmingDelete && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-6 bg-[#1B4332]/40 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0" 
              onClick={() => setIsConfirmingDelete(false)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 30 }} 
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-white p-14 rounded-[4rem] shadow-2xl text-center relative z-10 border border-white"
            >
              <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-10 shadow-inner">⚠️</div>
              <h2 className="text-3xl font-black mb-4 text-[#1B4332] uppercase tracking-tighter">Zeker weten?</h2>
              <p className="text-gray-400 mb-12 font-bold text-sm leading-relaxed uppercase tracking-tight px-4">Dit verwijdert al je data, historiek en instellingen definitief uit onze systemen. Er is geen weg terug.</p>
              <div className="space-y-6">
                <button onClick={handleDeleteAccount} className="w-full bg-red-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-red-700 transition-all active:scale-95">{isDeleting ? 'Bezig...' : 'Ja, verwijder alles'}</button>
                <button onClick={() => setIsConfirmingDelete(false)} className="w-full text-gray-300 font-black uppercase tracking-widest text-[10px] py-4 hover:text-[#1B4332] transition-colors">Ik wil blijven</button>
              </div>
            </motion.div>
          </div>
        )}
        {showSupportModal && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-6 bg-[#1B4332]/40 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0" 
              onClick={() => setShowSupportModal(false)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 30 }} 
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-white p-16 rounded-[4.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.15)] text-center relative z-10 border border-white"
            >
              <div className="w-24 h-24 bg-green-50 text-[#1B4332] rounded-full flex items-center justify-center text-5xl mx-auto mb-10 shadow-inner">✉️</div>
              <h2 className="text-3xl font-black mb-4 text-[#1B4332] uppercase tracking-tighter">Support</h2>
              <div className="py-6 mb-8">
                <p className="text-gray-700 font-black text-2xl tracking-tight mb-2">info@koala-ai.be</p>
                <p className="text-gray-300 text-[11px] font-black uppercase tracking-[0.3em]">Antwoord binnen de 24 uur</p>
              </div>
              <button onClick={() => setShowSupportModal(false)} className="w-full bg-[#1B4332] text-white py-7 rounded-[2rem] font-black uppercase tracking-widest text-[12px] shadow-2xl active:scale-95 transition-all">SLUITEN</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Juridische documenten overlays: Geen blur/pointer-events-none meer op de achtergrond content */}
      <AnimatePresence>
        {isJuridicalOpen && (
          <div className="fixed inset-0 z-[1300] bg-black/10 overflow-hidden flex items-center justify-center pointer-events-auto">
             <Outlet />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LegalLink = ({ to, label }: { to: string; label: string }) => (
  <Link to={to} className="w-full flex items-center px-10 py-6 bg-gray-50/50 rounded-2xl md:rounded-3xl border border-gray-100 hover:bg-white transition-all group shadow-sm hover:shadow-md">
    <span className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-500 group-hover:text-[#1B4332] transition-colors">{label}</span>
  </Link>
);

export default Settings;
