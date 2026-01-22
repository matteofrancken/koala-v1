
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TermsOfService: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 40 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="w-full max-w-4xl bg-white rounded-[3.5rem] shadow-[0_60px_120px_rgba(0,0,0,0.3)] border border-white relative overflow-hidden flex flex-col max-h-[90vh] mx-4"
    >
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-10 left-10 z-20 w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-[#1B4332] hover:bg-gray-100 transition-all active:scale-90 group shadow-sm"
      >
        <span className="text-3xl group-hover:-translate-x-1 transition-transform">←</span>
      </button>

      <div className="p-12 md:p-16 pb-10 text-center border-b border-gray-50">
        <h1 className="text-3xl md:text-5xl font-black text-[#1B4332] uppercase tracking-tighter mt-16 md:mt-0 leading-none">Terms of Service</h1>
        <p className="text-[10px] md:text-[12px] font-black text-gray-300 uppercase tracking-[0.4em] mt-4">LAATSTE UPDATE: 9 JANUARI 2026</p>
      </div>

      <div className="flex-1 overflow-y-auto p-12 md:p-20 prose prose-sm max-w-none text-gray-600 font-medium leading-relaxed space-y-12 no-scrollbar">
        <section className="bg-green-50/50 p-10 rounded-[2.5rem] border border-green-100 italic text-base text-center font-bold text-[#1B4332]">
          Deze voorwaarden regelen het gebruik van Koala (“de App”). Door de App te gebruiken, gaat de gebruiker akkoord met deze voorwaarden.
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-black text-[#1B4332] uppercase tracking-tight mb-6">1. DEFINITIES</h2>
          <ul className="space-y-6 list-none p-0">
            <li className="flex items-start gap-4"><span><strong>“Gebruiker”:</strong> iedere persoon die de App gebruikt.</span></li>
            <li className="flex items-start gap-4"><span><strong>“Dienst”:</strong> alle functionaliteiten van Koala.</span></li>
            <li className="flex items-start gap-4"><span><strong>“Verwerkingsverantwoordelijke”:</strong> Matteo Francken.</span></li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-black text-[#1B4332] uppercase tracking-tight mb-6">2. TOEGANG EN GEBRUIK</h2>
          <ul className="space-y-6 list-none p-0 mt-6">
            <li className="flex items-start gap-4"><span>De gebruiker mag de App uitsluitend gebruiken volgens deze voorwaarden.</span></li>
            <li className="flex items-start gap-4"><span>De gebruiker is verantwoordelijk voor alle inhoud die via de App wordt ingevoerd.</span></li>
            <li className="flex items-start gap-4"><span>Misbruik, waaronder spam, illegale inhoud of het proberen om systemen te manipuleren, is verboden.</span></li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-black text-[#1B4332] uppercase tracking-tight mb-6">3. AI-FUNCTIONALITEIT</h2>
          <ul className="space-y-6 list-none p-0 mt-6">
            <li className="flex items-start gap-4"><span>Antwoorden worden automatisch gegenereerd door AI-modellen.</span></li>
            <li className="flex items-start gap-4"><span>De gebruiker erkent dat AI-uitvoer fouten kan bevatten.</span></li>
            <li className="flex items-start gap-4"><span>De App biedt geen juridisch, medisch, financieel of professioneel advies.</span></li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-black text-[#1B4332] uppercase tracking-tight mb-6">4. INTELLECTUELE EIGENDOM</h2>
          <ul className="space-y-6 list-none p-0 mt-6">
            <li className="flex items-start gap-4"><span>Alle rechten op de App behoren toe aan de Verwerkingsverantwoordelijke.</span></li>
            <li className="flex items-start gap-4"><span>De gebruiker behoudt de rechten op eigen ingevoerde inhoud.</span></li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-black text-[#1B4332] uppercase tracking-tight mb-6">5. AANSPRAKELIJKHEID</h2>
          <p className="text-lg">De App wordt geleverd “zoals hij is”. De Verwerkingsverantwoordelijke is niet aansprakelijk voor schade die voortvloeit uit:</p>
          <ul className="space-y-4 list-disc pl-10 mt-4 font-bold text-[#1B4332]">
            <li>Onjuiste AI-uitvoer</li>
            <li>Onderbrekingen</li>
            <li>Diensten van derden</li>
          </ul>
          <p className="text-lg mt-6">De totale aansprakelijkheid is beperkt tot het bedrag dat de gebruiker heeft betaald in de laatste 12 maanden.</p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-black text-[#1B4332] uppercase tracking-tight mb-6">6. BEËINDIGING</h2>
          <ul className="space-y-6 list-none p-0 mt-6">
            <li className="flex items-start gap-4"><span>De gebruiker kan op elk moment stoppen met het gebruik van de App.</span></li>
            <li className="flex items-start gap-4"><span>De Verwerkingsverantwoordelijke kan toegang opschorten bij misbruik.</span></li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-black text-[#1B4332] uppercase tracking-tight mb-6">7. WIJZIGINGEN</h2>
          <p className="text-lg">Voorwaarden kunnen worden bijgewerkt. De wijzigingen treden pas in werking zodra ze gepubliceerd zijn in de App en wanneer de gebruiker op de hoogte is.</p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-black text-[#1B4332] uppercase tracking-tight mb-6">8. TOEPASSELIJK RECHT</h2>
          <p className="text-lg">Belgisch recht is van toepassing. Geschillen worden voorgelegd aan de rechtbanken van Antwerpen.</p>
        </section>

        <div className="h-20"></div>
      </div>

      <div className="p-12 bg-white border-t border-gray-50 flex justify-center shadow-[0_-20px_50px_rgba(0,0,0,0.02)] relative z-30">
        <button 
          onClick={() => navigate(-1)}
          className="w-full max-w-md bg-[#1B4332] text-white py-7 rounded-[2.5rem] font-black uppercase tracking-widest text-[12px] shadow-2xl active:scale-95 transition-all hover:bg-[#2D6A4F]"
        >
          AKKOORD
        </button>
      </div>
    </motion.div>
  );
};

export default TermsOfService;
