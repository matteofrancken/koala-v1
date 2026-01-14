
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { KoalaIcon } from '../constants';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'je e-mailadres';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1B4332]/10 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white p-12 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.15)] border border-white text-center animate-in zoom-in-95 duration-500">
        
        <div className="mb-10 flex justify-center">
          <div className="w-24 h-24 bg-green-50 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner border border-green-100">
            ✉️
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-[#1B4332] mb-6 uppercase tracking-tighter">
          Check je inbox!
        </h1>
        
        <p className="text-gray-500 font-medium leading-relaxed mb-10">
          We hebben een verificatiemail gestuurd naar <span className="text-[#1B4332] font-black">{email}</span>. 
          <br /><br />
          Klik op de link in de e-mail om je account te activeren. De mail komt van <span className="font-bold">info@koala-ai.com</span>.
        </p>

        <div className="space-y-4">
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-[#1B4332] text-white py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 hover:bg-[#2D6A4F] transition-all"
          >
            Ga naar Login
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#1B4332] transition-colors"
          >
            Niets ontvangen? Klik hier om te vernieuwen
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-50">
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-loose">
            Vergeet niet je spam-folder te controleren.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
