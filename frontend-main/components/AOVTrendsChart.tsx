'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyticsAPI } from '@/lib/api';

interface AOVTrendsChartProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export default function AOVTrendsChart({ dateRange }: AOVTrendsChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const trends = await analyticsAPI.getAOVTrends({
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
        groupBy: 'day',
      });
      setData(trends);
    } catch (error) {
      console.error('Failed to load AOV trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Average Order Value Trends</h2>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">Average Order Value Trends</h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(value) => `$${value.toFixed(0)}`} />
          <Tooltip
            formatter={(value: number) => [
              formatCurrency(value),
              'AOV',
            ]}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="aov"
            stroke="#f59e0b"
            fill="#fbbf24"
            name="Average Order Value"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

