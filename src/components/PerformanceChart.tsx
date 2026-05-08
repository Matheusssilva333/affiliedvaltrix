import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PerformanceData } from '@/src/types';

interface PerformanceChartProps {
  data: PerformanceData[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <div className="w-full h-[320px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4}/>
              <stop offset="60%" stopColor="#7c3aed" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(255,255,255,0.03)" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }}
            dy={15}
            tickFormatter={(str) => {
              const date = new Date(str);
              return isNaN(date.getTime()) ? str : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }}
            tickFormatter={(value) => `R$ ${value}`}
            width={50}
          />
          <Tooltip 
            cursor={{ stroke: 'rgba(124, 58, 237, 0.2)', strokeWidth: 2 }}
            contentStyle={{ 
              backgroundColor: 'rgba(17, 13, 33, 0.95)', 
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: 800,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}
            itemStyle={{ color: '#7c3aed', padding: 0 }}
            labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey="earnings" 
            stroke="#7c3aed" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorEarnings)" 
            animationDuration={2500}
            dot={{ r: 0 }}
            activeDot={{ r: 6, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2, shadowBlur: 10, shadowColor: '#7c3aed' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
