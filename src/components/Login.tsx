import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, LogIn, ShieldCheck, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ParticleBackground from './ParticleBackground';
import axios from 'axios';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      if (isRegistering) {
        await axios.post('/api/auth/register', { username, password });
      }
      await login(username, password);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.msg : undefined;
      setError(msg ?? 'Erro ao processar solicitação');
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
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-700 rounded-2xl flex items-center justify-center mb-2 rotate-12 transition-transform hover:rotate-0 duration-500">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-white uppercase italic">
            Valtrix <span className="text-purple-500">Affiliates</span>
          </h1>
        </div>

        <div className="glass-card p-8 rounded-[2rem] space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">
              {isRegistering ? 'Criar Conta' : 'Acesse seu painel'}
            </h2>
            <p className="text-white/40 text-sm">
              {isRegistering
                ? 'Preencha os dados abaixo para começar'
                : 'Entre com sua conta para acessar seus recursos'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-3 rounded-xl text-center font-bold"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-purple-400 ml-1">
                Usuário do Roblox
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-purple-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Ex: PlayerName123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-12 bg-black/40 border border-purple-500/20 rounded-xl pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-purple-400 ml-1">
                Senha de Acesso
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-purple-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 bg-black/40 border border-purple-500/20 rounded-xl pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
                  required
                />
              </div>
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 group mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />}
                  <span>{isRegistering ? 'Cadastrar agora' : 'Entrar no sistema'}</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              {isRegistering ? 'Já tem uma conta? Entre aqui' : 'Não tem uma conta? Cadastre-se'}
            </button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.2em]">Valtrix Affiliates © 2026</p>
        </div>
      </motion.div>
    </div>
  );
}
