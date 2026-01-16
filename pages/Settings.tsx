
import React, { useState } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, PlanType } from '../types';
import { KoalaIcon } from '../constants';
import { backendService } from '../services/backend';
import { GoogleGenAI } from "@google/genai";

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
  
  // Vibe Creator States
  const [regeneratingVibe, setRegeneratingVibe] = useState(false);
  const [tempVibeUrl, setTempVibeUrl] = useState<string | undefined>(user.businessVibeUrl);
  const [hasNewGeneration, setHasNewGeneration] = useState(false);

  const isOverlayActive = location.pathname.split('/').length > 2 || isConfirmingDelete || showSupportModal;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = { ...user, fullName, email, businessName };
    // Direct persist via onUpdate die backendService.saveUser aanroept
    await onUpdate(updatedUser);
    setMessage('Profielgegevens definitief opgeslagen! ✅');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleGenerateVibe = async () => {
    setRegeneratingVibe(true);
    setMessage('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Ultra-strikte prompt voor pure visuele output zonder teksthallucinaties
      const prompt = `A professional high-end 3D minimalist illustration of a cute, friendly koala sitting in a modern high-end minimalist corporate office. The image MUST contain NO text, NO letters, NO slogans, NO numbers, and NO signs on the walls. Purely visual scenery. Clean Belgian aesthetic, soft lighting, green and white color palette. 16:9 aspect ratio. High quality.`;
      
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
      alert("Er ging iets mis bij het genereren. Probeer het opnieuw.");
    } finally {
      setRegeneratingVibe(false);
    }
  };

  const handleSaveVibe = async () => {
    if (!tempVibeUrl) return;
    
    // Definitief opslaan in profiel en database
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
      alert("Er is een fout opgetreden bij het verwijderen van je account.");
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-28 px-4 space-y-8 md:space-y-12">
      <div className={`space-y-8 md:space-y-12 transition-all duration-700 ${isOverlayActive ? 'blur-md scale-[0.98] opacity-60 pointer-events-none' : ''}`}>
        
        <div className="px-1">
          <h1 className="text-3xl md:text-5xl font-black text-[#1B4332] tracking-tighter mb-2">Instellingen</h1>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Beheer je account en uitstraling</p>
        </div>

        {/* MAGIC VIBE PERSONALISATIE */}
        <section className="bg-[#113225] rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                Jouw <span className="text-[#FFC300]">Koala Vibe</span>.
              </h2>
              <p className="text-green-200 text-xs md:text-sm font-medium opacity-80 leading-relaxed max-w-lg">
                Genereer een unieke sfeerimpressie voor je dashboard.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button 
                  onClick={handleGenerateVibe}
                  disabled={regeneratingVibe}
                  className="flex-1 bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 disabled:opacity-50 transition-all hover:bg-white/20"
                >
                  {regeneratingVibe ? 'Bezig...' : (tempVibeUrl ? 'Opnieuw genereren ✨' : 'Genereer Vibe ✨')}
                </button>
                
                {hasNewGeneration && (
                  <button 
                    onClick={handleSaveVibe}
                    className="flex-1 bg-[#FFC300] text-[#1B4332] px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all border-2 border-white/20"
                  >
                    Opslaan ✅
                  </button>
                )}
              </div>
            </div>

            <div className="w-full aspect-video rounded-2xl md:rounded-[2.5rem] bg-black/20 border border-white/10 flex items-center justify-center overflow-hidden shadow-inner group relative">
              {tempVibeUrl ? (
                <img 
                  src={tempVibeUrl} 
                  className="w-full h-full object-cover transition-transform duration-700" 
                  alt="Vibe preview" 
                />
              ) : (
                <div className="text-center p-6 opacity-40 flex flex-col items-center gap-3">
                  <div className="text-4xl">🐨</div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em]">Klik op genereren om te starten</p>
                </div>
              )}
              {regeneratingVibe && (
                <div className="absolute inset-0 bg-[#113225]/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/5 rounded-full blur-[80px] pointer-events-none"></div>
        </section>

        {message && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="p-5 bg-[#1B4332] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest text-center shadow-xl border border-white/10"
          >
            {message}
          </motion.div>
        )}

        {/* ACCOUNT GEGEVENS */}
        <section className="bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-sm border border-gray-100">
          <h2 className="text-xl md:text-2xl font-black mb-8 tracking-tight text-[#1B4332]">Profiel & Bedrijf</h2>
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[9px] font-black uppercase text-gray-400 tracking-widest px-2">Volledige naam</label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-[#2D6A4F] focus:bg-white outline-none font-bold text-gray-700 transition-all text-sm" 
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[9px] font-black uppercase text-gray-400 tracking-widest px-2">Bedrijfsnaam (Dashboard display)</label>
                <input 
                  type="text" 
                  value={businessName} 
                  onChange={(e) => setBusinessName(e.target.value)} 
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-[#2D6A4F] focus:bg-white outline-none font-bold text-gray-700 transition-all text-sm" 
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[9px] font-black uppercase text-gray-400 tracking-widest px-2">E-mailadres</label>
                <input 
                  type="email" 
                  value={email} 
                  readOnly 
                  className="w-full px-6 py-4 rounded-xl bg-gray-100 text-gray-400 font-bold cursor-not-allowed text-sm" 
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-[#1B4332] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-[#2D6A4F] transition-all">
              Profiel Opslaan ✅
            </button>
          </form>
        </section>

        {/* ABONNEMENT EN SUPPORT */}
        <div className="space-y-4 md:space-y-6">
          <div className="bg-white p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-2xl border border-green-100 shrink-0">💎</div>
              <div>
                <h3 className="font-black text-[#1B4332] uppercase text-sm tracking-tight">{user.plan} Plan</h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Status: Actief</p>
              </div>
            </div>
            <Link to="/pricing" className="w-full sm:w-auto px-8 py-3.5 bg-gray-50 text-gray-400 rounded-xl font-black uppercase text-[9px] tracking-widest hover:text-[#1B4332] transition-colors text-center border border-gray-100">Beheer Plan</Link>
          </div>

          <button 
            onClick={() => setShowSupportModal(true)}
            className="w-full bg-white p-7 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between group hover:border-[#2D6A4F]/20 transition-all"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Support nodig?</span>
            <span className="text-xl group-hover:scale-110 transition-transform">✉️</span>
          </button>
        </div>

        {/* JURIDISCH & ACCOUNT ACTIES */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 space-y-3">
             <LegalLink to="terms" label="Voorwaarden" />
             <LegalLink to="privacy" label="Privacy" />
             <LegalLink to="ai-transparency" label="AI Transparantie" />
          </section>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => onLogout?.()} className="w-full py-5 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-transparent hover:bg-gray-100 transition-all">
              Uitloggen
            </button>
            <button onClick={() => setIsConfirmingDelete(true)} className="w-full py-5 text-red-300 hover:text-red-500 text-[9px] font-black uppercase tracking-[0.2em] transition-colors">
              Account Verwijderen
            </button>
          </div>
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
              className="w-full max-w-md bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl border border-red-50 relative text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-8 shadow-inner">⚠️</div>
              <h2 className="text-xl md:text-2xl font-black mb-4 tracking-tight text-red-600 uppercase">Zeker weten?</h2>
              <p className="text-gray-500 mb-10 font-medium text-sm leading-relaxed">Dit verwijdert al je data definitief uit onze systemen.</p>
              <div className="space-y-4">
                <button onClick={handleDeleteAccount} className="w-full bg-red-600 text-white py-5 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl">{isDeleting ? 'Bezig...' : 'Ja, verwijder alles'}</button>
                <button onClick={() => setIsConfirmingDelete(false)} className="w-full py-4 text-[9px] font-black uppercase text-gray-400 tracking-widest">Annuleren</button>
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
              className="w-full max-sm bg-white p-12 rounded-[3rem] shadow-2xl border border-gray-50 relative text-center"
            >
              <div className="w-16 h-16 bg-green-50 text-[#1B4332] rounded-[1.5rem] flex items-center justify-center text-3xl mx-auto mb-8 shadow-inner">✉️</div>
              <h2 className="text-xl font-black mb-4 tracking-tighter text-[#1B4332] uppercase">Support</h2>
              <p className="text-gray-500 mb-10 font-medium text-base tracking-tight">info@koala-ai.be</p>
              <button 
                onClick={() => setShowSupportModal(false)} 
                className="w-full bg-[#1B4332] text-white py-5 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all"
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
    className="w-full flex items-center justify-between px-6 py-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-white hover:border-[#2D6A4F]/20 transition-all group shadow-sm"
  >
    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</span>
    <span className="text-gray-300 group-hover:translate-x-1 transition-transform">→</span>
  </Link>
);

export default Settings;
