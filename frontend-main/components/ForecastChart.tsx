'use client';

import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { analyticsAPI, ForecastData } from '@/lib/api';

const ForecastChart: React.FC = () => {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
        setLoading(true);
        const result = await analyticsAPI.getForecast();
        setData(result);
    } catch (e) {
        console.error("Failed to load forecast", e);
    } finally {
        setLoading(false);
    }
  };

  if (loading) {
       return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
       );
  }

  // Check for error in response
  if (!data || (data as any).error) {
       return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-96 flex items-center justify-center text-gray-500">
            {(data as any)?.error || "No forecast data available"}
        </div>
       );
  }

  const { data: chartPoints, metrics } = data;
  
  if (!Array.isArray(chartPoints)) {
       return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-96 flex items-center justify-center text-gray-500">
            Invalid data format
        </div>
       );
  }

  const historyData = chartPoints.filter(d => d.type === 'history');
  const forecastData = chartPoints.filter(d => d.type === 'forecast');
  
  const chartData = chartPoints.map(d => ({
    date: d.date,
    value: d.type === 'history' ? d.value : null,
    forecast: d.type === 'forecast' ? d.value : null,
  }));
  
  // Connect lines
  if (historyData.length > 0 && forecastData.length > 0) {
      const lastHist = historyData[historyData.length - 1];
      const index = chartData.findIndex(d => d.date === lastHist.date);
      if (index !== -1) {
          chartData[index].forecast = chartData[index].value;
      }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Sales Forecast (30 Days)</h3>
        <div className="text-sm text-gray-500">
            RMSE: {metrics.RMSE.toFixed(2)} | MAPE: {typeof metrics.MAPE === 'number' ? metrics.MAPE.toFixed(2) + '%' : metrics.MAPE}
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              minTickGap={30}
            />
            <YAxis 
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Sales']}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#2563eb" 
              name="Historical Sales"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line 
              type="monotone" 
              dataKey="forecast" 
              stroke="#9333ea" 
              name="Forecast"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ForecastChart;

