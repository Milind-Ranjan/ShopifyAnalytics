'use client';

import { UsersIcon, ShoppingBagIcon, BanknotesIcon, CubeIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface OverviewCardsProps {
  overview: {
    totalCustomers: number;
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    avgOrderValue?: number;
    revenueGrowth?: number;
  } | null;
}

export default function OverviewCards({ overview }: OverviewCardsProps) {
  if (!overview) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatGrowth = (growth: number | undefined) => {
    if (growth === undefined || growth === null) return null;
    const sign = growth >= 0 ? '+' : '';
    const color = growth >= 0 ? 'text-green-600' : 'text-red-600';
    return <span className={color}>{sign}{growth.toFixed(1)}%</span>;
  };

  const cards = [
    {
      title: 'Total Customers',
      value: overview.totalCustomers.toLocaleString(),
      icon: UsersIcon,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Orders',
      value: overview.totalOrders.toLocaleString(),
      icon: ShoppingBagIcon,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(overview.totalRevenue),
      icon: BanknotesIcon,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      subtitle: overview.revenueGrowth !== undefined ? (
        <span className="text-xs mt-1 block">
          Growth: {formatGrowth(overview.revenueGrowth)}
        </span>
      ) : null,
    },
    {
      title: 'Total Products',
      value: overview.totalProducts.toLocaleString(),
      icon: CubeIcon,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    ...(overview.avgOrderValue ? [{
      title: 'Avg Order Value',
      value: formatCurrency(overview.avgOrderValue),
      icon: ChartBarIcon,
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-600',
    }] : []),
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {cards.map((card: any) => (
        <div
          key={card.title}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
              {card.subtitle}
            </div>
            <div
              className={`${card.iconBg} w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0`}
            >
              <card.icon className={`h-6 w-6 ${card.iconColor}`} aria-hidden="true" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

