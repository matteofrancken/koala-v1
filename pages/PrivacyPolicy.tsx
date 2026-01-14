
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PrivacyPolicy: React.FC = () => {
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
          className="absolute top-8 left-8 z-10 w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-[#1B4332] hover:bg-gray-100 transition-all active:scale-90 group"
        >
          <span className="text-2xl group-hover:-translate-x-0.5 transition-transform">←</span>
        </button>

        <div className="p-10 md:p-14 pb-8 text-center border-b border-gray-100">
          <h1 className="text-3xl md:text-4xl font-black text-[#1B4332] uppercase tracking-tighter mt-14 md:mt-0">PRIVACYBELEID</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">LAATSTE UPDATE: 9 JANUARI 2026</p>
        </div>

        <div className="flex-1 overflow-y-auto p-10 md:p-16 prose prose-sm max-w-none text-gray-600 font-medium leading-relaxed space-y-12 scrollbar-hide">
          <section className="bg-gray-50/50 p-8 rounded-2xl border border-gray-100 italic text-sm text-center">
            Koala wordt beheerd door <strong>Matteo Francken</strong>, gevestigd te <strong>Bosbeslaan 11, 2920 Kalmthout</strong>. Wij hechten grote waarde aan de privacy van onze gebruikers.
          </section>

          <section>
            <h2 className="text-xl font-black text-[#1B4332] uppercase tracking-tight mb-5">1. WELKE GEGEVENS VERZAMELEN WIJ?</h2>
            <p>Wij verzamelen uitsluitend gegevens die noodzakelijk zijn voor de werking van de software:</p>
            <ul className="space-y-4 list-none p-0 mt-4">
              <li className="flex items-start gap-3"><span className="text-[#2D6A4F] font-black">•</span><span>Accountgegevens (naam, e-mail, bedrijfsnaam).</span></li>
              <li className="flex items-start gap-3"><span className="text-[#2D6A4F] font-black">•</span><span>Gebruiksgegevens (tekstinvoer voor AI-generatie).</span></li>
              <li className="flex items-start gap-3"><span className="text-[#2D6A4F] font-black">•</span><span>Betalingsgegevens (veilig verwerkt door Stripe).</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#1B4332] uppercase tracking-tight mb-5">2. HOE WORDT JE DATA GEBRUIKT?</h2>
            <p>De ingevoerde tekst wordt verzonden naar onze AI-modellen om antwoorden te genereren. Deze data wordt <strong>niet</strong> gebruikt voor het trainen van publieke modellen zonder expliciete toestemming.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#1B4332] uppercase tracking-tight mb-5">3. BEVEILIGING</h2>
            <p>Wij maken gebruik van industriestandaard encryptie en veilige servers (Supabase/Google Cloud) om je gegevens te beschermen.</p>
          </section>
        </div>

        <div className="p-10 bg-gray-50/50 border-t border-gray-100 flex justify-center">
          <button 
            onClick={() => navigate(-1)}
            className="bg-[#1B4332] text-white px-12 py-6 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 transition-all"
          >
            GELEZEN EN BEGREPEN
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;
