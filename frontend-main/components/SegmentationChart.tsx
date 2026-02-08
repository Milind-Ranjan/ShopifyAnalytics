'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { analyticsAPI, SegmentationData } from '@/lib/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const SegmentationChart: React.FC = () => {
  const [data, setData] = useState<SegmentationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
        setLoading(true);
        const result = await analyticsAPI.getSegmentation();
        setData(result);
    } catch (e) {
        console.error("Failed to load segmentation", e);
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

  if (!data || (data as any).error) {
       return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-96 flex items-center justify-center text-gray-500">
            {(data as any)?.error || "No segmentation data available"}
        </div>
       );
  }

  const { customer_segments, segments_summary } = data;

  if (!Array.isArray(segments_summary)) {
       return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-96 flex items-center justify-center text-gray-500">
            Invalid data format
        </div>
       );
  }

  // Use summary for chart
  const sortedData = [...segments_summary].sort((a, b) => a.Monetary - b.Monetary);

  // Better: Just use the summary data and label them Low/Mid/High based on sort order
  const chartData = sortedData.map((d, index) => {
      let name = `Cluster ${d.Cluster}`;
      if (index === 0) name = "Low Value";
      if (index === 1) name = "Mid Value";
      if (index === 2) name = "High Value";
      
      return {
        name: name,
        count: d.customerId,
        avgValue: d.Monetary,
        avgRecency: d.Recency,
        avgFrequency: d.Frequency
      };
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Segments (RFM)</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={100} 
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-2 border border-gray-200 shadow-sm rounded text-sm">
                      <p className="font-bold">{data.name}</p>
                      <p>Customers: {data.count}</p>
                      <p>Avg Spend: ${data.avgValue.toFixed(2)}</p>
                      <p>Avg Orders: {data.avgFrequency.toFixed(1)}</p>
                      <p>Avg Recency: {data.avgRecency.toFixed(0)} days ago</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={40}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
        {chartData.map((d, i) => (
             <div key={i} className="p-2 bg-gray-50 rounded">
                 <div className="font-medium" style={{ color: COLORS[i % COLORS.length] }}>{d.name}</div>
                 <div className="text-gray-500">{d.count} Customers</div>
                 <div className="text-gray-900 font-semibold">${d.avgValue.toFixed(0)} Avg Spend</div>
             </div>
        ))}
      </div>
    </div>
  );
};

export default SegmentationChart;

