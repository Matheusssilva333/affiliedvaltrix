import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

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
  const glowClasses = {
    purple: 'purple-glow',
    cyan: 'cyan-glow',
    gold: 'amber-glow',
  };

  const iconColors = {
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
    gold: 'text-amber-400',
  };

  const barColors = {
    purple: 'bg-purple-500',
    cyan: 'bg-cyan-500',
    gold: 'bg-amber-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={cn(
        "glass-card p-8 rounded-[2.5rem] relative overflow-hidden group card-hover",
        glowClasses[variant]
      )}
    >
      <div className="flex flex-col h-full space-y-5">
        <div className="flex items-center justify-between">
          <Icon className={cn("w-8 h-8 opacity-40 group-hover:opacity-100 transition-opacity", iconColors[variant])} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 text-right">{label}</span>
        </div>
        
        <div className="space-y-1">
          <h3 className="text-4xl font-black tracking-tighter text-white italic-bold">{value}</h3>
          {subValue && (
            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
              {subValue}
            </p>
          )}
        </div>

        <div className="mt-auto pt-2">
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '70%' }}
              transition={{ delay: delay + 0.3, duration: 1.5, ease: "easeOut" }}
              className={cn("h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]", barColors[variant])}
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
