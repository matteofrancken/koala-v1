
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ToneType, LengthType, GeneratedResponse, PlanType } from '../types';
import { generateKoalaResponse } from '../services/ai';
import { KoalaIcon } from '../constants';

interface NewMessageProps {
  user: User | null;
  onComplete: (item: GeneratedResponse) => Promise<void>;
  onRecordUsage: (length: LengthType) => void;
}

const NewMessage: React.FC<NewMessageProps> = ({ user, onComplete, onRecordUsage }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState<ToneType>(ToneType.BUSINESS);
  const [customToneDescription, setCustomToneDescription] = useState('');
  const [details, setDetails] = useState<string[]>(['', '', '']);
  const [length, setLength] = useState<LengthType>(LengthType.NORMAL);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // Stel standaard de eerste toegestane toon in op basis van plan
    if (user) {
      const plan = user.plan.toString();
      if (plan === 'Gratis' || plan === PlanType.FREE) {
        setTone(ToneType.FORMAL);
      } else if (plan === 'Starter' || plan === PlanType.STARTER) {
        setTone(ToneType.FORMAL);
      } else {
        setTone(ToneType.BUSINESS);
      }
    }
  }, [user]);

  const isToneAllowed = (targetTone: ToneType): boolean => {
    if (!user) return false;
    const plan = user.plan.toString();
    
    if (plan === 'Unlimited' || plan === PlanType.UNLIMITED) return true;
    
    if (plan === 'Pro' || plan === PlanType.PRO) {
      return targetTone !== ToneType.CUSTOM;
    }
    
    if (plan === 'Starter' || plan === PlanType.STARTER) {
      return [ToneType.FORMAL, ToneType.BUSINESS, ToneType.INFORMAL].includes(targetTone);
    }
    
    // Gratis plan
    return targetTone === ToneType.FORMAL;
  };

  const goToStep = (s: number) => {
    setDirection(s > step ? 'forward' : 'backward');
    setStep(s);
  };

  const handleToneSelect = (t: ToneType) => {
    if (isToneAllowed(t)) {
      setTone(t);
    } else {
      const confirmUpgrade = window.confirm(`De stijl "${t}" is niet beschikbaar in jouw huidige plan. Wil je upgraden om deze en andere stijlen te ontgrendelen?`);
      if (confirmUpgrade) {
        navigate('/pricing');
      }
    }
  };

  const handleGenerate = async () => {
    if (!message.trim() || !user) return;
    if (user.responsesUsed >= user.maxResponses) {
      alert("Maandelijkse limiet bereikt.");
      navigate('/pricing');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const activeTone = tone === ToneType.CUSTOM ? `Custom: ${customToneDescription}` : tone;
      const combinedDetails = details.filter(d => d.trim() !== "").join(" | ");
      
      const textData = await generateKoalaResponse(message, activeTone, length, user.fullName, user.businessName, combinedDetails);

      setResult({ ...textData, visualUrl: '' });
      onRecordUsage(length);
      setDirection('forward');
      setStep(5);
    } catch (err: any) {
      setError("Genereren mislukt. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result || !user || saving) return;

    const isFreePlan = user.plan === PlanType.FREE || user.plan.toString() === 'Gratis';
    if (isFreePlan) {
      alert("Helaas! Historiek is een Premium Feature. Upgrade naar Starter of Pro om je berichten op te slaan.");
      navigate('/pricing');
      return;
    }
    
    setSaving(true);
    setError(null);
    try {
      const newEntry: GeneratedResponse = {
        id: crypto.randomUUID(),
        userId: user.id,
        originalMessage: message,
        aiResponseA: result.variantA,
        aiResponseB: result.variantB,
        tone: tone === ToneType.CUSTOM ? customToneDescription : tone,
        length,
        intent: result.intent,
        emotion: result.emotion,
        urgency: result.urgency,
        visualUrl: '',
        createdAt: new Date().toISOString(),
      };
      
      await onComplete(newEntry);
      navigate('/dashboard');
    } catch (err) {
      console.error("Save error:", err);
      setError("Kon bericht niet opslaan in historiek.");
      alert("Kon niet opslaan. Controleer je internetverbinding.");
    } finally {
      setSaving(false);
    }
  };

  const getStepAnimation = () => ({
    initial: { opacity: 0, x: direction === 'forward' ? 50 : -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: direction === 'forward' ? -50 : 50 },
    transition: { duration: 0.3 }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32">
      <header className="px-1">
        <h1 className="text-3xl md:text-5xl font-black text-[#1B4332] tracking-tighter">Nieuw Bericht</h1>
      </header>

      {error && (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-red-100 mx-1">
          {error}
        </div>
      )}

      <nav className="flex justify-between bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm">
        {[1,2,3,4,5].map(s => (
          <div key={s} className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${step >= s ? 'bg-[#2D6A4F] text-white' : 'bg-gray-50 text-gray-300'}`}>{s}</div>
        ))}
      </nav>

      <main className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" {...getStepAnimation()} className="space-y-6">
              <textarea 
                className="w-full p-8 rounded-[2rem] bg-white border-2 border-gray-100 focus:border-[#2D6A4F] outline-none h-64 text-xl shadow-sm"
                placeholder="Plak klantbericht..."
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
              <button onClick={() => message.trim() && goToStep(2)} className="w-full bg-[#1B4332] text-white py-6 rounded-2xl font-black uppercase shadow-xl active:scale-95 transition-all">Volgende</button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" {...getStepAnimation()} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.values(ToneType).map(t => {
                  const allowed = isToneAllowed(t);
                  return (
                    <button 
                      key={t} 
                      onClick={() => handleToneSelect(t)} 
                      className={`p-6 rounded-2xl border-2 font-black flex items-center justify-between transition-all ${
                        tone === t ? 'border-[#2D6A4F] bg-green-50 text-[#1B4332]' : 'border-gray-50 bg-white text-gray-400'
                      } ${!allowed ? 'opacity-60 grayscale' : 'hover:border-[#2D6A4F]/30 hover:bg-gray-50'}`}
                    >
                      <span>{t}</span>
                      {!allowed && <span className="text-lg">🔒</span>}
                      {allowed && tone === t && <span className="text-lg text-[#2D6A4F]">✓</span>}
                    </button>
                  );
                })}
              </div>
              
              {tone === ToneType.CUSTOM && isToneAllowed(ToneType.CUSTOM) && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Beschrijf jouw eigen stijl</label>
                  <input 
                    type="text" 
                    placeholder="Bijv. Zeer sarcastisch, extreem enthousiast, of juridisch formeel..." 
                    className={`w-full p-6 rounded-2xl bg-white border-2 font-bold focus:border-[#2D6A4F] outline-none transition-all ${
                      tone === ToneType.CUSTOM && !customToneDescription.trim() ? 'border-orange-200' : 'border-gray-100'
                    }`}
                    value={customToneDescription}
                    onChange={e => setCustomToneDescription(e.target.value)}
                  />
                </motion.div>
              )}

              <button 
                onClick={() => {
                  if (tone === ToneType.CUSTOM && !customToneDescription.trim()) {
                    alert("Vul a.u.b. een beschrijving in voor je eigen stijl.");
                    return;
                  }
                  tone && goToStep(3);
                }} 
                className={`w-full py-6 rounded-2xl font-black uppercase mt-4 shadow-xl active:scale-95 transition-all ${
                  tone === ToneType.CUSTOM && !customToneDescription.trim() 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#1B4332] text-white'
                }`}
              >
                Volgende
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" {...getStepAnimation()} className="grid grid-cols-2 gap-4">
              {Object.values(LengthType).map(l => (
                <button key={l} onClick={() => setLength(l)} className={`p-6 rounded-2xl border-2 font-black transition-all ${length === l ? 'border-[#2D6A4F] bg-green-50 text-[#1B4332]' : 'border-gray-50 bg-white text-gray-400 hover:border-[#2D6A4F]/30'}`}>{l}</button>
              ))}
              <button onClick={() => goToStep(4)} className="col-span-2 bg-[#1B4332] text-white py-6 rounded-2xl font-black uppercase mt-4 shadow-xl active:scale-95 transition-all">Volgende</button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" {...getStepAnimation()} className="space-y-4">
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] text-center mb-6">Voeg extra details toe voor een preciezer antwoord</p>
              {details.map((d, i) => (
                <input key={i} className="w-full p-6 rounded-2xl bg-white border-2 border-gray-100 font-bold focus:border-[#2D6A4F] outline-none shadow-sm transition-all" value={d} onChange={e => {
                  const n = [...details]; n[i] = e.target.value; setDetails(n);
                }} placeholder={`Detail ${i + 1}`} />
              ))}
              <button onClick={handleGenerate} disabled={loading} className="w-full bg-[#FFC300] text-[#1B4332] py-6 rounded-2xl font-black uppercase shadow-xl active:scale-95 transition-all mt-6">
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-[#1B4332]/20 border-t-[#1B4332] rounded-full animate-spin"></div>
                    <span>Koala schrijft...</span>
                  </div>
                ) : 'Genereer Antwoorden ✨'}
              </button>
            </motion.div>
          )}

          {step === 5 && result && (
            <motion.div key="s5" {...getStepAnimation()} className="space-y-8">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 space-y-4 relative group">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-[#2D6A4F] uppercase text-xs tracking-widest">Variant A - Direct</h3>
                  <button onClick={() => { navigator.clipboard.writeText(result.variantA); alert('Gekopieerd!'); }} className="text-[10px] font-black uppercase text-gray-300 hover:text-[#2D6A4F]">Kopieer</button>
                </div>
                <p className="italic text-gray-700 whitespace-pre-wrap leading-relaxed">"{result.variantA}"</p>
              </div>
              
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 space-y-4 relative group">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-[#2D6A4F] uppercase text-xs tracking-widest">Variant B - Warm</h3>
                  <button onClick={() => { navigator.clipboard.writeText(result.variantB); alert('Gekopieerd!'); }} className="text-[10px] font-black uppercase text-gray-300 hover:text-[#2D6A4F]">Kopieer</button>
                </div>
                <p className="italic text-gray-700 whitespace-pre-wrap leading-relaxed">"{result.variantB}"</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#1B4332] text-white py-6 rounded-2xl font-black uppercase shadow-2xl active:scale-95 transition-all">
                  {saving ? 'Bezig met opslaan...' : 'Opslaan in Historiek 📜'}
                </button>
                <button onClick={() => goToStep(1)} className="px-8 py-6 rounded-2xl font-black uppercase text-gray-400 bg-gray-50 hover:bg-gray-100 transition-all">Nieuwe start</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default NewMessage;
