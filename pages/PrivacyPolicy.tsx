
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PrivacyPolicy: React.FC = () => {
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
        <h1 className="text-3xl md:text-5xl font-black text-[#1B4332] uppercase tracking-tighter mt-16 md:mt-0 leading-none">Privacy Policy</h1>
        <p className="text-[10px] md:text-[12px] font-black text-gray-400 uppercase tracking-[0.4em] mt-4">LAATSTE UPDATE: 9 JANUARI 2026</p>
      </div>

      <div className="flex-1 overflow-y-auto p-12 md:p-20 prose prose-sm max-w-none text-gray-600 font-medium leading-relaxed space-y-12 no-scrollbar">
        <section className="bg-blue-50/50 p-10 rounded-[2.5rem] border border-blue-100 italic text-base text-center font-bold text-blue-900 leading-relaxed">
          Deze Privacy Policy beschrijft hoe Koala (“de App”) persoonsgegevens verwerkt wanneer gebruikers de dienst gebruiken. Koala wordt beheerd door <strong>Matteo Francken</strong>, gevestigd te Bosbeslaan 11, 2920 Kalmthout, zonder ondernemingsnummer (“Verwerkingsverantwoordelijke”).
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-black text-[#1B4332] uppercase tracking-tight mb-6">1. VERZAMELDE GEGEVENS</h2>
          <p className="text-lg">Koala verwerkt uitsluitend gegevens die noodzakelijk zijn voor de werking van de App.</p>
          
          <div className="space-y-8 mt-6">
            <div>
              <h3 className="font-black text-[#1B4332] text-lg uppercase tracking-tight mb-4">1.1 Door de gebruiker verstrekte gegevens</h3>
              <ul className="space-y-3 list-disc pl-6 font-bold text-gray-500">
                <li>Tekstinvoer in de chatfunctie</li>
                <li>Eventuele bedrijfsinformatie die de gebruiker vrijwillig invoert</li>
                <li>Contactgegevens indien de gebruiker deze zelf invoert (bijvoorbeeld voor support)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-black text-[#1B4332] text-lg uppercase tracking-tight mb-4">1.2 Automatisch verzamelde gegevens</h3>
              <ul className="space-y-3 list-disc pl-6 font-bold text-gray-500">
                <li>App-gebruik en interacties</li>
                <li>Technische gegevens zoals apparaatmodel, besturingssysteem en crashlogs</li>
                <li>Timestamps van gesprekken</li>
                <li>Niet-identificeerbare analytische gegevens</li>
              </ul>
            </div>

            <div>
              <h3 className="font-black text-[#1B4332] text-lg uppercase tracking-tight mb-4">1.3 Gegevens die via AI-providers worden verwerkt</h3>
              <p className="font-bold text-gray-500">Koala maakt gebruik van externe AI-modellen (waaronder Google Gemini AI) voor het genereren van antwoorden. Tekstinvoer wordt doorgestuurd naar deze dienstverleners voor verwerking. Deze gegevens worden niet gebruikt om modellen te trainen, tenzij de gebruiker dit expliciet toestaat via de provider.</p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-black text-[#1B4332] uppercase tracking-tight mb-6">2. DOELEINDEN VAN VERWERKING</h2>
          <ul className="space-y-4 list-none p-0">
            {['Het leveren van AI-gebaseerde communicatiefunctionaliteit', 'Verbetering van de prestaties en stabiliteit van de App', 'Klantenondersteuning', 'Fraudepreventie en misbruikdetectie', 'Naleving van wettelijke verplichtingen'].map((item, idx) => (
              <li key={idx} className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-green-600 shrink-0"></div>
                <span className="font-bold text-gray-600">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-black text-[#1B4332] uppercase tracking-tight mb-6">3. RECHTSGROND</h2>
          <ul className="space-y-3 list-disc pl-6 font-bold text-gray-500">
            <li>Uitvoering van de overeenkomst (gebruik van de App)</li>
            <li>Gerechtvaardigd belang (veiligheid, misbruikpreventie)</li>
            <li>Toestemming (indien van toepassing)</li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-black text-[#1B4332] uppercase tracking-tight mb-6">4. BEWAARTERMIJNEN</h2>
          <ul className="space-y-6 list-none p-0 mt-6">
            <li className="flex items-start gap-4"><span><strong>Chatgeschiedenis:</strong> de bewaartermijn hangt af van het gekozen abonnement. Gebruikers kunnen hun chatgeschiedenis op elk moment zelf verwijderen.</span></li>
            <li className="flex items-start gap-4"><span><strong>Technische logs:</strong> maximaal 12 maanden</span></li>
            <li className="flex items-start gap-4"><span><strong>Supportgegevens:</strong> zolang nodig voor opvolging</span></li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-black text-[#1B4332] uppercase tracking-tight mb-6">5. DELEN VAN GEGEVENS</h2>
          <p className="text-lg">Gegevens kunnen worden gedeeld met:</p>
          <ul className="space-y-3 list-disc pl-6 font-bold text-gray-500">
            <li>Supabase (hosting, database en technische logs)</li>
            <li>Google (Gemini AI) voor het genereren van antwoorden</li>
            <li>Hostingproviders</li>
            <li>Analytische dienstverleners</li>
            <li>Overheidsinstanties indien wettelijk verplicht</li>
          </ul>
          <p className="text-lg font-black text-[#1B4332] mt-6">Er worden geen gegevens verkocht aan derden.</p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-black text-[#1B4332] uppercase tracking-tight mb-6">6. INTERNATIONALE DOORGIFTE</h2>
          <p className="text-lg">Indien gegevens buiten de EU worden verwerkt (bijvoorbeeld door Supabase of Google Gemini AI), gebeurt dit uitsluitend onder geldige waarborgen zoals <strong>Standard Contractual Clauses</strong> of gelijkwaardige beschermingsmechanismen.</p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-black text-[#1B4332] uppercase tracking-tight mb-6">7. RECHTEN VAN GEBRUIKERS</h2>
          <p className="text-lg">Gebruikers hebben recht op: Inzage, Rectificatie, Verwijdering, Beperking van verwerking, Bezwaar en Gegevensoverdraagbaarheid.</p>
          <p className="text-lg mt-4">Verzoeken kunnen worden ingediend via: <strong>info@koala-ai.be</strong></p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-black text-[#1B4332] uppercase tracking-tight mb-6">8. MINDERJARIGEN</h2>
          <p className="text-lg">Koala is niet bedoeld voor gebruikers jonger dan 16 jaar.</p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-black text-[#1B4332] uppercase tracking-tight mb-6">9. BEVEILIGING</h2>
          <p className="text-lg">Koala past technische en organisatorische maatregelen toe om gegevens te beschermen tegen verlies, misbruik en ongeoorloofde toegang.</p>
        </section>

        <section className="bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100">
          <h2 className="text-2xl font-black text-[#1B4332] uppercase tracking-tight mb-6">10. CONTACT</h2>
          <p className="text-lg font-bold text-[#1B4332]">Voor vragen over deze Privacy Policy:</p>
          <p className="text-lg">Matteo Francken</p>
          <p className="text-lg">Bosbeslaan 11, 2920 Kalmthout</p>
          <p className="text-lg font-black">info@koala-ai.be</p>
        </section>

        <div className="h-20"></div>
      </div>

      <div className="p-12 bg-white border-t border-gray-50 flex justify-center shadow-[0_-20px_50px_rgba(0,0,0,0.02)] relative z-30">
        <button 
          onClick={() => navigate(-1)}
          className="w-full max-w-md bg-[#1B4332] text-white py-7 rounded-[2.5rem] font-black uppercase tracking-widest text-[12px] shadow-2xl active:scale-95 transition-all hover:bg-[#2D6A4F]"
        >
          BEGREPEN
        </button>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicy;
