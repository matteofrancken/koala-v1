
import React, { useState, useEffect } from 'react';
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
    if (user?.plan === PlanType.FREE || user?.plan.toString() === 'Gratis') {
      setTone(ToneType.FORMAL);
    }
  }, [user]);

  const goToStep = (s: number) => {
    setDirection(s > step ? 'forward' : 'backward');
    setStep(s);
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

      // Beeldgeneratie verwijderd voor maximale snelheid
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

    // --- PREMIUM FEATURE CHECK ---
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
              <button onClick={() => message.trim() && goToStep(2)} className="w-full bg-[#1B4332] text-white py-6 rounded-2xl font-black uppercase">Volgende</button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" {...getStepAnimation()} className="grid grid-cols-2 gap-4">
              {Object.values(ToneType).map(t => (
                <button key={t} onClick={() => setTone(t)} className={`p-6 rounded-2xl border-2 font-black ${tone === t ? 'border-[#2D6A4F] bg-green-50' : 'border-gray-50'}`}>{t}</button>
              ))}
              <button onClick={() => goToStep(3)} className="col-span-2 bg-[#1B4332] text-white py-6 rounded-2xl font-black uppercase mt-4">Volgende</button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" {...getStepAnimation()} className="grid grid-cols-2 gap-4">
              {Object.values(LengthType).map(l => (
                <button key={l} onClick={() => setLength(l)} className={`p-6 rounded-2xl border-2 font-black ${length === l ? 'border-[#2D6A4F] bg-green-50' : 'border-gray-50'}`}>{l}</button>
              ))}
              <button onClick={() => goToStep(4)} className="col-span-2 bg-[#1B4332] text-white py-6 rounded-2xl font-black uppercase mt-4">Volgende</button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" {...getStepAnimation()} className="space-y-4">
              {details.map((d, i) => (
                <input key={i} className="w-full p-6 rounded-2xl bg-white border-2 border-gray-100 font-bold" value={d} onChange={e => {
                  const n = [...details]; n[i] = e.target.value; setDetails(n);
                }} placeholder="Extra detail..." />
              ))}
              <button onClick={handleGenerate} disabled={loading} className="w-full bg-[#FFC300] text-[#1B4332] py-6 rounded-2xl font-black uppercase shadow-xl">{loading ? 'Bezig...' : 'Genereer Antwoorden'}</button>
            </motion.div>
          )}

          {step === 5 && result && (
            <motion.div key="s5" {...getStepAnimation()} className="space-y-8">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 space-y-4">
                <h3 className="font-black text-[#2D6A4F] uppercase text-xs">Variant A</h3>
                <p className="italic text-gray-700 whitespace-pre-wrap">{result.variantA}</p>
              </div>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 space-y-4">
                <h3 className="font-black text-[#2D6A4F] uppercase text-xs">Variant B</h3>
                <p className="italic text-gray-700 whitespace-pre-wrap">{result.variantB}</p>
              </div>
              <button onClick={handleSave} disabled={saving} className="w-full bg-[#1B4332] text-white py-6 rounded-2xl font-black uppercase shadow-2xl">
                {saving ? 'Bezig met opslaan...' : 'Opslaan in Historiek'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default NewMessage;
