import { useEffect, useRef, useState } from 'react';
import {
  ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Bar
} from 'recharts'; // ← Убрали AreaChart
import { motion, AnimatePresence } from 'motion/react';
import type { LiveChartPoint } from '../hooks/useLiveChart';

interface LiveChartProps {
  data: LiveChartPoint[];
  flashType: 'none' | 'large' | 'record';
  className?: string;
}

export function LiveChart({ data, flashType, className }: LiveChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPulsing, setIsPulsing] = useState(false);
  const [lastDonation, setLastDonation] = useState<LiveChartPoint | null>(null);

  const formatAmount = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  useEffect(() => {
    if (data.length > 0) {
      const lastPoint = data[data.length - 1];
      if (lastPoint.isNew) {
        setLastDonation(lastPoint);
        setIsPulsing(true);
        
        setTimeout(() => {
          setIsPulsing(false);
          setLastDonation(null);
        }, 3000);
      }
    }
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const point = payload[0].payload as LiveChartPoint;
      return (
        <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-gray-300 text-xs">{point.time}</p>
          <p className="text-white font-bold text-lg">
            {formatAmount(point.amount)} coins
          </p>
          {point.donation > 0 && (
            <p className="text-green-400 text-sm">
              +{formatAmount(point.donation)} coins
              {point.username && ` от ${point.username}`}
            </p>
          )}
          {point.isRecord && (
            <p className="text-yellow-400 text-xs mt-1">🏆 Рекорд!</p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const point = payload as LiveChartPoint;
    
    if (!point.isNew && !point.isRecord) return null;
    
    return (
      <g>
        {/* Пульсирующее кольцо */}
        {(point.isNew || point.isRecord) && (
          <motion.circle
            cx={cx}
            cy={cy}
            r={point.isRecord ? 12 : 8}
            fill={point.isRecord ? '#f59e0b' : '#10b981'}
            initial={{ opacity: 0.8, scale: 0 }}
            animate={{ opacity: 0, scale: 2 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
        {/* Основная точка */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={point.isRecord ? 6 : 4}
          fill={point.isRecord ? '#f59e0b' : '#10b981'}
          stroke="white"
          strokeWidth={2}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        />
      </g>
    );
  };

  const maxAmount = Math.max(...data.map(d => d.amount), 100);
  const averageAmount = data.length > 0 
    ? data.reduce((sum, d) => sum + d.amount, 0) / data.length 
    : 0;

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
    >
      {/* Вспышка фона при крупном/рекордном донате */}
      <AnimatePresence>
        {flashType !== 'none' && (
          <motion.div
            className={`absolute inset-0 rounded-xl pointer-events-none z-10 ${
              flashType === 'record' 
                ? 'bg-gradient-to-r from-yellow-500/20 to-red-500/20'
                : 'bg-gradient-to-r from-green-500/20 to-teal-500/20'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        )}
      </AnimatePresence>

      {/* Вылетающая сумма последнего доната */}
      <AnimatePresence>
        {lastDonation && (
          <motion.div
            className="absolute top-1/4 right-4 z-20 pointer-events-none"
            initial={{ opacity: 1, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, y: -50, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          >
            <div className={`text-2xl font-bold ${
              lastDonation.isRecord 
                ? 'text-yellow-400'
                : lastDonation.isLarge
                  ? 'text-green-400'
                  : 'text-white'
            }`}>
              {lastDonation.isRecord && '👑 '}
              +{formatAmount(lastDonation.donation)} coins
            </div>
            {lastDonation.username && (
              <div className="text-sm text-gray-300 text-right">
                от {lastDonation.username}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
          <XAxis 
            dataKey="time" 
            stroke="#9CA3AF"
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis 
            stroke="#9CA3AF"
            tickFormatter={formatAmount}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {/* Столбцы донатов */}
          <Bar 
            dataKey="donation" 
            fill="url(#barGradient)"
            radius={[4, 4, 0, 0]}
            maxBarSize={30}
            animationDuration={300}
          />
          
          {/* Линия накоплений */}
          <Area
            type="monotone"
            dataKey="amount"
            stroke={isPulsing ? '#f59e0b' : '#10b981'}
            strokeWidth={3}
            fill="url(#colorAmount)"
            dot={<CustomDot />}
            activeDot={{ r: 6, fill: '#10b981', stroke: 'white', strokeWidth: 2 }}
            animationDuration={500}
            filter={isPulsing ? 'url(#glow)' : undefined}
          />
          
          {/* Линия цели */}
          {averageAmount > 0 && (
            <ReferenceLine 
              y={maxAmount} 
              stroke="#f59e0b" 
              strokeDasharray="5 5"
              strokeWidth={1}
              label={{
                value: `Цель: ${formatAmount(maxAmount)}`,
                fill: '#f59e0b',
                fontSize: 12,
                position: 'right'
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}