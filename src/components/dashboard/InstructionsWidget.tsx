import React from 'react';
import { Info, CheckCircle2, Zap } from 'lucide-react';

export default function InstructionsWidget() {
  const steps = [
    'Copie seu link',
    'Compartilhe seu link',
    'Acompanhe cliques e vendas',
    'Ganhos entram como pendentes',
    'Após 7 dias, ficam disponíveis',
    'Solicite seu saque via Pix',
    'Receba na sua conta!',
  ];

  const onboarding = [
    'Acesse o site da dashboard.valtrix',
    'Faça o login com seu username do roblox',
    'Agora é só copiar seu link',
    'Criar divulgações em redes sociais',
    'Pagamento automático via pix!',
  ];

  return (
    <div className="space-y-10">
      <div className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20">
            <Info size={18} className="text-purple-400" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em]">
            Como <span className="text-purple-500">funciona?</span>
          </h3>
        </div>
        <ul className="space-y-6">
          {steps.map((step, idx) => (
            <li key={idx} className="flex items-center gap-5 group">
              <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20 group-hover:bg-green-500 transition-all">
                <CheckCircle2 size={12} className="text-green-500 group-hover:text-white transition-colors" />
              </div>
              <span className="text-white/50 text-xs font-black uppercase tracking-widest italic group-hover:text-white transition-colors">
                {step}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-8 bg-gradient-to-br from-white/[0.03] to-transparent">
        <div className="flex items-center gap-4">
          <Zap size={20} className="text-amber-500" />
          <h3 className="text-sm font-black uppercase tracking-[0.2em]">Como funciona</h3>
        </div>
        <div className="space-y-6">
          {onboarding.map((text, idx) => (
            <div key={idx} className="flex items-center gap-5">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-[10px] font-black text-amber-500 italic">
                {idx + 1}
              </div>
              <p className="text-[11px] font-black text-white/30 uppercase tracking-widest italic">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
