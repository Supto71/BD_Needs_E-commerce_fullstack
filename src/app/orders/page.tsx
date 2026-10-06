'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Truck, ArrowRight } from 'lucide-react';
import AnnouncementBar from '@/components/storefront/AnnouncementBar';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import MobileBottomNav from '@/components/storefront/MobileBottomNav';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';

export default function OrdersPage() {
  const { user, isAuthLoading } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) return; // Wait for auth to finish checking local storage

    if (!user) {
      setLoading(false);
      return; // Do not fetch if not logged in
    }

    setLoading(true);
    fetch(`/api/orders?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, isAuthLoading]);

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 bg-slate-50/60 py-10 sm:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-200">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B132B]">
                {t('myOrders')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Track your active shipments, invoices, and past deliveries.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-[#ffffff] px-3 py-1.5 rounded-full border border-slate-200">
              {orders.length} {t('productsCount')}
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs font-semibold text-slate-400">
              Loading your orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-24 text-center bg-[#ffffff] rounded-3xl border border-slate-100 shadow-xs max-w-lg mx-auto mt-8 p-8">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-[#0B132B]">No Past Orders Found</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-2 mb-8 leading-relaxed">
                When you place your first order with BdNeeds, full real-time telemetry and receipts will appear here.
              </p>
              <Link
                href="/shop"
                className="px-8 py-3.5 bg-[#0B132B] hover:bg-blue-600 text-[#ffffff] font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-sm inline-flex items-center gap-2"
              >
                {t('continueShopping')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6 mt-8">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-[#ffffff] rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs hover:shadow-md transition-shadow space-y-6"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-base font-black text-[#0B132B]">
                          {t('orderNumber')} #{order.orderNumber}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            order.orderStatus === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : order.orderStatus === 'CANCELLED'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {order.orderStatus.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 mt-1 block">
                        Placed on {formatDate(order.createdAt)} • Via {order.paymentMethod}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/track-order?orderId=${order.orderNumber}`}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5 text-blue-600" />
                        {t('trackMyParcel')}
                      </Link>
                      <Link
                        href={`/orders/${order.id}`}
                        className="px-4 py-2 bg-[#0B132B] hover:bg-blue-600 text-[#ffffff] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        {t('overview')}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Order Items Gallery */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-100"
                      >
                        <div className="relative w-12 h-12 rounded-xl bg-[#ffffff] overflow-hidden shrink-0 border border-slate-200">
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-[#0B132B] truncate">
                            {item.productName}
                          </h4>
                          <span className="text-[11px] text-slate-400 block">
                            Qty: {item.quantity} • {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer Summary */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">
                      Shipped to:{' '}
                      <strong className="text-slate-800 font-semibold">
                        {order.shippingAddress.fullName}
                      </strong>{' '}
                      ({order.shippingAddress.city})
                    </span>
                    <div className="text-right">
                      <span className="text-slate-400 mr-2">{t('total')}:</span>
                      <span className="text-base font-black text-[#0B132B]">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
