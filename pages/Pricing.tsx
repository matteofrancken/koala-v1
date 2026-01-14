
import React, { useState } from 'react';
import { PlanType, User } from '../types';
import { PLANS } from '../constants';
import { useNavigate } from 'react-router-dom';
import { stripeService } from '../services/stripe';

interface PricingProps {
  user: User | null;
  onUpgrade: (updatedUser: User) => void;
}

const Pricing: React.FC<PricingProps> = ({ user, onUpgrade }) => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePurchase = async (planName: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const plan = PLANS.find(p => p.name === planName);
    if (!plan) return;

    // Als het het gratis plan is, updaten we de user direct zonder Stripe
    if (plan.name === 'Gratis') {
      const updatedUser: User = {
        ...user,
        plan: PlanType.FREE,
        maxResponses: plan.limit,
        subscriptionStatus: 'inactive'
      };
      onUpgrade(updatedUser);
      navigate('/dashboard');
      return;
    }

    setLoadingPlan(planName);
    setError(null);
    
    try {
      const session = await stripeService.createCheckoutSession(plan.priceId, user.email);
      await stripeService.redirectToCheckout(session);
    } catch (err: any) {
      console.error("Payment flow error:", err);
      setError(err.message || "Fout bij opzetten betaling.");
      setLoadingPlan(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 pb-32 animate-in fade-in duration-700 px-4">
      
      {/* Loading Overlay */}
      {loadingPlan && (
        <div className="fixed inset-0 bg-[#F8F9FA]/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
          <div className="w-16 h-16 border-4 border-[#1B4332]/10 border-t-[#1B4332] rounded-full animate-spin mb-8"></div>
          <p className="font-black text-2xl text-[#1B4332] tracking-tighter">Beveiligde verbinding...</p>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-4">Je wordt doorverwezen naar de betaalpagina</p>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-16 md:mb-24">
        <h2 className="text-4xl md:text-6xl font-black text-[#1C1C1C] tracking-tighter mb-4">Kies je Plan</h2>
        <div className="h-1.5 w-20 bg-[#2D6A4F] mx-auto rounded-full mb-6"></div>
        <p className="text-gray-400 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] leading-relaxed max-w-sm mx-auto">Focus op je onderneming, laat Koala schrijven.</p>
      </div>

      {error && (
        <div className="mb-10 p-6 bg-red-50 text-red-700 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-red-100 text-center animate-in slide-in-from-top-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8 items-stretch">
        {PLANS.map((plan) => {
          const isCurrent = user?.plan === plan.name;
          const isPro = plan.name === 'Pro';

          return (
            <div 
              key={plan.name} 
              className={`relative bg-white rounded-[2.5rem] p-8 md:p-10 border-2 transition-all flex flex-col h-full ${
                isPro 
                  ? 'border-[#2D6A4F] shadow-2xl z-10' 
                  : 'border-gray-50 shadow-sm hover:shadow-xl hover:border-gray-200'
              } ${isCurrent ? 'bg-green-50/20 border-[#FFC300]' : ''}`}
            >
              {isPro && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FFC300] text-[#1B4332] text-[9px] font-black px-6 py-2.5 rounded-full uppercase tracking-widest shadow-xl whitespace-nowrap">
                  Populairste keuze
                </div>
              )}

              <div className="mb-10 pt-4 text-center md:text-left">
                <h3 className="text-2xl font-black mb-2 text-[#1C1C1C] uppercase tracking-tight">{plan.name}</h3>
                <div className="flex items-baseline justify-center md:justify-start gap-1">
                  <span className="text-4xl font-black tracking-tighter">{plan.price}</span>
                  <span className="text-gray-400 font-bold text-[10px] uppercase">/ mnd</span>
                </div>
              </div>

              <div className="space-y-5 mb-12 flex-1">
                {plan.features.map(f => (
                  <div key={f} className="flex items-start gap-3 text-xs font-bold text-gray-500 leading-tight">
                    <span className="text-[#2D6A4F] text-lg leading-none shrink-0">✓</span>
                    <span className="pt-0.5">{f}</span>
                  </div>
                ))}
              </div>

              <button
                disabled={isCurrent || (loadingPlan !== null)}
                onClick={() => handlePurchase(plan.name)}
                className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-lg transition-all duration-300 ${
                  isCurrent 
                    ? 'bg-gray-100 text-gray-400 cursor-default' 
                    : 'bg-[#1B4332] text-white active:scale-95 hover:bg-[#2D6A4F] hover:shadow-2xl'
                }`}
              >
                {isCurrent ? "Huidig Plan" : "Kies Plan"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-20 px-4 text-center opacity-60">
        <p className="text-[10px] text-gray-400 font-medium leading-relaxed max-w-xl mx-auto uppercase tracking-widest">
          Geen verborgen kosten • Opzegbaar op elk moment • Beveiligde betaling via Stripe
        </p>
      </div>
    </div>
  );
};

export default Pricing;
