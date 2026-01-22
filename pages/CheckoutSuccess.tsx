
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, PlanType } from '../types';
import { KoalaIcon, PLANS } from '../constants';

interface CheckoutSuccessProps {
  user: User | null;
  onUpgrade: (updatedUser: User) => void;
}

const CheckoutSuccess: React.FC<CheckoutSuccessProps> = ({ user, onUpgrade }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const priceId = searchParams.get('price_id');
  const plan = PLANS.find(p => p.priceId === priceId) || PLANS[2]; // Default naar Pro als niet gevonden

  useEffect(() => {
    if (user && plan) {
      const updatedUser: User = {
        ...user,
        plan: plan.name as PlanType,
        maxResponses: plan.limit,
        subscriptionStatus: 'active'
      };
      onUpgrade(updatedUser);
    }
  }, [user, plan, onUpgrade]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] md:min-h-[80vh] animate-in fade-in duration-700 px-6">
      
      {/* Logo Card with Badge */}
      <div className="relative mb-12">
        <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center justify-center relative z-10">
          <KoalaIcon className="w-16 h-16 md:w-20 md:h-20 text-[#2D6A4F]" />
          
          {/* Sparkle Badge */}
          <div className="absolute -top-2 -right-2 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-tr from-[#FFB703] to-[#FFC300] rounded-full border-[5px] border-[#F8F9FA] flex items-center justify-center shadow-lg">
            <span className="text-white text-lg md:text-xl">✨</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="text-center max-w-sm w-full">
        <h2 className="text-[32px] md:text-[42px] font-black text-[#1B4332] leading-tight mb-6 tracking-tight">
          Betaling Geslaagd!
        </h2>
        
        <p className="text-gray-500 text-base md:text-lg font-medium leading-relaxed mb-12 px-2">
          Hoera! Je account is succesvol geüpgraded naar <span className="text-[#1B4332] font-black">{plan.name}</span>. Koala is klaar voor het zware werk.
        </p>

        {/* Action Button */}
        <div className="flex flex-col items-center w-full">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-[#1B4332] text-white py-5 px-10 rounded-[2rem] font-black uppercase tracking-[0.15em] text-[11px] shadow-[0_15px_40px_rgba(27,67,50,0.2)] active:scale-95 hover:translate-y-[-2px] transition-all duration-300 flex items-center justify-center gap-2"
          >
            TERUG NAAR DASHBOARD &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
