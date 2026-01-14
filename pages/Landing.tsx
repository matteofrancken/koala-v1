
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { KoalaIcon, PLANS } from '../constants';
import { User } from '../types';

interface LandingProps {
  user: User | null;
}

const Landing: React.FC<LandingProps> = ({ user }) => {
  const location = useLocation();
  const overlays = ['terms', 'privacy', 'eula', 'ai-transparency', 'login', 'signup', 'onboarding'];
  const isOverlayPage = overlays.some(o => location.pathname.endsWith(o));

  const features = [
    {
      emoji: "🧠",
      title: "Slimme AI‑communicatie voor KMO’s",
      desc: "Te veel tijd kwijt aan mails beantwoorden? Koala doet het voor jou: sneller, consistenter en goed voor uren tijdswinst per week."
    },
    {
      emoji: "⚡",
      title: "Supersnel",
      desc: "Koala reageert onmiddellijk en blijft altijd beschikbaar."
    },
    {
      emoji: "🎨",
      title: "Alle communicatiestijlen + Custom Tone",
      desc: "Van formeel tot vriendelijk, Koala kan communiceren in elke stijl. Inclusief je eigen bedrijfsstijl met de 'custom'-feature."
    },
    {
      emoji: "📚",
      title: "Volledige historiek & contextbewust",
      desc: "Koala onthoudt je eerdere berichten en geeft daardoor steeds betere, meer consistente antwoorden."
    },
    {
      emoji: "🛠️",
      title: "Gemaakt voor de Vlaamse én Nederlandse KMO",
      desc: "Lokale taal, lokale context, lokale noden. Geen generieke AI, maar een tool die écht aansluit bij Vlaamse en Nederlandse bedrijven."
    },
    {
      emoji: "🔒",
      title: "Veilig & privacy‑gericht",
      desc: "Alle data wordt veilig verwerkt, zonder gedoe of risico’s voor je klanten of je bedrijf."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] relative flex flex-col selection:bg-[#2D6A4F] selection:text-white font-sans overflow-x-hidden">
      
      {/* --- SHARED BACKGROUND DECORATIONS --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] bg-[#2D6A4F]/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/2 -right-64 w-[700px] h-[700px] bg-[#FFC300]/5 rounded-full blur-[140px]"></div>
      </div>

      {/* --- CONTENT WRAPPER WITH BLUR LOGIC --- */}
      <div className={`relative z-10 flex flex-col transition-all duration-700 ${isOverlayPage ? 'blur-md scale-[0.98] opacity-60 pointer-events-none' : 'animate-in fade-in duration-500'}`}>
        
        {/* --- NAVIGATION --- */}
        <nav className="w-full max-w-[1400px] mx-auto px-4 md:px-12 lg:px-20 py-8 flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
              <KoalaIcon className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <span className="text-xl md:text-2xl font-black text-[#1B4332] tracking-tighter uppercase">Koala</span>
          </div>
          <div className="flex items-center gap-4 md:gap-10">
            {user ? (
              <Link to="/dashboard" className="bg-[#1B4332] text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-[#2D6A4F] hover:-translate-y-0.5 transition-all">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#1B4332] transition-colors">Login</Link>
                <Link to="/signup" className="bg-[#1B4332] text-white px-5 md:px-8 py-3 md:py-4 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-[#2D6A4F] hover:-translate-y-0.5 transition-all whitespace-nowrap">Start gratis</Link>
              </>
            )}
          </div>
        </nav>

        {/* --- HERO SECTION --- */}
        <header className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-12 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center bg-[#2D6A4F]/10 px-8 py-2.5 rounded-full mb-8 border border-[#2D6A4F]/10">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#2D6A4F] text-center">Gemaakt voor de Vlaamse én Nederlandse KMO</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-black text-[#1B4332] leading-[0.95] mb-8 tracking-tighter">
              Typ minder. <br/>
              <span className="text-[#2D6A4F]">Onderneem meer.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-500 font-medium mb-12 leading-relaxed max-w-2xl mx-auto">
              Koala AI schrijft perfecte antwoorden op al je klantvragen. Bespaar uren per week en geef je klanten de aandacht die ze verdienen.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link to={user ? "/dashboard" : "/signup"} className="bg-[#1B4332] text-white px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-[#2D6A4F] hover:shadow-[0_20px_40px_rgba(27,67,50,0.2)] hover:-translate-y-1 transition-all text-center">
                {user ? "Ga naar je Dashboard" : "Maak Gratis Account"}
              </Link>
            </div>
          </div>
        </header>

        {/* --- ENHANCED PROMO SECTION --- */}
        <section className="w-full bg-white py-24 md:py-32">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
            <div className="max-w-6xl mx-auto bg-[#F8F9FA] p-10 md:p-20 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-20">
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl md:text-4xl font-black text-[#1B4332] leading-tight mb-8 tracking-tight">
                    Ben jij ondernemer en kijk je elke dag op tegen die eindeloze stroom aan e‑mails die je eigenlijk <span className="italic text-[#2D6A4F]">gisteren</span> al had moeten beantwoorden? Dan is Koala precies wat je nodig hebt.
                  </h3>
                  <div className="space-y-6 text-lg md:text-xl text-gray-600 font-medium leading-relaxed">
                    <p>
                      Koala is jouw slimme AI‑assistent die je e‑mails schrijft alsof jij ze zelf hebt getypt: helder, professioneel en volledig in jouw stijl. Jij geeft de kern mee, Koala doet de rest: sneller, consistenter en zonder stress.
                    </p>
                    <p>
                      Het resultaat is geen kleine verbetering, maar een gigantische sprong vooruit: ondernemers besparen gemiddeld <span className="text-[#1B4332] font-black underline decoration-[#FFC300] decoration-4 underline-offset-4">80% van hun tijd</span> op e‑mailwerk dankzij Koala. Dat betekent minder uren achter je scherm en meer tijd voor het groeien van uw onderneming.
                    </p>
                    <p className="bg-white p-6 rounded-2xl border-l-8 border-[#2D6A4F] shadow-sm">
                      Koala neemt je communicatie over, maar nooit je persoonlijkheid. <span className="text-[#1B4332] font-black uppercase text-sm tracking-widest">Jij blijft de ondernemer, Koala doet het schrijfwerk.</span>
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center justify-center">
                   <div className="w-48 h-48 md:w-64 md:h-64 bg-white rounded-[2.5rem] shadow-xl border border-gray-50 flex items-center justify-center p-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700">
                     <KoalaIcon className="w-full h-full" />
                   </div>
                </div>
              </div>
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#2D6A4F]/5 rounded-full blur-3xl group-hover:bg-[#2D6A4F]/10 transition-colors duration-1000"></div>
            </div>
          </div>
        </section>

        {/* --- CORE FEATURES SECTION --- */}
        <section className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-20">
          <div className="mb-16 text-center">
            <h3 className="text-4xl md:text-5xl font-black text-[#1B4332] tracking-tighter">Koala in één oogopslag</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((f, i) => (
              <div 
                key={i} 
                className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-inner border border-gray-50">
                  {f.emoji}
                </div>
                <h4 className="text-xl font-black text-[#1B4332] mb-4 tracking-tight leading-tight">
                  {f.title}
                </h4>
                <p className="text-gray-500 font-medium text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* --- PRICING SECTION --- */}
        <section className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-24">
          <div className="mb-16 text-center">
            <h3 className="text-4xl md:text-5xl font-black text-[#1B4332] tracking-tighter mb-4">Onze Abonnementen</h3>
            <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-2xl mx-auto tracking-tight">Kies het plan dat bij jouw onderneming past en laat Koala uw antwoorden maken. Geniet van extra vrije uren in de week!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {PLANS.map((plan, i) => (
              <div 
                key={i} 
                className={`bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border-2 transition-all duration-500 flex flex-col ${
                  plan.isRecommended 
                    ? 'border-[#2D6A4F] shadow-xl scale-105 z-10' 
                    : 'border-gray-50 hover:border-gray-100 hover:shadow-md'
                }`}
              >
                {plan.isRecommended && (
                  <div className="bg-[#2D6A4F] text-white text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full self-center mb-6">
                    Populairste keuze
                  </div>
                )}
                <h4 className="text-xl font-black text-[#1B4332] mb-2 tracking-tight uppercase">{plan.name}</h4>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-black text-[#1B4332]">{plan.price}</span>
                  <span className="text-gray-400 font-bold text-[10px] uppercase">/ mnd</span>
                </div>
                
                <ul className="space-y-4 flex-1">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3 text-xs font-bold text-gray-500">
                      <span className="text-[#2D6A4F] text-lg leading-none">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="w-full py-12 px-6 md:px-12 lg:px-20 text-center md:text-left border-t border-gray-100 bg-white/50 backdrop-blur-sm">
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">© 2026 Koala AI Software</p>
            <div className="flex gap-8">
              <Link to="/terms" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#1B4332]">Voorwaarden</Link>
              <Link to="/privacy" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#1B4332]">Privacy</Link>
            </div>
          </div>
        </footer>
      </div>

      {/* RENDER OVERLAYS OUTSIDE THE BLURRED WRAPPER */}
      <Outlet />
    </div>
  );
};

export default Landing;
