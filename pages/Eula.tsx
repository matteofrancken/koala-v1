
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Eula: React.FC = () => {
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
        <span className="text-2xl group-hover:-translate-x-0.5 transition-transform">←</span>
      </button>

      <div className="p-10 md:p-14 pb-8 text-center border-b border-gray-100">
        <h1 className="text-3xl md:text-4xl font-black text-[#1B4332] uppercase tracking-tighter mt-14 md:mt-0 leading-none">EULA</h1>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">END USER LICENSE AGREEMENT</p>
      </div>

      <div className="flex-1 overflow-y-auto p-10 md:p-16 prose prose-sm max-w-none text-gray-600 font-medium leading-relaxed space-y-10 scrollbar-hide">
        <p className="text-center italic font-bold text-[#1B4332]">Deze licentieovereenkomst (“EULA”) is een overeenkomst tussen de gebruiker en Matteo Francken, ontwikkelaar en eigenaar van Koala.</p>
        
        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-black text-[#1B4332] uppercase tracking-tight mb-4">1. Licentie</h3>
            <p>De gebruiker krijgt een niet-exclusieve, niet-overdraagbare licentie om de App te gebruiken op Apple-apparaten die aan Apple’s voorwaarden voldoen.</p>
          </section>

          <section>
            <h3 className="text-xl font-black text-[#1B4332] uppercase tracking-tight mb-4">2. Beperkingen</h3>
            <ul className="list-disc pl-6 space-y-3 font-bold text-gray-500">
              <li>Geen reverse engineering</li>
              <li>Geen herverkoop</li>
              <li>Geen gebruik voor illegale doeleinden</li>
              <li>Geen poging om beveiliging te omzeilen</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-black text-[#1B4332] uppercase tracking-tight mb-4">3. Onderhoud en ondersteuning</h3>
            <p>Ondersteuning wordt uitsluitend geleverd door de ontwikkelaar, niet door Apple.</p>
          </section>

          <section>
            <h3 className="text-xl font-black text-[#1B4332] uppercase tracking-tight mb-4">4. Aansprakelijkheid</h3>
            <ul className="list-disc pl-6 space-y-4 font-bold text-gray-500">
              <li>Apple is niet verantwoordelijk voor claims met betrekking tot de App.</li>
              <li>De ontwikkelaar is verantwoordelijk voor onderhoud, ondersteuning en naleving van wetgeving.</li>
              <li>De ontwikkelaar is aansprakelijk voor claims die voortkomen uit:
                <ul className="list-circle pl-6 mt-3 font-medium space-y-2">
                  <li>Productaansprakelijkheid</li>
                  <li>Niet-naleving van wettelijke vereisten</li>
                  <li>Privacy- of gegevensbeschermingsverplichtingen</li>
                </ul>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-black text-[#1B4332] uppercase tracking-tight mb-4">5. Derdenrechten</h3>
            <p>Apple en haar dochterondernemingen zijn derde-begunstigden van deze EULA en hebben het recht deze voorwaarden tegenover de gebruiker af te dwingen.</p>
          </section>
        </div>
        <div className="h-10"></div>
      </div>

      <div className="p-10 bg-white border-t border-gray-50 flex justify-center shadow-[0_-20px_50px_rgba(0,0,0,0.02)]">
        <button 
          onClick={() => navigate(-1)}
          className="w-full max-w-md bg-[#1B4332] text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl active:scale-95 transition-all hover:bg-[#2D6A4F]"
        >
          IK GA AKKOORD
        </button>
      </div>
    </motion.div>
  );
};

export default Eula;
