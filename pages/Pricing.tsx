
import React, { useState } from 'react';
import { PlanType, User } from '../types';
import { PLANS } from '../constants';
import { useNavigate } from 'react-router-dom';
import { stripeService } from '../services/stripe';
import { motion } from 'framer-motion';

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
    <div className="max-w-7xl mx-auto space-y-12 md:space-y-16 animate-in fade-in duration-700 pb-32">
      
      {/* --- LOADING OVERLAY --- */}
      {loadingPlan && (
        <div className="fixed inset-0 bg-[#F8F9FA]/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
          <div className="w-16 h-16 border-4 border-[#1B4332]/10 border-t-[#1B4332] rounded-full animate-spin mb-8"></div>
          <p className="font-black text-2xl text-[#1B4332] tracking-tighter uppercase">Beveiligde verbinding...</p>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-4">Je wordt doorverwezen naar de betaalpagina</p>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="px-1 text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-black text-[#1B4332] tracking-tighter mb-2">Kies je Plan</h1>
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Upgrade voor meer kracht en tijdsbesparing</p>
      </header>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mx-1 p-6 bg-red-50 text-red-700 rounded-[2rem] text-[11px] font-black uppercase tracking-widest border border-red-100 text-center shadow-sm">
          {error}
        </motion.div>
      )}

      {/* --- PRICING GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8 px-1">
        {PLANS.map((plan) => {
          const isCurrent = user?.plan === plan.name;
          const isPro = plan.name === 'Pro';
          const isUnlimited = plan.name === 'Unlimited';

          return (
            <motion.div 
              whileHover={{ y: -5 }}
              key={plan.name} 
              className={`relative bg-white rounded-[2.5rem] md:rounded-[3rem] p-10 border-2 transition-all flex flex-col h-full ${
                isPro 
                  ? 'border-[#2D6A4F] shadow-2xl z-10' 
                  : 'border-gray-50 shadow-sm hover:border-gray-100'
              } ${isCurrent ? 'bg-green-50/20 border-[#FFC300]' : ''}`}
            >
              {isPro && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#FFC300] text-[#1B4332] text-[9px] font-black px-8 py-3 rounded-full uppercase tracking-[0.2em] shadow-xl whitespace-nowrap border-4 border-white">
                  Populair
                </div>
              )}

              <div className="mb-12 text-center">
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-4">Abonnement</p>
                <h3 className="text-3xl font-black mb-4 text-[#1B4332] uppercase tracking-tighter">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black tracking-tighter text-[#1C1C1C]">{plan.price}</span>
                  <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">/mnd</span>
                </div>
              </div>

              <div className="space-y-6 mb-16 flex-1 flex flex-col items-center">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-3 text-[11px] font-bold text-gray-500 leading-relaxed uppercase tracking-tight text-center">
                    <div className="w-5 h-5 bg-green-50 rounded-lg flex items-center justify-center text-[10px] shrink-0 text-[#2D6A4F]">✓</div>
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <button
                disabled={isCurrent || (loadingPlan !== null)}
                onClick={() => handlePurchase(plan.name)}
                className={`w-full py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-lg transition-all duration-300 ${
                  isCurrent 
                    ? 'bg-gray-50 text-gray-300 cursor-default border border-gray-100' 
                    : isPro || isUnlimited
                      ? 'bg-[#1B4332] text-white active:scale-95 hover:bg-[#2D6A4F] hover:shadow-2xl'
                      : 'bg-white text-[#1B4332] border-2 border-[#1B4332] active:scale-95 hover:bg-gray-50'
                }`}
              >
                {isCurrent ? "Huidig Plan" : "Kies Plan"}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* --- FOOTER INFO --- */}
      <footer className="pt-12 px-1">
        <div className="bg-white/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <h4 className="text-sm font-black text-[#1B4332] uppercase tracking-widest">Vragen over je facturatie?</h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Neem contact op met onze support voor hulp.</p>
          </div>
          <div className="flex gap-4 md:gap-12 items-center">
            <div className="flex flex-col items-center md:items-end">
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Betaal Veilig Met</span>
              <span className="text-xl font-black text-[#635BFF] opacity-50">Stripe</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
