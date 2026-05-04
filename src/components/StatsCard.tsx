import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  variant?: 'purple' | 'cyan' | 'gold';
  className?: string;
  delay?: number;
}

export default function StatsCard({ 
  label, 
  value, 
  subValue, 
  icon: Icon, 
  variant = 'purple',
  className,
  delay = 0 
}: StatsCardProps) {
  const variants = {
    purple: 'from-purple-500/10 to-transparent text-purple-400',
    cyan: 'from-cyan-500/10 to-transparent text-cyan-400',
    gold: 'from-amber-500/10 to-transparent text-amber-400',
  };

  const borders = {
    purple: 'border-purple-500/10',
    cyan: 'border-cyan-500/10',
    gold: 'border-amber-500/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        "glass-card p-6 rounded-3xl relative overflow-hidden group",
        className
      )}
    >
      <div className={cn(
        "absolute top-0 left-0 w-full h-full bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity",
        variants[variant]
      )} />
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "p-3 rounded-2xl bg-black/40 border",
            borders[variant]
          )}>
            <Icon className={cn("w-6 h-6", variants[variant].split(' ').pop())} />
          </div>
          {subValue && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-black/40 px-2 py-1 rounded-lg">
              {subValue}
            </span>
          )}
        </div>
        
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-extrabold text-white tracking-tight">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}
