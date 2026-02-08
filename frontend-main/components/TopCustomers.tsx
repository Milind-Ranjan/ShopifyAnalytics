'use client';

import { useEffect, useState } from 'react';
import { analyticsAPI } from '@/lib/api';

export default function TopCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const topCustomers = await analyticsAPI.getTopCustomers(10);
      setCustomers(topCustomers);
    } catch (error) {
      console.error('Failed to load top customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Top Customers</h2>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Top Customers by Spend</h2>

      {/* Scrollable box */}
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scroll">
        {customers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No customers found</p>
        ) : (
          customers.slice(0, 10).map((customer, index) => (
            <div
              key={customer.id || index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900 truncate max-w-[150px]">
                    {customer.firstName || customer.lastName
                      ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
                      : 'Unknown Customer'}
                  </p>
                  <p className="text-sm text-gray-500 truncate max-w-[180px]">
                    {customer.email || 'No email'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatCurrency(customer.totalSpent)}</p>
                <p className="text-sm text-gray-500">{customer.ordersCount} orders</p>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #c4c4c4;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}