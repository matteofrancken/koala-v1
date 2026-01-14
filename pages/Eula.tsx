
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Eula: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 bg-[#1B4332]/40 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={() => navigate(-1)}></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl bg-white rounded-[3rem] shadow-[0_60px_120px_rgba(0,0,0,0.3)] border border-white relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-8 left-8 z-10 w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-[#1B4332] hover:bg-gray-100 transition-all active:scale-90 group"
        >
          <span className="text-2xl group-hover:-translate-x-0.5 transition-transform">←</span>
        </button>

        <div className="p-10 md:p-14 pb-8 text-center border-b border-gray-100">
          <h1 className="text-3xl md:text-4xl font-black text-[#1B4332] uppercase tracking-tighter mt-14 md:mt-0">EULA</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">END USER LICENSE AGREEMENT</p>
        </div>

        <div className="flex-1 overflow-y-auto p-10 md:p-16 prose prose-sm max-w-none text-gray-600 font-medium leading-relaxed space-y-8 scrollbar-hide text-center">
          <p>Door Koala te gebruiken accepteert u de licentievoorwaarden voor het gebruik van onze AI-software.</p>
        </div>

        <div className="p-10 bg-gray-50/50 border-t border-gray-100 flex justify-center">
          <button 
            onClick={() => navigate(-1)}
            className="bg-[#1B4332] text-white px-12 py-6 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 transition-all"
          >
            IK GA AKKOORD
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Eula;
