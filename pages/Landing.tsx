import React, { useState, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { KoalaIcon, PLANS } from '../constants';
import { User } from '../types';
import { GoogleGenAI } from "@google/genai";

interface LandingProps {
  user: User | null;
}

const Landing: React.FC<LandingProps> = ({ user }) => {
  const location = useLocation();
  const featuresRef = useRef<HTMLElement>(null);
  
  const [vibeImage, setVibeImage] = useState<string | null>(null);
  const [generatingVibe, setGeneratingVibe] = useState(false);
  const [vibeInput, setVibeInput] = useState('');
  
  const overlays = ['terms', 'privacy', 'eula', 'ai-transparency', 'login', 'signup', 'onboarding'];
  const isOverlayPage = overlays.some(o => location.pathname.endsWith(o));
  
  // Specifically for legal/doc overlays to show them centered
  const isDocOverlay = ['terms', 'privacy', 'eula', 'ai-transparency'].some(o => location.pathname.endsWith(o));

  const scrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    featuresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleGenerateVibe = async () => {
    if (!vibeInput.trim()) return;
    setGeneratingVibe(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const prompt = `A minimalist, professional high-quality 3D illustration of a cute, friendly koala sitting in a modern minimalist office. On the wall or a sign, display ONLY the exact text "${vibeInput}". DO NOT add any other words, slogans, or descriptive phrases like "Financial Solutions" or "Services". The style must be clean, Belgian corporate aesthetic, soft lighting, green and white color palette. 16:9 aspect ratio.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });

      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData) {
            setVibeImage(`data:image/png;base64,${part.inlineData.data}`);
            break;
          }
        }
      }
    } catch (err) {
      console.error("Vibe generation failed", err);
    } finally {
      setGeneratingVibe(false);
    }
  };

  const steps = [
    { num: "01", title: "Bericht plakken", desc: "Kopieer de vraag van je klant in Koala." },
    { num: "02", title: "Stijl & Lengte", desc: "Kies de juiste toon en bepaal hoe uitgebreid het bericht mag zijn." },
    { num: "03", title: "Klaar!", desc: "Koala maakt 2 perfecte varianten voor jou." }
  ];

  const features = [
    { emoji: "🧠", title: "Slimme AI‑communicatie", desc: "Bespaar uren per week door Koala je mails te laten schrijven: sneller en consistenter." },
    { emoji: "⚡", title: "Supersnel", desc: "Koala reageert onmiddellijk en is 24/7 beschikbaar voor jouw onderneming." },
    { emoji: "🎨", title: "Alle stijlen + Custom Tone", desc: "Van formeel tot informeel. Gebruik je eigen bedrijfsstijl voor de perfecte match." },
    { emoji: "📚", title: "Volledige historiek", desc: "Koala onthoudt eerdere berichten voor nog betere en consistente antwoorden." },
    { emoji: "🛠️", title: "KMO Focus", desc: "Lokale taal, lokale context. Speciaal gemaakt voor de Vlaamse en Nederlandse markt." },
    { emoji: "🔒", title: "Veilig & Privé", desc: "Jouw data is veilig bij ons. We voldoen aan de strengste privacy-eisen." }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] relative flex flex-col selection:bg-[#2D6A4F] selection:text-white font-sans overflow-x-hidden">
      
      {/* --- BACKGROUND DECORATIONS --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] bg-[#2D6A4F]/5 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 -right-64 w-[700px] h-[700px] bg-[#FFC300]/5 rounded-full blur-[140px]"></div>
      </div>

      <div className={`relative z-10 flex flex-col transition-all duration-700 ${isOverlayPage ? 'opacity-40 pointer-events-none' : ''}`}>
        
        {/* --- NAVIGATION --- */}
        <nav className="w-full max-w-[1400px] mx-auto px-6 md:px-12 py-8 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
              <KoalaIcon className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <span className="text-xl md:text-2xl font-black text-[#1B4332] tracking-tighter uppercase">Koala</span>
          </Link>
          <div className="flex items-center gap-4 md:gap-8">
            {user ? (
              <Link to="/dashboard" className="bg-[#1B4332] text-white px-6 md:px-8 py-3 md:py-4 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#1B4332] transition-colors">Login</Link>
                <Link to="/signup" className="bg-[#1B4332] text-white px-6 md:px-8 py-3 md:py-4 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl">Start gratis</Link>
              </>
            )}
          </div>
        </nav>

        {/* --- HERO SECTION --- */}
        <header className="w-full max-w-[1400px] mx-auto px-6 md:px-12 py-12 md:py-24 lg:py-32 flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center bg-[#2D6A4F]/5 px-4 md:px-5 py-2 rounded-full mb-6 md:mb-8 border border-[#2D6A4F]/10">
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#2D6A4F]">De Vlaamse & Nederlandse KMO Partner</span>
          </motion.div>
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-[#1B4332] leading-[1.1] mb-6 md:mb-8 tracking-tighter">
            Minder typen.<br/><span className="text-[#2D6A4F]">Meer ondernemen.</span>
          </h1>
          <p className="text-base md:text-xl text-gray-500 font-medium mb-10 max-w-2xl leading-relaxed px-4">
            Koala AI geeft elke ondernemer een slimme assistent die moeiteloos professionele communicatie verzorgt. Je zet in enkele seconden sterke, foutloze mails neer en wint zo kostbare tijd terug.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-6 sm:px-0">
            <Link to="/signup" className="bg-[#1B4332] text-white px-10 py-5 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase tracking-widest text-[10px] md:text-[11px] shadow-2xl hover:bg-[#2D6A4F] transition-all">Maak Gratis Account</Link>
            <button 
              onClick={scrollToFeatures}
              className="bg-white text-gray-400 border border-gray-100 px-10 py-5 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase tracking-widest text-[10px] md:text-[11px] hover:text-[#1B4332] transition-all cursor-pointer"
            >
              Ontdek meer
            </button>
          </div>
        </header>

        {/* --- MAGIC VIBE SECTION --- */}
        <section className="py-12 md:py-24">
          <div className="max-w-[1400px] mx-auto px-4 md:px-12">
            <div className="bg-[#1B4332] rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-16 text-white flex flex-col lg:flex-row items-center gap-10 md:gap-16 relative shadow-2xl overflow-hidden">
              <div className="flex-1 space-y-6 md:space-y-8 z-10 text-center lg:text-left">
                <h2 className="text-2xl md:text-5xl font-black tracking-tight leading-[1.1]">
                  Zie de Koala vibe voor <span className="text-[#FFC300]">jouw zaak</span>.
                </h2>
                <p className="text-green-200 text-sm md:text-lg font-medium opacity-80 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Typ je bedrijfsnaam en laat onze AI een unieke illustratie genereren die de rust van Koala naar jouw kantoor brengt.
                </p>
                <div className="flex flex-col sm:flex-row p-1.5 bg-white/10 backdrop-blur-md rounded-2xl md:rounded-[2.5rem] border border-white/20 gap-2">
                  <input 
                    type="text" 
                    placeholder="Naam van je zaak..." 
                    className="bg-transparent flex-1 px-5 py-4 outline-none font-bold text-white placeholder:text-white/30 text-sm md:text-base" 
                    value={vibeInput} 
                    onChange={(e) => setVibeInput(e.target.value)} 
                  />
                  <button 
                    onClick={handleGenerateVibe} 
                    disabled={generatingVibe} 
                    className="bg-[#FFC300] text-[#1B4332] px-8 py-4 rounded-xl md:rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-lg disabled:opacity-50 transition-all"
                  >
                    {generatingVibe ? 'Bezig...' : 'Magie ✨'}
                  </button>
                </div>
              </div>
              <div className="flex-1 w-full aspect-video rounded-2xl md:rounded-[3rem] bg-black/20 border border-white/10 flex items-center justify-center overflow-hidden shadow-inner relative">
                {vibeImage ? (
                  <img src={vibeImage} className="w-full h-full object-cover" alt="AI Vibe" />
                ) : (
                  <div className="text-center p-8 opacity-40 flex flex-col items-center">
                    <KoalaIcon className="w-16 h-16 mb-4 grayscale" noShadow />
                    <p className="text-[10px] font-black uppercase tracking-widest">Jouw AI-kunst verschijnt hier</p>
                  </div>
                )}
                {generatingVibe && (
                  <div className="absolute inset-0 bg-[#1B4332]/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* --- HOW IT WORKS --- */}
        <section id="hoe-werkt-het" className="py-20 md:py-32 bg-white">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-[#1B4332] tracking-tighter mb-16 md:mb-24">Hoe werkt Koala?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12 text-center">
              {steps.map((s, i) => (
                <div key={i} className="space-y-4 md:space-y-6 relative group">
                  <div className="text-7xl md:text-8xl font-black text-[#2D6A4F]/20 leading-none group-hover:text-[#2D6A4F]/30 transition-colors duration-500">{s.num}</div>
                  <h3 className="text-2xl md:text-3xl font-black text-[#1B4332] tracking-tight">{s.title}</h3>
                  <p className="text-gray-500 font-medium text-sm md:text-lg leading-relaxed max-w-xs mx-auto">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- FEATURES --- */}
        <section ref={featuresRef} id="features" className="py-20 md:py-32 max-w-[1400px] mx-auto px-6 scroll-mt-20">
          <div className="text-center mb-16 md:mb-24 px-4">
            <h2 className="text-3xl md:text-5xl font-black text-[#1B4332] tracking-tighter leading-tight">Koala in één oogopslag</h2>
            <div className="h-1 w-20 bg-[#FFC300] mx-auto mt-6 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl md:text-3xl mb-6 group-hover:bg-[#2D6A4F]/5 group-hover:scale-110 transition-all">{f.emoji}</div>
                <h4 className="text-xl md:text-2xl font-black text-[#1B4332] mb-3 tracking-tight">{f.title}</h4>
                <p className="text-gray-500 font-medium text-sm md:text-base leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* --- CTA SECTION --- */}
        <section className="py-20 md:py-32 text-center px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black text-[#1B4332] tracking-tighter mb-10 leading-tight">Klaar voor meer rust?</h2>
            <Link to="/signup" className="inline-block bg-[#1B4332] text-white px-12 py-6 md:py-8 rounded-[2rem] md:rounded-[2.5rem] font-black uppercase tracking-widest text-[11px] md:text-[12px] shadow-2xl hover:scale-105 active:scale-95 transition-all">Start nu gratis &rarr;</Link>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="w-full py-12 md:py-16 px-6 md:px-12 border-t border-gray-100 bg-white">
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3">
                <KoalaIcon className="w-8 h-8 opacity-40 grayscale" />
                <span className="font-black text-gray-300 uppercase tracking-widest text-sm">Koala AI</span>
              </div>
              <p className="text-[9px] md:text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">© 2026 KOALA AI. ALLE RECHTEN VOORBEHOUDEN.</p>
            </div>
            <div className="flex gap-8">
              <Link to="/terms" className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#1B4332]">Voorwaarden</Link>
              <Link to="/privacy" className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#1B4332]">Privacy</Link>
            </div>
          </div>
        </footer>
      </div>

      {/* --- OVERLAY CONTAINER --- */}
      <AnimatePresence>
        {(isDocOverlay || location.pathname.includes('/login') || location.pathname.includes('/signup')) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-[#1B4332]/20 animate-in fade-in duration-300 overflow-hidden">
            <Outlet />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Landing;