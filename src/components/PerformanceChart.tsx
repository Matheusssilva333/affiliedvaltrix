import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PerformanceData } from '../types';

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
              <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.5}/>
              <stop offset="100%" stopColor="#7c3aed" stopOpacity={0}/>
            </linearGradient>
            <filter id="shadow" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
              <feOffset in="blur" dx="0" dy="4" result="offsetBlur" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(255,255,255,0.03)" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 900 }}
            dy={15}
            tickFormatter={(str) => str}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 900 }}
            tickFormatter={(value) => `R$ ${value}`}
            width={50}
          />
          <Tooltip 
            cursor={{ stroke: 'rgba(124, 58, 237, 0.4)', strokeWidth: 2, strokeDasharray: '4 4' }}
            contentStyle={{ 
              backgroundColor: 'rgba(4, 2, 11, 0.9)', 
              border: '1px solid rgba(124, 58, 237, 0.3)',
              borderRadius: '20px',
              padding: '12px 16px',
              fontSize: '12px',
              fontWeight: 900,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
            }}
            itemStyle={{ color: '#fff', padding: 0 }}
            labelStyle={{ color: 'rgba(255,255,255,0.4)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Ganhos']}
          />
          <Area 
            type="monotone" 
            dataKey="earnings" 
            stroke="#a855f7" 
            strokeWidth={5}
            fillOpacity={1} 
            fill="url(#colorEarnings)" 
            animationDuration={3000}
            dot={{ r: 0 }}
            activeDot={{ r: 6, fill: '#fff', stroke: '#a855f7', strokeWidth: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
