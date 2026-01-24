import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, PlanType } from '../types';
import { PLANS } from '../constants';
import { GoogleGenAI } from "@google/genai";

interface OnboardingProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ user, onUpdateUser }) => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [businessVibeUrl, setBusinessVibeUrl] = useState(user?.businessVibeUrl || '');
  const [selectedPlan, setSelectedPlan] = useState<string>('Gratis');
  const [generatingVibe, setGeneratingVibe] = useState(false);

  const generateVibe = async () => {
    if (!businessName.trim()) return;
    setGeneratingVibe(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const prompt = `A clean, minimalist 3D corporate illustration of a modern office. On the office wall or glass, display ONLY the exact text "${businessName}". DO NOT invent or add any extra words, taglines, or industry descriptions. Include a subtle, friendly koala sitting at a desk. Style: professional, high-end, soft lighting, green and white color palette. 16:9 aspect ratio.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });

      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData) {
            setBusinessVibeUrl(`data:image/png;base64,${part.inlineData.data}`);
            break;
          }
        }
      }
    } catch (err) {
      console.error("Nano Banana generation failed", err);
    } finally {
      setGeneratingVibe(false);
    }
  };

  const handleNextStep = async () => {
    if (step === 1) {
      if (!businessName.trim()) {
        alert("Vul a.u.b. de naam van je zaak in.");
        return;
      }
      if (!businessVibeUrl && !generatingVibe) {
        await generateVibe();
      }
      setStep(2);
    }
  };

  const finishOnboarding = (planName?: string) => {
    if (!user) return;
    
    const finalPlan = planName || selectedPlan;
    const planConfig = PLANS.find(p => p.name === finalPlan) || PLANS[0];
    
    const updatedUser: User = {
      ...user,
      onboardingCompleted: true,
      businessName: businessName.trim(),
      businessVibeUrl: businessVibeUrl,
      plan: finalPlan as PlanType,
      maxResponses: planConfig.limit
    };
    
    onUpdateUser(updatedUser);
    navigate('/dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-[#1B4332]/10 backdrop-blur-md animate-in fade-in duration-300">
      
      <div className={`w-full ${step === 2 ? 'max-w-5xl' : 'max-w-md'} bg-white rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.15)] border border-white relative animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 overflow-hidden flex flex-col transition-all duration-500`}>
        
        <div className="flex justify-center gap-3 pt-10">
           {[1, 2].map(s => (
             <div key={s} className={`h-2 rounded-full transition-all duration-500 ${step >= s ? 'w-16 bg-[#2D6A4F]' : 'w-16 bg-gray-100'}`} />
           ))}
        </div>

        <div className="p-8 md:p-14 flex flex-col items-center flex-1 overflow-y-auto max-h-[85vh] no-scrollbar">
          
          {step === 1 && (
            <div className="animate-in slide-in-from-right duration-500 text-center w-full">
              <div className="text-5xl mb-8 filter drop-shadow-sm select-none">🏢</div>
              <h2 className="text-[28px] font-black text-[#1C1C1C] mb-2 tracking-tighter uppercase leading-none">Jouw Bedrijf</h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-12">Maak je Koala Business Vibe</p>
              
              <div className="space-y-6 mb-8">
                <input 
                  type="text" 
                  placeholder="Naam van je zaak..." 
                  autoFocus
                  value={businessName} 
                  onChange={(e) => setBusinessName(e.target.value)} 
                  className="w-full px-6 py-6 rounded-2xl bg-white border-2 border-transparent focus:border-[#2D6A4F] outline-none font-bold text-xl text-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] transition-all placeholder:text-gray-300 ring-1 ring-gray-100" 
                />
              </div>

              {businessVibeUrl && (
                <div className="mb-8 rounded-2xl overflow-hidden shadow-inner border border-gray-100 aspect-video bg-gray-50 flex items-center justify-center relative group">
                  <img src={businessVibeUrl} className="w-full h-full object-cover" alt="Business Vibe" />
                  <button onClick={generateVibe} className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg text-[9px] font-black uppercase tracking-widest text-[#1B4332] opacity-0 group-hover:opacity-100 transition-all">Regenereer ✨</button>
                </div>
              )}

              {generatingVibe && !businessVibeUrl && (
                <div className="mb-8 rounded-2xl overflow-hidden border border-gray-100 aspect-video bg-gray-50 flex flex-col items-center justify-center gap-4 animate-pulse">
                  <div className="w-10 h-10 border-2 border-[#1B4332]/20 border-t-[#1B4332] rounded-full animate-spin"></div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Nano Banana genereert je vibe...</p>
                </div>
              )}
              
              <button 
                onClick={handleNextStep} 
                disabled={generatingVibe}
                className="w-full bg-[#1B4332] text-white py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 hover:bg-[#2D6A4F] transition-all disabled:opacity-50"
              >
                {generatingVibe ? 'Momentje...' : 'Volgende Stap →'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in zoom-in-95 duration-500 w-full">
              <div className="text-center mb-10">
                <div className="w-20 h-20 mx-auto mb-8 animate-in zoom-in duration-700 delay-200">
                  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-xl">
                    <path d="M12 3L4 9L12 21L20 9L12 3Z" fill="#3B82F6" className="opacity-80" />
                    <path d="M12 3L8 9L12 15L16 9L12 3Z" fill="#60A5FA" />
                  </svg>
                </div>
                <h2 className="text-[32px] md:text-[42px] font-black text-[#1C1C1C] mb-2 tracking-tighter uppercase leading-none">Kies je Plan</h2>
                <p className="text-gray-400 font-bold text-[10px] md:text-[12px] uppercase tracking-widest">Klaar om tijd te besparen?</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                {PLANS.map((plan) => (
                  <button 
                    key={plan.name} 
                    onClick={() => setSelectedPlan(plan.name)} 
                    className={`w-full p-6 md:p-8 rounded-[2rem] border-2 transition-all text-left flex flex-col justify-between group h-full relative ${
                      selectedPlan === plan.name 
                      ? 'border-[#2D6A4F] bg-green-50/50 shadow-md ring-1 ring-[#2D6A4F]' 
                      : 'border-gray-50 bg-white hover:border-gray-100 shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <p className={`text-base md:text-lg font-black uppercase tracking-tight ${selectedPlan === plan.name ? 'text-[#1B4332]' : 'text-[#1C1C1C]'}`}>{plan.name}</p>
                        {selectedPlan === plan.name && (
                          <div className="text-[#2D6A4F] text-2xl animate-in fade-in zoom-in duration-300">✓</div>
                        )}
                      </div>
                      <p className="text-gray-400 font-bold text-xs mb-6 uppercase tracking-widest">{plan.price} / maand</p>
                      
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-center gap-2">
                          <span className="text-[10px]">✨</span>
                          <span className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                            {plan.limit === 999999 ? 'Onbeperkt' : plan.limit} antwoorden
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-[10px]">🚀</span>
                          <span className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                            {plan.name === 'Gratis' ? 'Basis' : plan.name === 'Starter' ? 'Snel' : 'Pro'} Model
                          </span>
                        </li>
                      </ul>
                    </div>
                  </button>
                ))}
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <button 
                  onClick={() => finishOnboarding()} 
                  className="w-full bg-[#1B4332] text-white py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 hover:bg-[#2D6A4F] transition-all"
                >
                  Start met Koala
                </button>
                <button 
                  onClick={() => setStep(1)} 
                  className="w-full text-gray-400 font-black uppercase tracking-widest text-[9px] py-2 hover:text-gray-600 transition-colors"
                >
                  ← Terug naar naam
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;