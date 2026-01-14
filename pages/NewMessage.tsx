
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, ToneType, LengthType, GeneratedResponse, PlanType } from '../types';
import { generateKoalaResponse } from '../services/ai';
import { KoalaIcon } from '../constants';

interface NewMessageProps {
  user: User | null;
  onComplete: (item: GeneratedResponse) => void;
  onRecordUsage: (length: LengthType) => void;
}

const NewMessage: React.FC<NewMessageProps> = ({ user, onComplete, onRecordUsage }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [message, setMessage] = useState('');
  
  const [tone, setTone] = useState<ToneType>(
    user?.plan === PlanType.FREE ? ToneType.FORMAL : ToneType.BUSINESS
  );
  
  const [details, setDetails] = useState<string[]>(['', '', '']);
  const [length, setLength] = useState<LengthType>(LengthType.NORMAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (user?.plan === PlanType.FREE) {
      setTone(ToneType.FORMAL);
    } else if (user?.plan === PlanType.STARTER && ![ToneType.FORMAL, ToneType.BUSINESS, ToneType.INFORMAL].includes(tone)) {
      setTone(ToneType.BUSINESS);
    }
  }, [user]);

  const goToStep = (s: number) => {
    setDirection(s > step ? 'forward' : 'backward');
    setStep(s);
  };

  const handleDetailChange = (index: number, value: string) => {
    const newDetails = [...details];
    newDetails[index] = value;
    setDetails(newDetails);
  };

  const addDetailBlock = () => {
    setDetails([...details, '']);
  };

  const handleGenerate = async () => {
    if (!message.trim() || !user) return;
    setError(null);
    
    if (user.responsesUsed >= user.maxResponses) {
      alert("Je hebt je maandelijkse limiet bereikt.");
      navigate('/pricing');
      return;
    }

    setLoading(true);
    try {
      const activeTone = tone;
      const combinedDetails = details.filter(d => d.trim() !== "").join(" | ");
      
      const data = await generateKoalaResponse(
        message, 
        activeTone, 
        length, 
        user.fullName, 
        user.businessName, 
        combinedDetails
      );
      setResult(data);
      onRecordUsage(length);
      setDirection('forward');
      setStep(5);
    } catch (err: any) {
      setError(err.message || "Fout bij genereren.");
      setStep(4);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!result || !user) return;
    
    const newEntry: GeneratedResponse = {
      id: crypto.randomUUID(),
      userId: user.id,
      originalMessage: message,
      aiResponseA: result.variantA,
      aiResponseB: result.variantB,
      tone: tone,
      length,
      intent: result.intent,
      emotion: result.emotion,
      urgency: result.urgency,
      createdAt: new Date().toISOString(),
    };
    onComplete(newEntry);
    navigate('/dashboard');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Gekopieerd!');
  };

  const getLengthLabel = (l: LengthType) => {
    switch (l) {
      case LengthType.ULTRA_SHORT: return "Ultra kort (1-2 zinnen)";
      case LengthType.SHORT: return "Kort (3-5 zinnen)";
      case LengthType.NORMAL: return "Normaal (6-10 zinnen)";
      case LengthType.EXTENDED: return "Uitgebreid (10+ zinnen)";
      default: return l;
    }
  };

  const getStepAnimation = () => {
    return direction === 'forward' 
      ? 'animate-in slide-in-from-right duration-300' 
      : 'animate-in slide-in-from-left duration-300';
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-32 md:pb-0">
      
      {/* Steps Progress Bar */}
      <div className="flex items-center justify-between mb-8 md:mb-12 px-6 relative max-w-2xl mx-auto">
        <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-gray-100 -translate-y-1/2 -z-0"></div>
        {[1, 2, 3, 4, 5].map((s) => (
          <div 
            key={s} 
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-xs md:text-sm z-10 transition-all duration-500 border-2 ${
              step >= s ? 'bg-[#2D6A4F] text-white border-[#1B4332] shadow-lg scale-110' : 'bg-white border-gray-100 text-gray-300'
            }`}
          >
            {s === 5 ? '✨' : s}
          </div>
        ))}
      </div>

      <div className="bg-white p-6 md:p-12 rounded-[2.5rem] shadow-2xl border border-gray-100 min-h-[550px] flex flex-col relative overflow-hidden transition-all duration-500">
        
        {step === 1 && (
          <div className={`flex-1 flex flex-col ${getStepAnimation()}`}>
            <h2 className="text-2xl md:text-3xl font-black mb-1 tracking-tight">Klantbericht</h2>
            <textarea
              className="flex-1 w-full p-6 md:p-8 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-[#2D6A4F] outline-none transition-all duration-300 text-base md:text-lg min-h-[300px] shadow-inner font-medium"
              placeholder="bv. Hallo, ik heb een vraag over mijn bestelling..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              autoFocus
            />
            <button 
              onClick={() => message.trim() && goToStep(2)}
              className="mt-8 bg-[#1B4332] text-white py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg active:scale-95 disabled:opacity-50"
              disabled={!message.trim()}
            >
              Volgende &rarr;
            </button>
          </div>
        )}

        {step === 2 && (
          <div className={`flex-1 flex flex-col ${getStepAnimation()}`}>
            <h2 className="text-2xl md:text-3xl font-black mb-6 tracking-tight">Kies de toon</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
              {Object.values(ToneType).filter(t => t !== ToneType.CUSTOM).map((t, index) => {
                let isLocked = false;
                if (user?.plan === PlanType.FREE) isLocked = t !== ToneType.FORMAL;
                else if (user?.plan === PlanType.STARTER) isLocked = index > 2;
                return (
                  <button
                    key={t}
                    onClick={() => !isLocked && setTone(t)}
                    className={`p-6 rounded-2xl text-left border-2 transition-all duration-300 flex items-center justify-between group ${
                      tone === t ? 'border-[#2D6A4F] bg-green-50 shadow-md' : 'border-gray-50 bg-gray-50/50 hover:bg-white hover:border-gray-200'
                    }`}
                  >
                    <span className={`text-sm md:text-base font-black ${isLocked ? 'opacity-40' : 'text-gray-800'}`}>{t}</span>
                    {isLocked && <span className="bg-[#FFC300] text-[#1B4332] font-black px-2 py-1 rounded-full text-[8px] uppercase">Upgrade</span>}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-4 mt-auto pt-8">
              <button onClick={() => goToStep(1)} className="flex-1 py-5 font-black uppercase tracking-widest text-[10px] text-gray-400">Terug</button>
              <button onClick={() => goToStep(3)} className="flex-[2] bg-[#1B4332] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg">Volgende &rarr;</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={`flex-1 flex flex-col ${getStepAnimation()}`}>
            <h2 className="text-2xl md:text-3xl font-black mb-6 tracking-tight">De lengte</h2>
            <div className="space-y-3">
              {Object.values(LengthType).map((l) => (
                <button
                  key={l}
                  onClick={() => setLength(l)}
                  className={`w-full p-6 rounded-2xl text-left border-2 transition-all duration-300 flex items-center justify-between group ${
                    length === l ? 'border-[#2D6A4F] bg-green-50 shadow-md' : 'border-gray-50 bg-gray-50/50 hover:bg-white hover:border-gray-200'
                  }`}
                >
                  <span className="text-sm md:text-base font-black text-gray-800">{getLengthLabel(l)}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-4 mt-auto pt-8">
              <button onClick={() => goToStep(2)} className="flex-1 py-5 font-black uppercase tracking-widest text-[10px] text-gray-400">Terug</button>
              <button onClick={() => goToStep(4)} className="flex-[2] bg-[#1B4332] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg">Volgende &rarr;</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className={`flex-1 flex flex-col ${getStepAnimation()}`}>
            <h2 className="text-2xl md:text-3xl font-black mb-2 tracking-tight">Details (optioneel maar aan te raden)</h2>
            <p className="text-gray-500 text-[11px] font-bold mb-8 leading-relaxed tracking-tight">
              Geef hier de belangrijkste punten aan. Koala verbindt deze details op een natuurlijke en professionele manier met je bericht.
            </p>
            
            <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar max-h-[350px] pr-1">
              {details.map((detail, index) => (
                <div key={index} className="animate-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                  <input
                    type="text"
                    className="w-full px-6 py-4 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-[#2D6A4F] outline-none text-sm font-medium transition-all shadow-sm"
                    placeholder={`Detail ${index + 1}`}
                    value={detail}
                    onChange={(e) => handleDetailChange(index, e.target.value)}
                  />
                </div>
              ))}
              
              <button 
                onClick={addDetailBlock}
                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-black uppercase tracking-widest text-[9px] hover:border-[#2D6A4F] hover:text-[#2D6A4F] transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
              >
                <span className="text-lg group-hover:scale-125 transition-transform">＋</span>
                Voeg detail toe
              </button>
            </div>

            <div className="flex gap-4 mt-auto pt-8">
              <button onClick={() => goToStep(3)} className="flex-1 py-5 font-black uppercase tracking-widest text-[10px] text-gray-400">Terug</button>
              <button onClick={handleGenerate} disabled={loading} className="flex-[2] bg-[#1B4332] text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : " ✨ Genereer Nu"}
              </button>
            </div>
          </div>
        )}

        {step === 5 && result && (
          <div className="flex-1 flex flex-col animate-in zoom-in-95 duration-500 fill-mode-both">
            <div className="mb-8 p-5 bg-green-50 rounded-2xl flex items-center gap-4 shadow-inner border border-green-100">
              <KoalaIcon className="w-10 h-10 shrink-0" />
              <div className="flex-1 overflow-hidden">
                <h4 className="font-black uppercase tracking-widest text-[9px] text-[#1B4332] mb-0.5">Koala Analyse</h4>
                <p className="text-[10px] font-black uppercase text-green-700 truncate">{result.intent} • {result.urgency}</p>
              </div>
            </div>
            <div className="space-y-8 flex-1 overflow-y-auto no-scrollbar pb-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Variant A - Direct</h3>
                  <button onClick={() => copyToClipboard(result.variantA)} className="text-[10px] font-black uppercase text-[#2D6A4F] bg-green-50 px-5 py-2.5 rounded-xl border border-green-100 active:scale-95 transition-transform">Kopieer A</button>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl text-sm leading-relaxed text-gray-800 whitespace-pre-wrap font-medium border border-gray-100">{result.variantA}</div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Variant B - Warm</h3>
                  <button onClick={() => copyToClipboard(result.variantB)} className="text-[10px] font-black uppercase text-[#2D6A4F] bg-green-50 px-5 py-2.5 rounded-xl border border-green-100 active:scale-95 transition-transform">Kopieer B</button>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl text-sm leading-relaxed text-gray-800 whitespace-pre-wrap font-medium border border-gray-100">{result.variantB}</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button onClick={handleSave} className="w-full bg-[#1B4332] text-white py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 transition-all">Sla op in Historiek</button>
              <button onClick={() => { setStep(1); setMessage(''); setDetails(['', '', '']); }} className="w-full text-gray-400 font-black uppercase text-[10px] py-4 text-center">Nieuw bericht</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewMessage;
