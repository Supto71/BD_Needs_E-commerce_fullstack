'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Users,
  AlertTriangle,
  TrendingUp,
  Package,
  ArrowRight,
  Calendar,
  Store,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { Order } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

type Period = 'today' | 'week' | 'month' | 'year' | 'all';

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Today',
  week: 'Last 7 Days',
  month: 'This Month',
  year: 'This Year',
  all: 'All Time',
};

export default function AdminDashboardPage() {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('today');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?period=${period}`)
      .then((r) => r.json())
      .then((data) => {
        setAnalytics(data);
        if (Array.isArray(data.recentOrders)) {
          setRecentOrders(data.recentOrders.slice(0, 8));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  if (loading || !analytics) {
    return (
      <div className="py-20 text-center text-xs font-semibold text-slate-400">
        Compiling business analytics and real-time ledger metrics...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header + Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B132B]">
            {t('adminExecutiveDashboard')}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t('adminDashboardSubtitle')}
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <Link href="/admin/products/new" className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-[#ffffff] rounded-xl text-xs font-bold transition-colors shadow-xs">
              {t('adminCreateProduct')}
            </Link>
            <Link href="/admin/banners" className="px-4 py-2.5 bg-[#0B132B] hover:bg-slate-800 text-[#ffffff] rounded-xl text-xs font-bold transition-colors shadow-xs">
              {t('adminManageBanners')}
            </Link>
          </div>
        )}
      </div>

      {/* Time Period Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-2">
          <Calendar className="w-3.5 h-3.5" />
          Period:
        </div>
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              period === p
                ? 'bg-[#0B132B] text-[#ffffff] shadow-xs'
                : 'bg-[#ffffff] border border-slate-200 text-slate-600 hover:border-slate-400'
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Period Revenue */}
        <div className="bg-[#ffffff] rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Revenue ({PERIOD_LABELS[period]})</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="text-lg font-bold">৳</span>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0B132B]">
            {formatPrice(analytics.periodRevenue)}
          </div>
          <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            {analytics.periodOrders} orders in period
          </div>
        </div>

        {/* Period Orders */}
        <div className="bg-[#ffffff] rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Orders ({PERIOD_LABELS[period]})</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0B132B]">
            {analytics.periodOrders}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            <span className="text-amber-600 font-bold">{analytics.pendingOrders} pending</span> / {analytics.completedOrders} delivered
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-[#ffffff] rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Products</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0B132B]">
            {analytics.activeProducts}
          </div>
          <Link href="/admin/products" className="text-xs text-indigo-600 font-bold hover:underline inline-flex items-center gap-1">
            Manage Products →
          </Link>
        </div>

        {/* Regular Customers */}
        <div className="bg-[#ffffff] rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Regular Customers</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0B132B]">
            {analytics.totalCustomers}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            <span className="text-rose-600 font-bold">{analytics.lowStockCount} low stock</span> products
          </div>
        </div>
      </div>

      {/* Analytics Visuals: Revenue Graph & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue Trends */}
        <div className="lg:col-span-8 bg-[#ffffff] rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0B132B]">{t('adminRevenueTrajectory')}</h3>
              <p className="text-xs text-slate-500">{t('adminRevenueTrajectorySub')}</p>
            </div>
            <span className="text-xs font-bold text-slate-400">2026 Fiscal Year</span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-64 flex items-end justify-between gap-3 pt-8 pb-2 px-2 border-b border-slate-100">
            {analytics.revenueHistory?.map((item: any) => {
              const maxRev = 50000;
              const heightPercent = Math.min(100, Math.round((item.revenue / maxRev) * 100));
              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatPrice(item.revenue)}
                  </span>
                  <div className="w-full bg-slate-100 rounded-t-xl h-48 flex items-end overflow-hidden">
                    <div
                      className="w-full bg-blue-600 group-hover:bg-blue-500 rounded-t-xl transition-all duration-500"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-400">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-4 bg-[#ffffff] rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0B132B]">{t('adminCategoryShare')}</h3>
            <p className="text-xs text-slate-500">{t('adminCategoryShareSub')}</p>
          </div>

          <div className="space-y-3">
            {Object.entries(analytics.categorySales || {})
              .sort(([, amountA]: any, [, amountB]: any) => amountB - amountA)
              .slice(0, 5)
              .map(([cat, amount]: any) => {
              const total = analytics.totalRevenue || 1;
              const pct = Math.min(100, Math.round((amount / total) * 100));
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{cat}</span>
                    <span className="text-slate-900 font-bold">{formatPrice(amount)} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            href="/admin/categories"
            className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1 mt-4"
          >
            {t('adminManageCategoryCatalog')}
          </Link>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-[#ffffff] rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0B132B]">{t('adminRecentOrders')}</h3>
            <p className="text-xs text-slate-500">Real-time incoming customer orders</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            {t('adminViewAllOrders')}
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4 pl-6">{t('adminOrderId')}</th>
                <th className="p-4">{t('adminCustomer')}</th>
                <th className="p-4">{t('adminTotal')}</th>
                <th className="p-4">{t('adminStatus')}</th>
                <th className="p-4">{t('adminPayment')}</th>
                <th className="p-4">{t('adminDate')}</th>
                <th className="p-4 pr-6 text-right">{t('adminActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6 font-bold text-[#0B132B]">
                    #{ord.orderNumber}
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-bold text-slate-900">{ord.customerName}</div>
                      <div className="text-[11px] text-slate-400">{ord.customerEmail}</div>
                    </div>
                  </td>
                  <td className="p-4 font-black text-[#0B132B]">
                    {formatPrice(ord.total)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ord.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : ord.orderStatus === 'CANCELLED'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {ord.orderStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-slate-800">
                      {ord.paymentMethod}
                    </span>{' '}
                    <span className="text-slate-400 text-[11px]">({ord.paymentStatus})</span>
                  </td>
                  <td className="p-4 text-slate-400">{formatDate(ord.createdAt)}</td>
                  <td className="p-4 pr-6 text-right">
                    <Link
                      href={`/admin/orders/${ord.id}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-[#ffffff] rounded-lg text-slate-700 font-bold text-xs transition-colors inline-block"
                    >
                      {t('adminInspect')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
