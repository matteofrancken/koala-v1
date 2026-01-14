
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TermsOfService: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 bg-[#1B4332]/40 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={() => navigate(-1)}></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl bg-white rounded-[3rem] shadow-[0_60px_120px_rgba(0,0,0,0.3)] border border-white relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-8 left-8 z-20 w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-[#1B4332] hover:bg-gray-100 transition-all active:scale-90 group"
        >
          <span className="text-2xl group-hover:-translate-x-1 transition-transform">←</span>
        </button>

        <div className="p-10 md:p-14 pb-8 text-center border-b border-gray-50">
          <h1 className="text-3xl md:text-4xl font-black text-[#1B4332] uppercase tracking-tighter mt-14 md:mt-0">TERMS OF SERVICE – KOALA</h1>
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mt-3">LAATSTE UPDATE: 9 JANUARI 2026</p>
        </div>

        <div className="flex-1 overflow-y-auto p-10 md:p-16 prose prose-sm max-w-none text-gray-600 font-medium leading-relaxed space-y-12 scrollbar-hide">
          <section className="bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 italic text-sm text-center">
            Deze voorwaarden regelen het gebruik van Koala (“de App”). Door de App te gebruiken, gaat de gebruiker akkoord met deze voorwaarden.
          </section>

          <section>
            <h2 className="text-xl font-black text-[#1B4332] uppercase tracking-tight mb-5">1. DEFINITIES</h2>
            <ul className="space-y-4 list-none p-0">
              <li className="flex items-start gap-3"><span className="text-[#2D6A4F] font-black">•</span><span><strong>“Gebruiker”:</strong> iedere natuurlijke persoon of rechtspersoon die de App gebruikt voor professionele doeleinden.</span></li>
              <li className="flex items-start gap-3"><span className="text-[#2D6A4F] font-black">•</span><span><strong>“Dienst”:</strong> alle functionaliteiten, software en AI-modellen aangeboden via het Koala platform.</span></li>
              <li className="flex items-start gap-3"><span className="text-[#2D6A4F] font-black">•</span><span><strong>“Verwerkingsverantwoordelijke”:</strong> Matteo Francken, Bosbeslaan 11, 2920 Kalmthout.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#1B4332] uppercase tracking-tight mb-5">2. TOEGANG EN GEBRUIK</h2>
            <p>Koala is specifiek ontwikkeld voor Belgische en Nederlandse KMO's om de efficiëntie van klantcommunicatie te verhogen.</p>
            <ul className="space-y-4 list-none p-0 mt-4">
              <li className="flex items-start gap-3"><span className="text-[#2D6A4F] font-black">•</span><span>De gebruiker is verantwoordelijk voor de vertrouwelijkheid van zijn accountgegevens.</span></li>
              <li className="flex items-start gap-3"><span className="text-[#2D6A4F] font-black">•</span><span>Het is verboden om Koala te gebruiken voor het genereren van haatzaaiende tekst, spam of illegale content.</span></li>
              <li className="flex items-start gap-3"><span className="text-[#2D6A4F] font-black">•</span><span>Misbruik van de systemen of pogingen tot manipulatie leiden tot onmiddellijke schorsing.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#1B4332] uppercase tracking-tight mb-5">3. AI-FUNCTIONALITEIT EN VERANTWOORDELIJKHEID</h2>
            <p>Antwoorden worden gegenereerd door geavanceerde taalmodellen (AI). De gebruiker erkent dat:</p>
            <ul className="space-y-4 list-none p-0 mt-4">
              <li className="flex items-start gap-3"><span className="text-[#2D6A4F] font-black">•</span><span>AI-uitvoer feitelijke onjuistheden kan bevatten.</span></li>
              <li className="flex items-start gap-3"><span className="text-[#2D6A4F] font-black">•</span><span>De gebruiker te allen tijde zelf verantwoordelijk is voor het controleren en valideren van de tekst voordat deze naar een klant wordt verzonden.</span></li>
              <li className="flex items-start gap-3"><span className="text-[#2D6A4F] font-black">•</span><span>Koala niet aansprakelijk is voor enige schade voortvloeiend uit het gebruik van AI-gegenereerde content.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#1B4332] uppercase tracking-tight mb-5">4. ABONNEMENTEN EN BETALING</h2>
            <p>Betalingen worden verwerkt via Stripe. Abonnementen worden maandelijks vernieuwd en kunnen op elk moment worden opgezegd via het dashboard.</p>
          </section>
        </div>

        <div className="p-10 bg-gray-50/30 border-t border-gray-50 flex justify-center">
          <button 
            onClick={() => navigate(-1)}
            className="w-full max-w-xs bg-[#1B4332] text-white py-6 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 transition-all"
          >
            IK BEGRIJP HET
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsOfService;
