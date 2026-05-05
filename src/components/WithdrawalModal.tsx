import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wallet, Info, CheckCircle2, History, Send } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Withdrawal } from '@/src/types';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  withdrawals: Withdrawal[];
  username: string;
  onSuccess: () => void;
}

export default function WithdrawalModal({ isOpen, onClose, availableBalance, withdrawals, username, onSuccess }: WithdrawalModalProps) {
  const [amount, setAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const pendingBalance = 0.00; // Mocked
  const totalWithdrawn = withdrawals.filter(w => w.status === 'approved').reduce((acc, w) => acc + parseFloat(w.amount.replace('R$ ', '').replace(',', '.')), 0);

  const handleSubmit = async () => {
    if (!amount || !pixKey || !recipient) {
      setError('Preencha todos os campos');
      return;
    }
    
    const val = parseFloat(amount);
    if (isNaN(val) || val < 10) {
      setError('Saque mínimo de R$ 10,00');
      return;
    }
    
    if (val > availableBalance) {
      setError('Saldo insuficiente');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          amount: val,
          pixKey,
          recipient
        })
      });
      
      if (res.ok) {
        onSuccess();
        onClose();
        setAmount('');
        setPixKey('');
        setRecipient('');
      } else {
        const data = await res.json();
        setError(data.error || 'Erro ao processar saque');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass-card w-full max-w-xl h-[90vh] overflow-y-auto rounded-[2.5rem] relative purple-glow p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-2xl">
                <Wallet className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tight italic">Saque via <span className="text-purple-500">Pix</span></h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <p className="text-muted-foreground text-sm mb-8">
            Solicite o saque do seu saldo disponível. Pagamento via Pix em até 48h úteis após aprovação.
          </p>

          {/* Balance Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-2xl">
              <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1">Disponível</p>
              <p className="text-xl font-extrabold text-cyan-400">R$ {availableBalance.toFixed(2)}</p>
            </div>
            <div className="bg-amber-500/5 shadow-inner border border-amber-500/10 p-4 rounded-2xl">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-1">Pendente</p>
              <p className="text-xl font-extrabold text-amber-500">R$ {pendingBalance.toFixed(2)}</p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl">
              <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1">Total Sacado</p>
              <p className="text-xl font-extrabold text-purple-400">R$ {totalWithdrawn.toFixed(2)}</p>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-black/40 border border-white/5 p-5 rounded-2xl space-y-3 mb-8">
            <div className="flex items-center gap-2 text-amber-400">
              <Info size={16} />
              <p className="text-xs font-bold uppercase">Informações do saque:</p>
            </div>
            <ul className="text-xs text-muted-foreground space-y-2 pl-6 list-disc">
              <li>Ganhos ficam em análise por <span className="text-white font-medium">7 dias</span></li>
              <li>Pagamento via Pix: <span className="text-white font-medium">até 48h úteis</span> após a solicitação</li>
              <li>Saque mínimo: <span className="text-white font-medium">R$ 10,00</span></li>
            </ul>
          </div>

          {/* Form */}
          <div className="space-y-6 mb-12">
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400">Informações do saque</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Valor a sacar (R$)</label>
                <button 
                  onClick={() => setAmount(availableBalance.toString())}
                  className="text-[10px] font-bold uppercase text-purple-400 hover:text-purple-300"
                >
                  Sacar tudo
                </button>
              </div>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="R$ 0,00"
                className="w-full h-14 bg-black/40 border border-white/5 rounded-2xl px-6 text-white font-bold placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground px-1">Nome completo (recebedor)</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Nome do titular da conta"
                className="w-full h-14 bg-black/40 border border-white/5 rounded-2xl px-6 text-white placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground px-1">Chave Pix</label>
              <input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="CPF, E-mail, Celular ou Chave Aleatória"
                className="w-full h-14 bg-black/40 border border-white/5 rounded-2xl px-6 text-white placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </div>

            {/* Summary */}
            <div className="bg-black/60 p-6 rounded-[2rem] border border-white/5">
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4">Resumo do saque</h4>
              <ul className="text-xs space-y-3">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50" />
                  Valor solicitado: <span className="text-white font-bold ml-1">R$ {parseFloat(amount || '0').toFixed(2)}</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50" />
                  Recebedor: <span className="text-white font-bold ml-1">{recipient || '---'}</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50" />
                  Chave Pix: <span className="text-white font-bold ml-1">{pixKey || '---'}</span>
                </li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-3 rounded-xl text-center font-bold">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isLoading}
               className="w-full h-16 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                `Confirmar Saque via Pix de R$ ${parseFloat(amount || '0').toFixed(2)}`
              )}
            </button>
            <p className="text-[10px] text-center text-muted-foreground italic">
              Ao confirmar, o valor será reservado e enviado para análise.
            </p>
          </div>

          {/* History */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <History size={16} />
              <h3 className="text-xs font-bold uppercase tracking-wider">Histórico de solicitações</h3>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/5">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-white/5 text-muted-foreground uppercase font-bold">
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Valor</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-4 text-muted-foreground">{w.date}</td>
                      <td className="px-4 py-4 font-bold">{w.amount}</td>
                      <td className="px-4 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-lg font-bold uppercase text-[9px]",
                          w.status === 'approved' ? "bg-green-500/10 text-green-400" :
                          w.status === 'pending' ? "bg-amber-500/10 text-amber-400" :
                          "bg-red-500/10 text-red-400"
                        )}>
                          {w.status === 'approved' ? 'Aprovado' : w.status === 'pending' ? 'Em análise' : 'Recusado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
