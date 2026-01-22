
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AiTransparency: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 40 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="w-full max-w-4xl bg-white rounded-[3rem] shadow-[0_60px_120px_rgba(0,0,0,0.3)] border border-white relative overflow-hidden flex flex-col max-h-[90vh] mx-4"
    >
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-8 left-8 z-10 w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-[#1B4332] hover:bg-gray-100 transition-all active:scale-90 group"
      >
        <span className="text-xl group-hover:-translate-x-0.5 transition-transform">←</span>
      </button>

      <div className="p-10 md:p-14 pb-8 text-center border-b border-gray-100">
        <h1 className="text-3xl md:text-4xl font-black text-[#1B4332] uppercase tracking-tighter mt-14 md:mt-0 leading-none">AI-Transparantieverklaring</h1>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">EU AI ACT 2025 COMPLIANCE</p>
      </div>

      <div className="flex-1 overflow-y-auto p-10 md:p-16 prose prose-sm max-w-none text-gray-600 font-medium leading-relaxed space-y-10 scrollbar-hide">
        <div className="space-y-8">
          <section>
            <h3 className="text-xl font-black text-[#1B4332] uppercase tracking-tight mb-4">1. Gebruik van AI</h3>
            <p>Koala maakt gebruik van generatieve AI-modellen om antwoorden te genereren op basis van door de gebruiker ingevoerde tekst.</p>
          </section>

          <section>
            <h3 className="text-xl font-black text-[#1B4332] uppercase tracking-tight mb-4">2. Transparantieverplichting</h3>
            <ul className="list-disc pl-6 space-y-3 font-bold text-gray-500">
              <li>De gebruiker wordt geïnformeerd dat antwoorden automatisch worden gegenereerd.</li>
              <li>De gebruiker mag geen gevoelige persoonsgegevens invoeren (zoals gezondheidsgegevens, politieke voorkeuren, strafrechtelijke gegevens).</li>
              <li>AI-uitvoer kan onnauwkeurig, onvolledig of misleidend zijn.</li>
              <li>De gebruiker blijft verantwoordelijk voor beslissingen die worden genomen op basis van AI-uitvoer.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-black text-[#1B4332] uppercase tracking-tight mb-4">3. Verboden gebruik</h3>
            <ul className="list-disc pl-6 space-y-3 font-bold text-gray-500">
              <li>Gebruik voor hoog-risico beslissingen zonder menselijke controle</li>
              <li>Gebruik voor juridische, medische of financiële advisering</li>
              <li>Gebruik voor misleiding of manipulatie</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-black text-[#1B4332] uppercase tracking-tight mb-4">4. Menselijke controle</h3>
            <p>De gebruiker moet AI-uitvoer steeds kritisch beoordelen en mag deze niet blindelings vertrouwen.</p>
          </section>
        </div>
        <div className="h-10"></div>
      </div>

      <div className="p-10 bg-white border-t border-gray-50 flex justify-center shadow-[0_-20px_50px_rgba(0,0,0,0.02)]">
        <button 
          onClick={() => navigate(-1)}
          className="w-full max-w-md bg-[#1B4332] text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl active:scale-95 transition-all hover:bg-[#2D6A4F]"
        >
          BEGREPEN
        </button>
      </div>
    </motion.div>
  );
};

export default AiTransparency;
