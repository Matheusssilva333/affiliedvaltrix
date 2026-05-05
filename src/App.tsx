import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string; avatarUrl: string } | null>(null);

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
    if (ref) {
      localStorage.setItem('valtrix_ref', ref);
      // Register click in backend
      fetch('/api/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: ref })
      }).catch(err => console.error('Error tracking click:', err));
    }
  }, []);

  const handleLogin = (username: string) => {
    const userData = {
      username,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    };
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('valtrix_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('valtrix_user');
  };

  return (
    <div className="min-h-screen bg-[#04020b]">
      <AnimatePresence mode="wait">
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
      </AnimatePresence>
    </div>
  );
}

