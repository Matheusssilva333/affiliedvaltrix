import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Store from './components/Store';

type View = 'auth' | 'store';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string; avatarUrl: string } | null>(null);
  const [view, setView] = useState<View>('auth');
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null);

  // Check for saved user on mount and handle referral tracking
  useEffect(() => {
    const savedUser = localStorage.getItem('valtrix_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }

    // Referral tracking
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    
    // Check localStorage for previous ref
    const savedRef = localStorage.getItem('valtrix_ref');
    if (ref) {
      localStorage.setItem('valtrix_ref', ref);
      setAffiliateCode(ref);
      // If landing with a ref, show the store
      setView('store');
      
      // Register click in backend
      fetch('/api/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: ref })
      }).catch(err => console.error('Error tracking click:', err));
    } else if (savedRef) {
      setAffiliateCode(savedRef);
    }
  }, []);

  const handleLogin = (username: string, avatarUrl: string) => {
    const userData = {
      username,
      avatarUrl,
    };
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('valtrix_user', JSON.stringify(userData));
    setView('auth'); // Switch to dashboard view after login
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('valtrix_user');
    setView('auth');
  };

  return (
    <div className="min-h-screen bg-[#04020b]">
      <AnimatePresence mode="wait">
        {view === 'store' ? (
          <motion.div
            key="store"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Store 
              affiliateCode={affiliateCode} 
              onGoToDashboard={() => setView('auth')} 
            />
          </motion.div>
        ) : (
          <div key="auth">
            {!isAuthenticated ? (
              <motion.div
                key="login"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Login onLogin={handleLogin} />
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {user && <Dashboard user={user} onLogout={handleLogout} />}
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

