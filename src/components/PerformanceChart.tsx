import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { PerformanceData } from '@/src/types';

interface PerformanceChartProps {
  data: PerformanceData[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <div className="w-full h-[300px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#8e9299', fontSize: 10, fontWeight: 600 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#8e9299', fontSize: 10, fontWeight: 600 }}
            tickFormatter={(value) => `R$ ${value}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#110d21', 
              border: '1px solid rgba(168, 85, 247, 0.2)',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600
            }}
            itemStyle={{ color: '#a855f7' }}
          />
          <Area 
            type="monotone" 
            dataKey="earnings" 
            stroke="#a855f7" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorEarnings)" 
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
