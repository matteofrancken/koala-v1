
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KOKO_LOGO_URL } from '../constants';
import { askKoko } from '../services/ai';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'Dag! Ik ben Koko de Koala. 🐨 Waarmee kan ik je helpen vandaag?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fallback icon URL
  const FALLBACK_ICON = "https://cdn-icons-png.flaticon.com/512/3069/3069172.png";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await askKoko(userMessage, messages);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, ik kon geen verbinding maken met mijn koala-boom. 🌳 Probeer het later nog eens!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="pointer-events-auto w-[350px] md:w-[400px] max-h-[500px] md:max-h-[600px] bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.2)] border border-white flex flex-col mb-6 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#1B4332] p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-md overflow-hidden">
                  <img 
                    src={KOKO_LOGO_URL} 
                    className="w-full h-full object-contain" 
                    alt="Koko profile" 
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_ICON; }}
                  />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-tighter text-sm leading-none mb-0.5">Koko de Koala</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
                <span className="text-xl">×</span>
              </button>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-gray-50/50"
            >
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl md:rounded-[1.5rem] text-sm font-medium leading-relaxed shadow-sm ${
                    m.role === 'user' 
                    ? 'bg-[#1B4332] text-white rounded-br-none' 
                    : 'bg-white text-gray-700 rounded-bl-none border border-gray-100'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white px-5 py-3.5 rounded-2xl md:rounded-[1.5rem] rounded-bl-none border border-gray-100 flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-50">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <input 
                  type="text" 
                  placeholder="Typ een bericht..." 
                  className="flex-1 bg-gray-50 border-none px-5 py-3.5 rounded-xl md:rounded-2xl outline-none focus:ring-2 focus:ring-[#1B4332]/10 font-bold text-sm transition-all"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-12 h-12 bg-[#FFC300] text-[#1B4332] rounded-xl md:rounded-2xl flex items-center justify-center text-xl shadow-lg active:scale-90 transition-all disabled:opacity-50"
                >
                  🚀
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl flex items-center justify-center transition-all duration-500 relative ${
          isOpen ? 'bg-white rotate-90 border-2 border-[#1B4332]' : 'bg-[#1B4332] border-4 border-white'
        } ${window.innerWidth < 1024 ? 'mb-20' : ''}`}
      >
        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden">
          <img 
            src={KOKO_LOGO_URL} 
            className={`w-full h-full object-contain transition-all duration-500 ${isOpen ? 'grayscale' : ''}`} 
            alt="Koko Logo" 
            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_ICON; }}
          />
        </div>
      </motion.button>
    </div>
  );
};

export default Chatbot;
