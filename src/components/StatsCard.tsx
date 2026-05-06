import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  variant?: 'purple' | 'cyan' | 'gold';
  className?: string;
  delay?: number;
  extraContent?: React.ReactNode;
}

export default function StatsCard({ 
  label, 
  value, 
  subValue, 
  icon: Icon, 
  variant = 'purple',
  className,
  delay = 0,
  extraContent
}: StatsCardProps) {
  const variants = {
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
    gold: 'text-amber-400',
  };

  const borders = {
    purple: 'border-purple-500/10',
    cyan: 'border-cyan-500/10',
    gold: 'border-amber-500/10',
  };

  const lines = {
    purple: 'bg-purple-500',
    cyan: 'bg-gradient-to-r from-cyan-400 to-purple-500',
    gold: 'bg-gradient-to-r from-amber-500 to-purple-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        "glass-card p-6 rounded-[24px] relative overflow-hidden group flex flex-col justify-between border-t border-l border-white/5",
        className
      )}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <Icon className={cn("w-5 h-5", variants[variant])} />
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <p className="text-3xl font-extrabold text-white tracking-tight">{value}</p>
          </div>
          <p className="text-sm font-bold text-white mt-1">{label} {subValue && <span className={cn("text-[10px] ml-2 px-1.5 py-0.5 rounded uppercase tracking-wider", variant === 'cyan' ? 'text-cyan-400 bg-cyan-500/10' : 'text-amber-400 bg-amber-500/10')}>{subValue}</span>}</p>
        </div>

        {extraContent}
      </div>

      <div className={cn("absolute bottom-0 left-6 right-6 h-1 rounded-t-full opacity-80", lines[variant])} />
    </motion.div>
  );
}
