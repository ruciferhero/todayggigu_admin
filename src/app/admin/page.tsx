"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import {
  ShoppingCart,
  Users,
  CreditCard,
  Package,
  MessageSquare,
  BarChart3,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useLocale();

  const stats = [
    { labelKey: "dashboard.totalOrders", value: "0", change: "+0%", icon: ShoppingCart, color: "bg-blue-500" },
    { labelKey: "dashboard.totalMembers", value: "0", change: "+0%", icon: Users, color: "bg-green-500" },
    { labelKey: "dashboard.revenue", value: "0", change: "+0%", icon: CreditCard, color: "bg-purple-500" },
    { labelKey: "dashboard.products", value: "0", change: "+0%", icon: Package, color: "bg-orange-500" },
  ];

  const recentActivities = [
    { typeKey: "dashboard.depositApplication", count: 0 },
    { typeKey: "dashboard.bankPayment", count: 0 },
    { typeKey: "dashboard.1on1Inquiry", count: 0 },
    { typeKey: "dashboard.orderInquiry", count: 0 },
    { typeKey: "dashboard.newMembers", count: 0 },
    { typeKey: "dashboard.pendingSettlements", count: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t("dashboard.welcome")} {user?.name || "Admin"}
        </h1>
        <p className="text-gray-500 mt-1">
          {t("dashboard.overview")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.labelKey}
            className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4"
          >
            <div className={`${stat.color} rounded-lg p-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">{t(stat.labelKey)}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                <span className="text-xs text-gray-400">{t("dashboard.vsLastMonth")}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t("dashboard.pendingItems")}</h2>
            <MessageSquare className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.typeKey}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm text-gray-700">{t(activity.typeKey)}</span>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {activity.count}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats Chart Placeholder */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t("dashboard.orderOverview")}</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-center justify-center h-48 text-gray-400">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{t("dashboard.chartPlaceholder")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
