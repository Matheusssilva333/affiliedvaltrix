import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, LogIn, ShieldCheck } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import ParticleBackground from './ParticleBackground';

interface LoginProps {
  onLogin: (username: string, invite_code: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !inviteCode.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, invite_code: inviteCode })
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        onLogin(username, inviteCode);
      } else {
        setError(data.error || 'Erro ao fazer login');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#04020b] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <ParticleBackground />
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(88,28,135,0.05)_0%,transparent_70%)]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10 space-y-8"
      >
        {/* Logo Placeholder */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-700 rounded-3xl flex items-center justify-center purple-glow mb-2 rotate-12">
            {/* Bull icon would go here - placeholder for now */}
            <ShieldCheck className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-white uppercase italic">
            Valtrix <span className="text-purple-500">Affiliates</span>
          </h1>
          <div className="h-px w-12 bg-purple-500/50" />
        </div>

        <div className="glass-card p-8 rounded-[2rem] space-y-6 purple-glow">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/10 mb-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Acesse seu painel</h2>
            <p className="text-muted-foreground text-sm">
              Entre com sua conta para acessar seu painel de afiliado.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-xl text-center font-bold">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-purple-400 ml-1">
                Usuário do Roblox
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-purple-400">
                  <User size={18} />
                </div>
                <input
                  id="username"
                  type="text"
                  placeholder="Ex: PlayerName123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-14 bg-black/40 border border-purple-500/20 rounded-2xl pl-12 pr-4 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="inviteCode" className="text-xs font-bold uppercase tracking-wider text-purple-400 ml-1">
                Código de Convite
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-purple-400">
                  <ShieldCheck size={18} />
                </div>
                <input
                  id="inviteCode"
                  type="password"
                  placeholder="Seu código secreto"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full h-14 bg-black/40 border border-purple-500/20 rounded-2xl pl-12 pr-4 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={20} className="transition-transform group-hover:translate-x-1" />
                  <span>Entrar no sistema</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <ShieldCheck size={14} className="text-purple-500/50" />
            Acesso restrito a afiliados com código válido
          </p>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground/30 text-[10px] uppercase font-bold tracking-[0.2em]">
            Valtrix Affiliates © 2025
          </p>
        </div>
      </motion.div>
    </div>
  );
}
