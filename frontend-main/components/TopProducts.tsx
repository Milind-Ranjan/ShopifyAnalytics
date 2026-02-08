'use client';

import { useEffect, useState } from 'react';
import { analyticsAPI } from '@/lib/api';

export default function TopProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const topProducts = await analyticsAPI.getTopProducts(10);
      setProducts(topProducts);
    } catch (error) {
      console.error('Failed to load top products:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Top Products</h2>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">Top Products by Sales</h2>

      {/* Scrollable container */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scroll">
        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No products found</p>
        ) : (
          products.slice(0, 10).map((item, index) => (
            <div
              key={item.product?.id || index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {item.product?.title || 'Unknown Product'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.totalQuantity || 0} sold • {item.orderCount || 0} orders
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0 ml-4">
                <p className="font-semibold text-gray-900">
                  {formatCurrency(item.totalRevenue || 0)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Custom scrollbar styling */}
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