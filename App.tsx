
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

// Safe storage helper with additional error checking
const safeStorage = {
  getItem: (key: string, type: 'local' | 'session' = 'local') => {
    try {
      const storage = type === 'local' ? window.localStorage : window.sessionStorage;
      return storage.getItem(key);
    } catch (e) { return null; }
  },
  setItem: (key: string, value: string, type: 'local' | 'session' = 'local') => {
    try {
      const storage = type === 'local' ? window.localStorage : window.sessionStorage;
      storage.setItem(key, value);
    } catch (e) { }
  },
  removeItem: (key: string, type: 'local' | 'session' = 'local') => {
    try {
      const storage = type === 'local' ? window.localStorage : window.sessionStorage;
      storage.removeItem(key);
    } catch (e) { }
  },
  clear: () => {
    try { 
      window.localStorage.clear(); 
      window.sessionStorage.clear(); 
    } catch (e) { }
  }
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
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
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const user = await backendService.getUser(session.user.email);
        if (user) {
          const history = await backendService.getHistory(user.id);
          setState({ user, history, loading: false });
          return;
        }
      }
    } catch (err) {
      console.warn("Session check failed", err);
    }
    setState(prev => ({ ...prev, loading: false }));
  };

  useEffect(() => {
    // Check if we are in a payment return flow
    const isReturningFromPayment = safeStorage.getItem('koala_payment_in_progress', 'session') === 'true';

    const initialize = async () => {
      try {
        if (!isReturningFromPayment) {
          // Normal start: ensure we have a clean state if no session exists
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            safeStorage.clear();
          }
        } else {
          safeStorage.removeItem('koala_payment_in_progress', 'session');
        }
        await loadAppData();
      } catch (e) {
        console.error("Initialization error", e);
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        loadAppData();
      }
      if (event === 'SIGNED_OUT') {
        setState({ user: null, history: [], loading: false });
      }
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (user: User) => {
    try {
      await backendService.saveUser(user);
      const history = await backendService.getHistory(user.id);
      setState({ user, history, loading: false });
    } catch (e) {
      console.error("Login state error:", e);
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setState(prev => ({ ...prev, user: updatedUser }));
    try {
      await backendService.saveUser(updatedUser);
    } catch (e) {}
  };

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }} 
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
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
        handleLogout={() => { 
          supabase.auth.signOut(); 
          setState({ user: null, history: [], loading: false }); 
        }} 
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
  
  useEffect(() => {
    if (state.user && location.pathname === '/') {
      navigate('/dashboard', { replace: true });
    }
  }, [state.user, location.pathname, navigate]);

  useEffect(() => {
    if (!state.loading && !state.user && !initialRedirectDone.current) {
      const publicPaths = ['/', '/login', '/signup', '/terms', '/privacy', '/eula', '/ai-transparency'];
      if (!publicPaths.some(path => location.pathname.startsWith(path))) {
        navigate('/', { replace: true });
      }
      initialRedirectDone.current = true;
    }
  }, [state.loading, state.user, location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Landing user={state.user} />}>
        <Route path="login" element={<Login mode="login" onLogin={handleLogin} />} />
        <Route path="signup" element={<Login mode="signup" onLogin={handleLogin} />} />
        <Route path="terms" element={<TermsOfService />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="eula" element={<Eula />} />
        <Route path="ai-transparency" element={<AiTransparency />} />
      </Route>

      <Route element={state.user ? <Layout user={state.user} onLogout={handleLogout} /> : <Navigate to="/" />}>
        <Route path="/dashboard" element={<Dashboard user={state.user} history={state.history} />} />
        <Route path="/new" element={
          <NewMessage 
            user={state.user} 
            onComplete={async (item: GeneratedResponse) => {
              await backendService.addToHistory(item);
              setState((prev: AppState) => ({ ...prev, history: [item, ...prev.history] }));
            }} 
            onRecordUsage={(len) => {
              if (state.user) {
                const updatedUser = { 
                  ...state.user, 
                  responsesUsed: state.user.responsesUsed + 1,
                  timeSaved: (state.user.timeSaved || 0) + (len === 'Ultra kort' ? 1 : 5)
                };
                handleUpdateUser(updatedUser);
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
              setState((prev: AppState) => ({ ...prev, history: prev.history.filter(h => h.id !== id) }));
              await backendService.deleteFromHistory(id);
            }}
          />
        } />
        <Route path="/pricing" element={<Pricing user={state.user} onUpgrade={handleUpdateUser} />} />
        <Route path="/settings" element={<Settings user={state.user} onUpdate={handleUpdateUser} onLogout={handleLogout} />} />
        <Route path="/checkout/success" element={<CheckoutSuccess user={state.user} onUpgrade={handleUpdateUser} />} />
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
      <Link to={to} className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase tracking-[0.1em] text-[11px] transition-all ${isActive ? 'bg-[#1B4332] text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50'}`}>
        <span className="text-xl">{icon}</span>
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row relative">
      <aside className="hidden lg:flex w-72 bg-white border-r border-gray-100 flex-col p-8 fixed h-screen z-50">
        <Link to="/dashboard" className="flex items-center gap-3 mb-12">
          <KoalaIcon className="w-10 h-10" />
          <span className="text-xl font-black text-[#1B4332] tracking-tighter uppercase">Koala</span>
        </Link>
        <nav className="flex-1 space-y-2">
          <NavItem to="/dashboard" icon="🏠" label="Dashboard" />
          <NavItem to="/new" icon="✍️" label="Nieuw" />
          <NavItem to="/history" icon="📜" label="Historiek" />
          <NavItem to="/pricing" icon="💎" label="Plannen" />
          <NavItem to="/settings" icon="⚙️" label="Instellingen" />
        </nav>
        <button onClick={onLogout} className="mt-auto text-left px-8 py-4 text-gray-300 font-black uppercase tracking-widest text-[9px] hover:text-red-400">Uitloggen</button>
      </aside>

      <header className="lg:hidden bg-white border-b border-gray-100 p-4 sticky top-0 z-[60] flex justify-between items-center h-16">
        <Link to="/dashboard" className="flex items-center gap-2">
          <KoalaIcon className="w-8 h-8" />
          <span className="text-lg font-black text-[#1B4332] tracking-tight uppercase">Koala</span>
        </Link>
        <Link to="/settings" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-lg">⚙️</Link>
      </header>

      <main className="flex-1 lg:ml-72 p-4 md:p-10 lg:p-20 max-w-full overflow-x-hidden">
        <Outlet />
      </main>

      <nav className="lg:hidden bg-white border-t border-gray-100 fixed bottom-0 left-0 right-0 z-[70] flex justify-around p-3 shadow-lg">
        <MobileNavItem to="/dashboard" icon="🏠" isActive={location.pathname === '/dashboard'} />
        <MobileNavItem to="/new" icon="✍️" isActive={location.pathname === '/new'} />
        <MobileNavItem to="/history" icon="📜" isActive={location.pathname === '/history'} />
        <MobileNavItem to="/pricing" icon="💎" isActive={location.pathname === '/pricing'} />
      </nav>
    </div>
  );
};

const MobileNavItem = ({ to, icon, isActive }: any) => (
  <Link to={to} className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${isActive ? 'bg-[#1B4332] text-white shadow-lg' : 'text-gray-300'}`}>
    <span className="text-xl">{icon}</span>
  </Link>
);

export default App;
