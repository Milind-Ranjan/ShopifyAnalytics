'use client';

import { useEffect, useState } from 'react';
import { analyticsAPI } from '@/lib/api';
import { UsersIcon, ShoppingCartIcon, RectangleStackIcon, BanknotesIcon } from '@heroicons/react/24/outline';

export default function FunnelMetrics() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await analyticsAPI.getFunnelMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load funnel metrics:', error);
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
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Conversion Funnel</h2>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const conversionRate = metrics.conversionRate || 0;
  const repeatPurchaseRate = metrics.repeatPurchaseRate || 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">Conversion Funnel</h2>
      <div className="space-y-6">
        {/* Funnel Visualization */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalCustomers?.toLocaleString() || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <UsersIcon className="h-5 w-5 text-blue-600" aria-hidden="true" />
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{conversionRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Conversion Rate</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Customers with Orders</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.customersWithOrders?.toLocaleString() || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <ShoppingCartIcon className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalOrders?.toLocaleString() || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <RectangleStackIcon className="h-5 w-5 text-purple-600" aria-hidden="true" />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue || 0)}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <BanknotesIcon className="h-5 w-5 text-amber-600" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{conversionRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-600 mt-1">Conversion Rate</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{repeatPurchaseRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-600 mt-1">Repeat Purchase Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}

