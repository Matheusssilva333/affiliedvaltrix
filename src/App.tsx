import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Store from './components/Store';
import AdminPanel from './components/AdminPanel';
import axios from 'axios';

// Component for protected routes
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen bg-[#04020b] flex items-center justify-center text-white font-black uppercase tracking-[0.4em] italic">Carregando...</div>;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export default function App() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Referral tracking
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    
    if (ref) {
      localStorage.setItem('valtrix_ref', ref);
      
      // Register click in backend
      axios.post('/api/affiliate/click', { code: ref })
        .catch(err => console.error('Error tracking click:', err));
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#04020b]">
      <AnimatePresence mode="wait">
        <Routes location={location}>
          {/* Public Routes */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
          } />
          
          <Route path="/store" element={<Store />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard user={user} onLogout={logout} />
            </PrivateRoute>
          } />
          
          <Route path="/admin" element={
            <PrivateRoute>
              {user?.role === 'admin' ? (
                <AdminPanel />
              ) : (
                <Navigate to="/dashboard" />
              )}
            </PrivateRoute>
          } />

          {/* Default Redirects */}
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/store"} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
