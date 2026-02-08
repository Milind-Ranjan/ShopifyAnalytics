'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyticsAPI } from '@/lib/api';

interface CustomerTrendsChartProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export default function CustomerTrendsChart({ dateRange }: CustomerTrendsChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const trends = await analyticsAPI.getCustomerTrends({
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
        groupBy: 'day',
      });
      setData(trends);
    } catch (error) {
      console.error('Failed to load customer trends:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Customer Acquisition Trends</h2>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">Customer Acquisition Trends</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#10b981"
            strokeWidth={2}
            name="New Customers"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

