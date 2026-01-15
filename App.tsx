
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, PlanType, AppState, GeneratedResponse, LengthType } from './types';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewMessage from './pages/NewMessage';
import History from './pages/History';
import Pricing from './pages/Pricing';
import Settings from './pages/Settings';
import CheckoutSuccess from './pages/CheckoutSuccess';
import StripeMock from './pages/StripeMock';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Eula from './pages/Eula';
import AiTransparency from './pages/AiTransparency';
import { KoalaIcon } from './constants';
import { backendService } from './services/backend';
import { supabase } from './services/supabase';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    user: null,
    history: [],
    loading: true,
  });

  const loadAppData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email) {
      try {
        const user = await backendService.getUser(session.user.email);
        if (user) {
          const history = await backendService.getHistory(user.id);
          setState({ user, history, loading: false });
          return;
        }
      } catch (err) { console.warn("Session retrieval failed"); }
    }
    setState(prev => ({ ...prev, loading: false }));
  };

  useEffect(() => {
    loadAppData();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') loadAppData();
      if (event === 'SIGNED_OUT') setState({ user: null, history: [], loading: false });
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (user: User) => {
    localStorage.setItem('koala_session_email', user.email);
    await backendService.saveUser(user);
    const history = await backendService.getHistory(user.id);
    setState({ user, history, loading: false });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('koala_session_email');
    setState({ user: null, history: [], loading: false });
    window.location.hash = '#/';
  };

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ repeat: Infinity, duration: 2 }}>
          <KoalaIcon className="w-16 h-16" />
        </motion.div>
      </div>
    );
  }

  return (
    <HashRouter>
      <RoutesWrapper 
        state={state} 
        handleLogin={handleLogin} 
        handleLogout={handleLogout} 
        loadAppData={loadAppData}
        setState={setState}
      />
    </HashRouter>
  );
};

const RoutesWrapper = ({ state, handleLogin, handleLogout, loadAppData, setState }: any) => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialRedirectDone = useRef(false);
  
  // Force land op de landingspagina bij ELKE nieuwe app load (refresh) als je niet bent ingelogd
  useEffect(() => {
    if (!state.loading && !state.user && !initialRedirectDone.current) {
      if (location.pathname !== '/') {
        navigate('/', { replace: true });
      }
      initialRedirectDone.current = true;
    }
  }, [state.loading, state.user, navigate]);

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Landing user={state.user} />}>
        <Route path="login" element={<Login mode="login" onLogin={handleLogin} />}>
          <Route path="terms" element={<TermsOfService />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
        </Route>
        <Route path="signup" element={<Login mode="signup" onLogin={handleLogin} />}>
          <Route path="terms" element={<TermsOfService />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
        </Route>
        <Route path="terms" element={<TermsOfService />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="eula" element={<Eula />} />
        <Route path="ai-transparency" element={<AiTransparency />} />
        <Route path="stripe-checkout" element={<StripeMock />} />
        <Route path="onboarding" element={
          state.user ? <Onboarding user={state.user} onUpdateUser={(u: any) => handleLogin(u)} /> : <Navigate to="/signup" />
        } />
      </Route>

      <Route element={state.user ? <Layout user={state.user} onLogout={handleLogout} /> : <Navigate to="/" />}>
        <Route path="/dashboard" element={<Dashboard user={state.user} history={state.history} />} />
        <Route path="/new" element={
          <NewMessage 
            user={state.user} 
            onComplete={async (item) => {
              await backendService.addToHistory(item);
              await loadAppData();
            }} 
            onRecordUsage={async (len) => {
              if (state.user) {
                const updatedUser = { 
                  ...state.user, 
                  responsesUsed: state.user.responsesUsed + 1,
                  timeSaved: (state.user.timeSaved || 0) + (len === 'Ultra kort' ? 1 : 5)
                };
                await backendService.saveUser(updatedUser);
                setState((prev: any) => ({ ...prev, user: updatedUser }));
              }
            }} 
          />
        } />
        <Route path="/history" element={
          <History 
            user={state.user} 
            history={state.history} 
            onDelete={async (id) => {
              await backendService.deleteFromHistory(id);
              await loadAppData();
            }}
          />
        } />
        <Route path="/pricing" element={<Pricing user={state.user} onUpgrade={(u: any) => handleLogin(u)} />} />
        <Route path="/settings" element={<Settings user={state.user} onUpdate={(u: any) => handleLogin(u)} onLogout={handleLogout} />}>
          <Route path="terms" element={<TermsOfService />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="eula" element={<Eula />} />
          <Route path="ai-transparency" element={<AiTransparency />} />
        </Route>
        <Route path="/checkout/success" element={<CheckoutSuccess user={state.user} onUpgrade={(u: any) => handleLogin(u)} />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const Layout: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const location = useLocation();
  
  const NavItem = ({ to, icon, label }: { to: string; icon: string; label: string }) => {
    const isActive = location.pathname.startsWith(to);
    return (
      <Link to={to} className={`flex items-center gap-4 px-8 py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-[12px] transition-all duration-300 relative ${isActive ? 'bg-[#1B4332] text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50 hover:text-[#2D6A4F]'}`}>
        <span className="text-xl flex items-center justify-center w-6 h-6">{icon}</span>
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row overflow-x-hidden relative">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] bg-[#2D6A4F]/3 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 -right-64 w-[700px] h-[700px] bg-[#FFC300]/3 rounded-full blur-[140px]"></div>
      </div>

      <aside className="hidden lg:flex w-80 bg-white/80 backdrop-blur-xl border-r border-gray-100 flex-col p-8 fixed h-screen z-50 shadow-[10px_0_30px_rgba(0,0,0,0.01)]">
        <Link to="/dashboard" className="flex items-center gap-4 mb-16 px-2 group">
          <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <KoalaIcon className="w-10 h-10" />
          </motion.div>
          <span className="text-2xl font-black text-[#1B4332] tracking-tighter uppercase">Koala</span>
        </Link>
        <nav className="flex-1 space-y-2">
          <NavItem to="/dashboard" icon="🏠" label="Dashboard" />
          <NavItem to="/new" icon="✍️" label="Nieuw" />
          <NavItem to="/history" icon="📜" label="Historiek" />
          <NavItem to="/pricing" icon="💎" label="Plannen" />
          <NavItem to="/settings" icon="⚙️" label="Instellingen" />
        </nav>
        <div className="mt-auto pt-8 border-t border-gray-50">
          <button onClick={onLogout} className="w-full text-left px-8 py-4 text-gray-300 font-black uppercase tracking-widest text-[10px] hover:text-red-400 transition-colors">Uitloggen</button>
        </div>
      </aside>

      <header className="lg:hidden bg-white/90 backdrop-blur-xl border-b border-gray-100 p-4 sticky top-0 z-[60] flex justify-between items-center h-20 shadow-sm">
        <Link to="/dashboard" className="flex items-center gap-3"><KoalaIcon className="w-10 h-10" /><span className="text-xl font-black text-[#1B4332] tracking-tight uppercase">Koala</span></Link>
        <Link to="/settings" className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-xl active:scale-90 transition-transform shadow-inner border border-gray-100 text-gray-400">⚙️</Link>
      </header>

      <main className="flex-1 lg:ml-80 p-4 md:p-12 lg:p-20 pb-32 lg:pb-20 max-w-full overflow-x-hidden relative">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <nav className="lg:hidden bg-white/95 backdrop-blur-2xl border-t border-gray-100 fixed bottom-0 left-0 right-0 z-[70] flex justify-around p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-15px_40px_rgba(0,0,0,0.08)]">
        <MobileNavItem to="/dashboard" icon="🏠" isActive={location.pathname === '/dashboard'} />
        <MobileNavItem to="/new" icon="✍️" isActive={location.pathname === '/new'} />
        <MobileNavItem to="/history" icon="📜" isActive={location.pathname === '/history'} />
        <MobileNavItem to="/pricing" icon="💎" isActive={location.pathname === '/pricing'} />
      </nav>
    </div>
  );
};

const MobileNavItem = ({ to, icon, isActive }: any) => (
  <Link to={to} className={`flex items-center justify-center p-4 rounded-2xl transition-all duration-300 ${isActive ? 'bg-[#1B4332] text-white shadow-lg -translate-y-2 scale-110' : 'text-gray-300 active:scale-95'}`}>
    <span className="text-2xl flex items-center justify-center w-8 h-8">{icon}</span>
  </Link>
);

export default App;
