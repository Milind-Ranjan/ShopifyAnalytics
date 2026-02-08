'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { analyticsAPI, ingestionAPI, authAPI } from '@/lib/api';
import OverviewCards from '@/components/OverviewCards';
import RevenueChart from '@/components/RevenueChart';
import OrdersTable from '@/components/OrdersTable';
import TopCustomers from '@/components/TopCustomers';
import OrderStatusChart from '@/components/OrderStatusChart';
import TopProducts from '@/components/TopProducts';
import CustomerTrendsChart from '@/components/CustomerTrendsChart';
import AOVTrendsChart from '@/components/AOVTrendsChart';
import FunnelMetrics from '@/components/FunnelMetrics';
import ForecastChart from '@/components/ForecastChart';
import SegmentationChart from '@/components/SegmentationChart';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [tenant, setTenant] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tenantData, overviewData] = await Promise.all([
        authAPI.getMe(),
        analyticsAPI.getOverview(),
      ]);
      setTenant(tenantData);
      setOverview(overviewData);
    } catch (error) {
      console.error('Failed to load data:', error);
      localStorage.removeItem('token');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await ingestionAPI.syncAll();
      await loadData();
      alert('Data sync completed successfully!');
    } catch (error: any) {
      alert('Sync failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shopify Dashboard</h1>
              {tenant && (
                <p className="text-sm text-gray-600 mt-1">{tenant.name} ({tenant.shopDomain})</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {syncing ? 'Syncing...' : 'Sync Data'}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <OverviewCards overview={overview} />

        {/* Date Range Filter */}
        <div className="mt-8 bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Date Range Filter</h2>
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setDateRange({ startDate: '', endDate: '' })}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Charts and Tables */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart dateRange={dateRange} />
          <OrderStatusChart />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CustomerTrendsChart dateRange={dateRange} />
          <AOVTrendsChart dateRange={dateRange} />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopCustomers />
          <TopProducts />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FunnelMetrics />
          <OrdersTable dateRange={dateRange} />
        </div>

        {/* Predictive Analytics */}
        <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Predictive Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ForecastChart />
                <SegmentationChart />
            </div>
        </div>
      </main>
    </div>
  );
}

