import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface StatsCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  variant: 'purple' | 'cyan' | 'gold';
  delay?: number;
  extraContent?: React.ReactNode;
}

export default function StatsCard({ label, value, icon: Icon, variant, delay = 0, subValue, extraContent }: StatsCardProps) {
  const variants = {
    purple: 'from-purple-500/20 to-purple-500/5 text-purple-400 bar-bg-purple-500/20 bar-fill-purple-500',
    cyan: 'from-cyan-500/20 to-cyan-500/5 text-cyan-400 bar-bg-cyan-500/20 bar-fill-cyan-500',
    gold: 'from-amber-500/20 to-amber-500/5 text-amber-400 bar-bg-amber-500/20 bar-fill-amber-500',
  };

  const barColors = {
    purple: 'bg-purple-500',
    cyan: 'bg-cyan-500',
    gold: 'bg-amber-500',
  };

  const barBgColors = {
    purple: 'bg-purple-500/10',
    cyan: 'bg-cyan-500/10',
    gold: 'bg-amber-500/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={cn(
        "glass-card p-6 rounded-[2rem] relative overflow-hidden group card-hover",
        "bg-gradient-to-br",
        variants[variant].split(' ').slice(0, 2).join(' ')
      )}
    >
      <div className="flex flex-col h-full space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{label}</span>
          <div className={cn("p-2 rounded-xl bg-white/5", variants[variant].split(' ')[2])}>
            <Icon size={16} />
          </div>
        </div>
        
        <div className="space-y-1">
          <h3 className="text-3xl font-black tracking-tighter text-white">{value}</h3>
          {subValue && (
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-1">
              {subValue}
              <span className="text-[8px] opacity-50 italic lowercase">/ no período</span>
            </p>
          )}
        </div>

        <div className="mt-auto pt-4">
          <div className={cn("h-1.5 w-full rounded-full overflow-hidden", barBgColors[variant])}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '65%' }}
              transition={{ delay: delay + 0.5, duration: 1 }}
              className={cn("h-full rounded-full", barColors[variant])}
            />
          </div>
        </div>

        {extraContent && (
          <div className="pt-2">
            {extraContent}
          </div>
        )}
      </div>
    </motion.div>
  );
}
