
import React, { useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { User, PlanType } from '../types';
import { backendService } from '../services/backend';
import { supabase } from '../services/supabase';

interface LoginProps {
  mode: 'login' | 'signup';
  onLogin: (user: User) => Promise<void>;
}

const Login: React.FC<LoginProps> = ({ mode, onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Wachtwoord moet minimaal 8 karakters bevatten.');
      return;
    }

    if (mode === 'signup' && !acceptedTerms) {
      setError('Je moet akkoord gaan met de voorwaarden en het privacybeleid.');
      return;
    }

    setLoading(true);

    try {
      const cleanEmail = email.toLowerCase().trim();

      if (mode === 'signup') {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: {
              full_name: fullName,
              business_name: '',
            }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          const newUser: User = {
            id: authData.user.id,
            email: cleanEmail,
            fullName: fullName,
            businessName: '',
            onboardingCompleted: false,
            plan: PlanType.FREE,
            responsesUsed: 0,
            maxResponses: 10,
            timeSaved: 0,
            createdAt: new Date().toISOString()
          };
          
          await backendService.saveUser(newUser);
          
          if (authData.session) {
             await onLogin(newUser);
          }
          
          // Direct naar dashboard, de rest wordt door de popup afgehandeld
          navigate('/dashboard');
        }
      } else {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (authError) {
          setError('E-mailadres of wachtwoord onjuist.');
          return;
        }

        if (authData.user) {
          const user = await backendService.getUser(cleanEmail);
          if (user) {
            await onLogin(user);
            navigate('/dashboard');
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden.');
    } finally {
      setLoading(false);
    }
  };

  const basePath = mode === 'signup' ? '/signup' : '/login';
  const isJuridicalOpen = location.pathname.includes('/terms') || location.pathname.includes('/privacy');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1B4332]/10 backdrop-blur-md animate-in fade-in duration-300">
      {/* Background click handler */}
      <div className="absolute inset-0 z-0" onClick={() => !isJuridicalOpen && navigate('/')}></div>

      {/* Main Login Card */}
      <div className={`w-full max-w-md bg-white p-10 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.15)] border border-white/50 relative animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 z-10 ${isJuridicalOpen ? 'opacity-20 pointer-events-none' : ''}`}>
        <button 
          onClick={() => navigate('/')}
          className="absolute top-8 left-8 w-10 h-10 bg-[#F8F9FA] rounded-full flex items-center justify-center text-gray-400 hover:text-[#1B4332] hover:bg-gray-100 transition-all active:scale-90 group"
          title="Terug"
        >
          <span className="text-xl group-hover:-translate-x-0.5 transition-transform">←</span>
        </button>

        <div className="pt-8 flex flex-col items-center">
          <h1 className="text-2xl md:text-[28px] font-black text-center mb-10 uppercase tracking-tighter text-[#1B4332]">
            {mode === 'login' ? 'Welkom terug' : 'Maak je account'}
          </h1>
          
          {error && (
            <div className="w-full mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase text-center border border-red-100 animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {mode === 'signup' && (
              <input 
                type="text" 
                placeholder="Volledige naam"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-8 py-6 rounded-2xl bg-[#F8F9FA] border-2 border-transparent focus:border-[#2D6A4F] focus:bg-white outline-none font-bold transition-all text-sm placeholder:text-gray-400"
                required
              />
            )}
            <input 
              type="email" 
              placeholder="E-mailadres"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-8 py-6 rounded-2xl bg-[#F8F9FA] border-2 border-transparent focus:border-[#2D6A4F] focus:bg-white outline-none font-bold transition-all text-sm placeholder:text-gray-400"
              required
            />
            <input 
              type="password" 
              placeholder="Wachtwoord (min. 8 tekens)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-8 py-6 rounded-2xl bg-[#F8F9FA] border-2 border-transparent focus:border-[#2D6A4F] focus:bg-white outline-none font-bold transition-all text-sm placeholder:text-gray-400"
              required
            />

            {mode === 'signup' && (
              <div className="flex items-start gap-3 px-2 py-4">
                <div className="relative flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-5 h-5 rounded-lg border-2 border-gray-100 text-[#2D6A4F] focus:ring-[#2D6A4F] cursor-pointer transition-all accent-[#2D6A4F]"
                    required
                  />
                </div>
                <label htmlFor="terms" className="text-[10px] font-bold text-gray-400 uppercase leading-tight tracking-wide cursor-pointer">
                  Ik ga akkoord met de <Link to={`${basePath}/terms`} className="text-[#2D6A4F] underline">VOORWAARDEN</Link> en het <Link to={`${basePath}/privacy`} className="text-[#2D6A4F] underline">PRIVACYBELEID</Link>.
                </label>
              </div>
            )}
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-6 mt-2 bg-[#1B4332] text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl active:scale-95 hover:bg-[#2D6A4F] transition-all disabled:opacity-50 text-[11px]"
            >
              {loading ? 'Laden...' : (mode === 'login' ? 'Inloggen' : 'Registreren')}
            </button>
          </form>

          <div className="mt-12 text-center">
            <Link 
              to={mode === 'login' ? '/signup' : '/login'} 
              className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 hover:text-[#1B4332] transition-colors"
            >
              {mode === 'login' ? 'Nog geen account? Maak er een' : 'Heb je al een account? Log in'}
            </Link>
          </div>
        </div>
      </div>
      
      {/* Outlet for Terms/Privacy popups */}
      {isJuridicalOpen && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center p-4">
          <Outlet />
        </div>
      )}
    </div>
  );
};

export default Login;
