"use client";

import { useEffect, useState } from "react";
import { getAdminOverview } from "@/lib/api";
import { DollarSign, Users, ShoppingCart, Package, TrendingUp } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  recentOrders: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminOverview() as AdminStats;
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading dashboard...</div>;
  }

  const data = stats || {
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    recentOrders: []
  };

  const statCards = [
    { label: "Total Revenue", value: `Rs. ${data.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "bg-green-500", text: "text-white" },
    { label: "Total Users", value: data.totalUsers, icon: Users, color: "bg-blue-500", text: "text-white" },
    { label: "Total Orders", value: data.totalOrders, icon: ShoppingCart, color: "bg-purple-500", text: "text-white" },
    { label: "Products", value: data.totalProducts, icon: Package, color: "bg-orange-500", text: "text-white" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">System Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Platform performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${stat.color} ${stat.text}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity / Orders */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Recent Platform Orders</h2>
          <TrendingUp size={18} className="text-gray-400" />
        </div>

        <div className="space-y-4">
          {data.recentOrders.length > 0 ? (
            data.recentOrders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div>
                  <p className="text-xs font-bold text-gray-900">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-primary">Rs. {order.totalAmount.toLocaleString()}</p>
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide mt-1 ${order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                    }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">No recent orders</div>
          )}
        </div>
      </div>
    </div>
  );
}
