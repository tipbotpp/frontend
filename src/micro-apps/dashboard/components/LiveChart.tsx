import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import type { LiveChartPoint } from '../hooks/useLiveChart';

// Регистрируем только нужные компоненты (tree-shaking)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Tooltip
);

interface LiveChartProps {
  data: LiveChartPoint[];
  flashType: 'none' | 'large' | 'record';
  className?: string;
}

export function LiveChart({ data, flashType, className }: LiveChartProps) {
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (data.length > 0 && data[data.length - 1]?.isNew) {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 3000);
    }
  }, [data]);

  const formatAmount = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const labels = data.map(d => d.time);
  const amounts = data.map(d => d.amount);
  const donations = data.map(d => d.donation);

  const chartData = {
    labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Донаты',
        data: donations,
        backgroundColor: 'rgba(99, 102, 241, 0.4)',
        borderColor: 'rgba(99, 102, 241, 0.8)',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.6,
      },
      {
        type: 'line' as const,
        label: 'Всего собрано',
        data: amounts,
        borderColor: isPulsing ? '#f59e0b' : '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHitRadius: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#9CA3AF',
        bodyColor: '#F9FAFB',
        borderColor: 'rgba(75, 85, 99, 0.3)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${formatAmount(context.parsed.y)} coins`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(55, 65, 81, 0.3)',
        },
        ticks: {
          color: '#9CA3AF',
          maxTicksLimit: 6,
          font: { size: 11 },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(55, 65, 81, 0.3)',
        },
        ticks: {
          color: '#9CA3AF',
          callback: (value: any) => formatAmount(value),
          font: { size: 11 },
        },
      },
    },
  };

  return (
    <div className={`relative ${className || ''}`}>
      {flashType !== 'none' && (
        <div
          className={`absolute inset-0 rounded-xl pointer-events-none z-10 transition-opacity duration-1000 ${
            flashType === 'record'
              ? 'bg-gradient-to-r from-yellow-500/20 to-red-500/20'
              : 'bg-gradient-to-r from-green-500/20 to-teal-500/20'
          }`}
        />
      )}
      <div className="h-[300px]">
        <Chart type="bar" data={chartData} options={options} />
      </div>
    </div>
  );
}