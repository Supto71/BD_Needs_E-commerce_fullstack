'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, Truck, CheckCircle2, Clock, AlertCircle, Download, FileText, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear().toString());
  const [loading, setLoading] = useState(true);

  const isDateInRange = (dateStr: string, filter: string) => {
    if (filter === 'All') return true;
    const date = new Date(dateStr);
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffTime = startOfToday.getTime() - startOfDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (filter === 'Daily') return diffDays === 0;
    if (filter === 'Weekly') return diffDays <= 7;
    if (filter === 'Monthly') {
      const [y, m] = selectedMonth.split('-');
      return date.getMonth() + 1 === parseInt(m) && date.getFullYear() === parseInt(y);
    }
    if (filter === 'Yearly') {
      return date.getFullYear() === parseInt(selectedYear);
    }

    return true;
  };

  const fetchOrders = () => {
    setLoading(true);
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = orders.filter((o) => {
    const matchesSearch =
      !search ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      o.trackingNumber.toLowerCase().includes(search.toLowerCase());

    let matchesStatus = true;
    if (statusFilter) {
      if (statusFilter === 'PROCESSING') {
        matchesStatus = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(o.orderStatus);
      } else {
        matchesStatus = o.orderStatus === statusFilter;
      }
    }
    const matchesTime = isDateInRange(o.createdAt, timeFilter);
    return matchesSearch && matchesStatus && matchesTime;
  });

  const successfulOrders = filtered.filter(o => o.orderStatus === 'DELIVERED').length;
  const returnedOrders = filtered.filter(o => o.orderStatus === 'REFUNDED').length;
  const cancelledOrders = filtered.filter(o => o.orderStatus === 'CANCELLED').length;
  const processingOrders = filtered.filter(o => ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)).length;

  const exportToCSV = () => {
    if (filtered.length === 0) return;

    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Customer Phone',
      'Items Count',
      'Total Amount',
      'Payment Method',
      'Payment Status',
      'Order Status',
      'Products Details'
    ];

    const csvRows = [headers.join(',')];

    filtered.forEach(order => {
      const itemsDetail = order.items.map(item => `${item.productName} (Qty: ${item.quantity})`).join('; ');
      const row = [
        `"${order.orderNumber}"`,
        `"${formatDate(order.createdAt)}"`,
        `"${order.customerName}"`,
        `"${order.customerPhone}"`,
        order.items.length,
        order.total,
        order.paymentMethod,
        order.paymentStatus,
        order.orderStatus,
        `"${itemsDetail.replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Orders_Report_${timeFilter}_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B132B]">
            Orders & Consignments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track fulfillment lifecycle, inspect purchased variants, and issue courier dispatches.
          </p>
          <Link
            href="/admin/orders/new"
            className="inline-flex mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Create New Order
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
          {timeFilter === 'Monthly' && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 bg-[#ffffff] border border-slate-200 rounded-xl text-sm font-bold text-[#0B132B] focus:outline-none shadow-sm cursor-pointer"
            />
          )}
          {timeFilter === 'Yearly' && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 bg-[#ffffff] border border-slate-200 rounded-xl text-sm font-bold text-[#0B132B] focus:outline-none shadow-sm cursor-pointer"
            >
              {Array.from(
                { length: new Date().getFullYear() - 2023 },
                (_, i) => new Date().getFullYear() - i
              ).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-3 bg-[#ffffff] p-1.5 rounded-2xl border border-slate-200 shadow-sm">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-transparent rounded-xl text-sm font-bold text-[#0B132B] focus:outline-none transition-colors cursor-pointer"
            >
              <option value="All">All Time</option>
              <option value="Daily">Today</option>
              <option value="Weekly">Last 7 Days</option>
              <option value="Monthly">By Month</option>
              <option value="Yearly">By Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#ffffff] rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Processing</p>
            <p className="text-xl font-black text-slate-900">{processingOrders}</p>
          </div>
        </div>
        <div className="bg-[#ffffff] rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Successful</p>
            <p className="text-xl font-black text-slate-900">{successfulOrders}</p>
          </div>
        </div>
        <div className="bg-[#ffffff] rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Returned</p>
            <p className="text-xl font-black text-slate-900">{returnedOrders}</p>
          </div>
        </div>
        <div className="bg-[#ffffff] rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cancelled</p>
            <p className="text-xl font-black text-slate-900">{cancelledOrders}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#ffffff] rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order #, Customer..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PROCESSING">Processing</option>
            <option value="DELIVERED">Successful</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Returned</option>
          </select>

          <button
            onClick={exportToCSV}
            disabled={filtered.length === 0}
            className="px-4 py-2 bg-[#0B132B] hover:bg-blue-600 disabled:opacity-50 text-[#ffffff] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>


      </div>

      {/* Orders Table */}
      <div className="bg-[#ffffff] rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4 pl-6">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items Count</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Date</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    Loading orders...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-[#0B132B]">#{ord.orderNumber}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {ord.trackingNumber}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-slate-900">{ord.customerName}</div>
                        {ord.user?.isFraud && (
                          <div className="flex items-center gap-1 bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                            <AlertCircle className="w-3 h-3" />
                            <span>Fraud Alert</span>
                          </div>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{ord.customerEmail}</div>
                      <div className="text-[11px] text-slate-500 mt-1 max-w-xs truncate">
                        {ord.shippingAddress && typeof ord.shippingAddress === 'object' ? (
                          <>
                            {(ord.shippingAddress as any).street && `${(ord.shippingAddress as any).street}, `}
                            {(ord.shippingAddress as any).area && `${(ord.shippingAddress as any).area}, `}
                            {(ord.shippingAddress as any).city && `${(ord.shippingAddress as any).city} `}
                            {(ord.shippingAddress as any).postalCode && `${(ord.shippingAddress as any).postalCode}`}
                          </>
                        ) : 'No address provided'}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-800">
                        {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </td>
                    <td className="p-4 font-black text-[#0B132B]">
                      {formatPrice(ord.total)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${ord.orderStatus === 'DELIVERED'
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
                      <span className="font-bold text-slate-800">{ord.paymentMethod}</span>{' '}
                      <span className="text-slate-400 text-[11px]">({ord.paymentStatus})</span>
                    </td>
                    <td className="p-4 text-slate-400">{formatDate(ord.createdAt)}</td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Link
                          href={`/invoice/${ord.id}`}
                          target="_blank"
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5"
                        >
                          Invoice
                        </Link>
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="px-3.5 py-1.5 bg-[#0B132B] hover:bg-blue-600 text-[#ffffff] rounded-xl font-bold text-xs transition-colors inline-block"
                        >
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
