
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PLANS } from '../constants';

const StripeMock: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Haal de huidige gebruiker op uit localStorage voor een realistische weergave
  const currentEmail = localStorage.getItem('koala_session_email') || 'klant@bedrijf.be';
  
  const planId = searchParams.get('plan');
  // Zoek op priceId OF op naam voor maximale flexibiliteit bij redirects
  const plan = PLANS.find(p => p.priceId === planId || p.name === planId);

  useEffect(() => {
    if (!plan && !isProcessing) {
      console.warn("[StripeMock] Geen geldig plan gevonden. Redirect naar pricing...");
      const timer = setTimeout(() => navigate('/pricing'), 500);
      return () => clearTimeout(timer);
    }
  }, [plan, navigate, isProcessing]);

  if (!plan) {
    return (
      <div className="fixed inset-0 bg-white z-[200] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B4332]"></div>
      </div>
    );
  }

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simuleer de Stripe processing tijd (netwerkeffect)
    setTimeout(() => {
      const successPath = `/checkout/success?plan=${encodeURIComponent(plan.name)}&limit=${plan.limit}&session_id=cs_test_${Math.random().toString(36).substring(7)}`;
      // Forceer navigatie via window.location.hash voor maximale betrouwbaarheid in de sandbox
      window.location.hash = `#${successPath}`;
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-[#F6F9FC] z-[200] flex flex-col md:flex-row overflow-y-auto animate-in fade-in duration-500">
      {/* Test Mode Banner */}
      <div className="fixed top-0 left-0 right-0 bg-[#635BFF] text-white text-[10px] font-black uppercase tracking-[0.3em] py-2 text-center z-[210] shadow-md">
        Testmodus — Geen echte transactie
      </div>

      {/* Linker kant: Bestelling overzicht */}
      <div className="w-full md:w-1/2 p-8 md:p-20 flex flex-col justify-center items-center md:items-end border-b md:border-b-0 md:border-r border-gray-200 pt-16 md:pt-20">
        <div className="max-w-sm w-full">
          <button onClick={() => navigate('/pricing')} className="text-[#635BFF] font-bold text-sm mb-12 flex items-center gap-2 hover:opacity-80 transition-all">
            ← Terug naar Koala AI
          </button>
          
          <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 bg-[#635BFF] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-black">K</span>
             </div>
             <span className="text-sm font-black uppercase tracking-widest text-gray-400">Koala AI Checkout</span>
          </div>
          
          <h1 className="text-gray-400 font-bold mb-1">Abonnement op {plan.name}</h1>
          <div className="flex items-baseline gap-2 mb-10">
            <span className="text-5xl font-black text-[#1C1C1C] tracking-tighter">{plan.price}</span>
            <span className="text-gray-400 font-bold">per maand</span>
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-8">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">{plan.name} Plan (Maandelijks)</span>
              <span className="font-bold text-[#1C1C1C]">{plan.price}</span>
            </div>
            <div className="flex justify-between text-sm pt-6 border-t border-gray-100 mt-6">
              <span className="text-[#1C1C1C] font-black">Totaal vandaag</span>
              <span className="text-[#1C1C1C] font-black text-xl">{plan.price}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rechter kant: Betaalformulier */}
      <div className="w-full md:w-1/2 p-8 md:p-20 bg-white flex flex-col justify-center items-center md:items-start pt-16 md:pt-20">
        <form onSubmit={handlePayment} className="max-w-sm w-full space-y-8">
          <h2 className="text-2xl font-black text-[#1C1C1C] mb-8 tracking-tight">Betaalmethode</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">E-mailadres</label>
              <input 
                type="email" 
                readOnly 
                value={currentEmail} 
                className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 font-medium outline-none cursor-not-allowed" 
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 text-blue-600 flex justify-between">
                <span>Kaartgegevens</span>
                <span>TEST MODE</span>
              </label>
              <div className="shadow-sm">
                <input 
                  type="text" 
                  placeholder="4242 4242 4242 4242" 
                  className="w-full px-5 py-4 rounded-t-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#635BFF] transition-all font-mono" 
                />
                <div className="flex">
                  <input 
                    type="text" 
                    placeholder="MM / YY" 
                    className="w-1/2 px-5 py-4 rounded-bl-xl border border-t-0 border-r-0 border-gray-200 outline-none focus:ring-2 focus:ring-[#635BFF] transition-all" 
                  />
                  <input 
                    type="text" 
                    placeholder="CVC" 
                    className="w-1/2 px-5 py-4 rounded-br-xl border border-t-0 border-gray-200 outline-none focus:ring-2 focus:ring-[#635BFF] transition-all" 
                  />
                </div>
              </div>
              <p className="mt-2 text-[10px] text-gray-400 italic">Gebruik '4242' voor alle velden om te testen.</p>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Naam op kaart</label>
              <input 
                type="text" 
                placeholder="Voornaam Achternaam" 
                required
                className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#635BFF] transition-all font-medium" 
              />
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full bg-[#635BFF] text-white py-5 rounded-xl font-black shadow-xl hover:bg-[#4339F2] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:translate-y-0"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="uppercase tracking-widest text-xs">Verwerken...</span>
                  </>
                ) : (
                  <span className="uppercase tracking-widest text-xs">Betaal {plan.price}</span>
                )}
              </button>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-50">
            <p className="text-[10px] text-gray-400 text-center leading-relaxed font-medium">
              Dit is een demonstratie van de betaalflow. <br />
              Er vindt <strong>geen</strong> werkelijke afschrijving plaats.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StripeMock;
