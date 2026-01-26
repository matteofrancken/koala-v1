
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, PlanType, AppState, GeneratedResponse, LengthType } from './types';
import Landing from './pages/Landing';
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
import Chatbot from './components/Chatbot';

// Safe storage helper om Safari Private Mode crashes te voorkomen
const safeStorage = {
  getItem: (key: string, type: 'local' | 'session' = 'local') => {
    try {
      return type === 'local' ? localStorage.getItem(key) : sessionStorage.getItem(key);
    } catch (e) { return null; }
  },
  setItem: (key: string, value: string, type: 'local' | 'session' = 'local') => {
    try {
      type === 'local' ? localStorage.setItem(key, value) : sessionStorage.setItem(key, value);
    } catch (e) { /* Storage blocked */ }
  },
  removeItem: (key: string, type: 'local' | 'session' = 'local') => {
    try {
      type === 'local' ? localStorage.removeItem(key) : sessionStorage.removeItem(key);
    } catch (e) { /* Storage blocked */ }
  },
  clear: () => {
    try { localStorage.clear(); } catch (e) { /* Storage blocked */ }
  }
};

// Helper component to force scroll to top on every navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const overlays = ['/terms', '/privacy', '/eula', '/ai-transparency'];
    const isOverlay = overlays.some(o => pathname.endsWith(o));
    if (!isOverlay) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);
  return null;
};

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
    // Check of we terugkomen van een betaling (zoals browser back button van Stripe)
    const isReturningFromPayment = safeStorage.getItem('koala_payment_in_progress', 'session') === 'true';

    // FORCE LOGOUT ON EVERY REFRESH / INITIAL LOAD (Except when returning from payment)
    const forceInitialLogout = async () => {
      // Clear all local session data immediately
      safeStorage.clear();
      // Inform Supabase to sign out (invalidates token)
      await supabase.auth.signOut();
      // Ensure the state is clean and show the landing page
      setState({ user: null, history: [], loading: false });
    };

    if (isReturningFromPayment) {
      // Gebruik de "one-time" pass: verwijder de vlag en laad de sessie
      safeStorage.removeItem('koala_payment_in_progress', 'session');
      loadAppData();
    } else {
      // Standaard gedrag: uitloggen op elke refresh
      forceInitialLogout();
    }

    // Setup listener for future login events during this same session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        loadAppData();
      }
      if (event === 'SIGNED_OUT') {
        setState({ user: null, history: [], loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (user: User) => {
    safeStorage.setItem('koala_session_email', user.email);
    await backendService.saveUser(user);
    const history = await backendService.getHistory(user.id);
    setState({ user, history, loading: false });
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setState(prev => ({ ...prev, user: updatedUser }));
    await backendService.saveUser(updatedUser);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    safeStorage.clear();
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
      <ScrollToTop />
      <RoutesWrapper 
        state={state} 
        handleLogin={handleLogin} 
        handleUpdateUser={handleUpdateUser}
        handleLogout={handleLogout} 
        loadAppData={loadAppData}
        setState={setState}
      />
      <Chatbot />
    </HashRouter>
  );
};

const RoutesWrapper = ({ state, handleLogin, handleUpdateUser, handleLogout, loadAppData, setState }: any) => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialRedirectDone = useRef(false);
  
  // Auto-redirect for logged in users on landing page
  useEffect(() => {
    if (state.user && location.pathname === '/') {
      navigate('/dashboard', { replace: true });
    }
  }, [state.user, location.pathname, navigate]);

  useEffect(() => {
    if (!state.loading && !state.user && !initialRedirectDone.current) {
      if (location.pathname !== '/') {
        navigate('/', { replace: true });
      }
      initialRedirectDone.current = true;
    }
  }, [state.loading, state.user, navigate, location.pathname]);

  return (
    <Routes location={location}>
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
      </Route>

      <Route element={state.user ? <Layout user={state.user} onLogout={handleLogout} /> : <Navigate to="/" />}>
        <Route path="/dashboard" element={<Dashboard user={state.user} history={state.history} />} />
        <Route path="/new" element={
          <NewMessage 
            user={state.user} 
            onComplete={async (item: GeneratedResponse) => {
              try {
                await backendService.addToHistory(item);
                setState((prev: AppState) => ({
                  ...prev,
                  history: [item, ...prev.history]
                }));
              } catch (err) {
                console.error("Critical: Could not save message to history database", err);
                throw err;
              }
            }} 
            onRecordUsage={async (len: LengthType) => {
              if (state.user) {
                const updatedUser = { 
                  ...state.user, 
                  responsesUsed: state.user.responsesUsed + 1,
                  timeSaved: (state.user.timeSaved || 0) + (len === 'Ultra kort' ? 1 : 5)
                };
                await handleUpdateUser(updatedUser);
              }
            }} 
          />
        } />
        <Route path="/history" element={
          <History 
            user={state.user} 
            history={state.history} 
            onUpdate={loadAppData}
            onDelete={async (id: string) => {
              setState((prev: AppState) => ({
                ...prev,
                history: prev.history.filter(h => h.id !== id)
              }));
              await backendService.deleteFromHistory(id);
            }}
          />
        } />
        <Route path="/pricing" element={<Pricing user={state.user} onUpgrade={handleUpdateUser} />} />
        <Route path="/settings" element={<Settings user={state.user} onUpdate={handleUpdateUser} onLogout={handleLogout} />}>
          <Route path="terms" element={<TermsOfService />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="eula" element={<Eula />} />
          <Route path="ai-transparency" element={<AiTransparency />} />
        </Route>
        <Route path="/checkout/success" element={<CheckoutSuccess user={state.user} onUpgrade={handleUpdateUser} />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const Layout: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const location = useLocation();
  
  // Blur/Dim logic only for destructive or system-critical overlays (onboarding, login logic)
  // We explicitly EXCLUDE legal docs from the dimming effect.
  const isOverlayActive = location.pathname.includes('/onboarding') || 
                          location.pathname.includes('/login') || 
                          location.pathname.includes('/signup');

  const NavItem = ({ to, icon, label }: { to: string; icon: string; label: string }) => {
    const isActive = location.pathname.startsWith(to);
    return (
      <Link to={to} className={`flex items-center gap-4 px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-[0.1em] text-[11px] transition-all duration-300 relative ${isActive ? 'bg-[#1B4332] text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50 hover:text-[#2D6A4F]'}`}>
        <span className="text-lg md:text-xl flex items-center justify-center w-6 h-6">{icon}</span>
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row overflow-x-hidden relative">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] bg-[#2D6A4F]/3 rounded-full blur-[120px]"></div>
      </div>

      <aside className={`hidden lg:flex w-72 bg-white/80 backdrop-blur-xl border-r border-gray-100 flex-col p-8 fixed h-screen z-50 shadow-sm transition-all duration-700 ${isOverlayActive ? 'opacity-40 pointer-events-none' : ''}`}>
        <Link to="/dashboard" className="flex items-center gap-3 mb-12 px-2 group">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <KoalaIcon className="w-8 h-8 md:w-10 md:h-10" />
          </motion.div>
          <span className="text-xl font-black text-[#1B4332] tracking-tighter uppercase">Koala</span>
        </Link>
        <nav className="flex-1 space-y-2.5">
          <NavItem to="/dashboard" icon="🏠" label="Dashboard" />
          <NavItem to="/new" icon="✍️" label="Nieuw" />
          <NavItem to="/history" icon="📜" label="Historiek" />
          <NavItem to="/pricing" icon="💎" label="Plannen" />
          <NavItem to="/settings" icon="⚙️" label="Instellingen" />
        </nav>
        <div className="mt-auto pt-6 border-t border-gray-50">
          <button onClick={onLogout} className="w-full text-left px-8 py-4 text-gray-300 font-black uppercase tracking-widest text-[9px] hover:text-red-400 transition-colors">Uitloggen</button>
        </div>
      </aside>

      <header className={`lg:hidden bg-white/90 backdrop-blur-xl border-b border-gray-100 p-4 sticky top-0 z-[60] flex justify-between items-center h-16 shadow-sm transition-all duration-700 ${isOverlayActive ? 'opacity-40 pointer-events-none' : ''}`}>
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <KoalaIcon className="w-8 h-8" />
          <span className="text-lg font-black text-[#1B4332] tracking-tight uppercase">Koala</span>
        </Link>
        <Link to="/settings" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-lg border border-gray-100 text-gray-400">⚙️</Link>
      </header>

      <main className="flex-1 lg:ml-72 p-4 md:p-10 lg:p-16 xl:p-20 pb-28 lg:pb-16 max-w-full overflow-x-hidden relative">
        <div className="max-w-[1400px] mx-auto w-full">
          <Outlet />
        </div>
      </main>

      <nav className={`lg:hidden bg-white/95 backdrop-blur-2xl border-t border-gray-100 fixed bottom-0 left-0 right-0 z-[70] flex justify-around p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,0.05)] transition-all duration-700 ${isOverlayActive ? 'opacity-40 pointer-events-none' : ''}`}>
        <MobileNavItem to="/dashboard" icon="🏠" isActive={location.pathname === '/dashboard'} />
        <MobileNavItem to="/new" icon="✍️" isActive={location.pathname === '/new'} />
        <MobileNavItem to="/history" icon="📜" isActive={location.pathname === '/history'} />
        <MobileNavItem to="/pricing" icon="💎" isActive={location.pathname === '/pricing'} />
      </nav>
    </div>
  );
};

const MobileNavItem = ({ to, icon, isActive }: any) => (
  <Link to={to} className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${isActive ? 'bg-[#1B4332] text-white shadow-lg -translate-y-1' : 'text-gray-300'}`}>
    <span className="text-xl flex items-center justify-center">{icon}</span>
  </Link>
);

export default App;
