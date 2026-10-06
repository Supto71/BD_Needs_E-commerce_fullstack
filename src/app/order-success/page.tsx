'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  PackageCheck,
  Truck,
} from 'lucide-react';
import AnnouncementBar from '@/components/storefront/AnnouncementBar';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice, formatDate } from '@/lib/utils';
import { Order } from '@/types';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { t } = useLanguage();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#0B132B', '#10B981', '#F59E0B'],
      });
    } catch (e) {
      console.error(e);
    }

    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setOrder(data);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId]);

  return (
    <main className="flex-1 bg-slate-50/60 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Celebration Header */}
        <div className="bg-[#ffffff] rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">
            {t('orderSuccessTitle')}
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-[#0B132B] tracking-tight">
            {t('orderSuccessTitle')}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            {t('orderSuccessDesc')}
          </p>

          {order && (
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
              <span className="px-3.5 py-1.5 bg-slate-100 rounded-xl text-slate-800">
                {t('orderNumber')} #{order.orderNumber}
              </span>
              <span className="px-3.5 py-1.5 bg-blue-50 text-blue-700 rounded-xl">
                {t('trackingNumber')} #{order.trackingNumber}
              </span>
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            {order && (
              <Link
                href={`/track-order?orderId=${order.orderNumber}`}
                className="px-6 py-3 bg-[#0B132B] hover:bg-slate-800 text-[#ffffff] rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
              >
                <Truck className="w-4 h-4" />
                {t('trackMyParcel')}
              </Link>
            )}
            <Link
              href="/shop"
              className="px-6 py-3 border border-slate-200 bg-[#ffffff] hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              {t('continueShopping')}
            </Link>
          </div>
        </div>

        {/* Detailed Receipt */}
        {order && (
          <div className="mt-8 bg-[#ffffff] rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#0B132B] flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-blue-600" />
                {t('orderSummary')}
              </h3>
              <span className="text-xs text-slate-400">
                {formatDate(order.createdAt)}
              </span>
            </div>

            {/* Line Items */}
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-xl bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#0B132B] truncate">
                      {item.productName}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {item.variantColor && <span>{item.variantColor} • </span>}
                      {item.variantSize && <span>{item.variantSize} • </span>}
                      <span>Qty: {item.quantity}</span>
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#0B132B]">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Delivery and Payment Summary Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <div>
                <span className="font-bold text-slate-800 block mb-1">
                  {t('shippingAddress')}
                </span>
                <p>{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                </p>
                <p className="text-slate-400 mt-1">{order.customerPhone}</p>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">
                  {t('paymentMethod')}
                </span>
                <p>{t('paymentMethod')}: <strong className="text-slate-800">{order.paymentMethod}</strong></p>
                <p>Status: <strong className="text-emerald-600">{order.paymentStatus}</strong></p>
                <p className="mt-2 text-sm font-bold text-[#0B132B]">
                  {t('total')}: {formatPrice(order.total)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AnnouncementBar />
      <Header />
      <Suspense fallback={<div className="p-20 text-center text-sm">Loading receipt...</div>}>
        <OrderSuccessContent />
      </Suspense>
      <Footer />
    </div>
  );
}
