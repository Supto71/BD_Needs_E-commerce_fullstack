'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  Truck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import AnnouncementBar from '@/components/storefront/AnnouncementBar';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import MobileBottomNav from '@/components/storefront/MobileBottomNav';
import { Order, OrderStatus } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const queryOrder = searchParams.get('orderId') || '';
  const { t } = useLanguage();

  const [searchCode, setSearchCode] = useState(queryOrder);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (code: string) => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (res.ok && !data.error) {
        setOrder(data);
      } else {
        setError('No shipment found matching that Order Number or Tracking ID.');
        setOrder(null);
      }
    } catch {
      setError('Unable to fetch shipment tracking at this moment.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryOrder) {
      handleTrack(queryOrder);
    }
  }, [queryOrder]);

  const statusSteps: OrderStatus[] = [
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
  ];

  const getStepIndex = (status: OrderStatus) => {
    const idx = statusSteps.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <main className="flex-1 bg-slate-50/60 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">
            {t('packageTracker')}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0B132B] mt-1">
            {t('trackOrder')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            {t('enterTrackingPrompt')}
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-[#ffffff] rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs max-w-2xl mx-auto mb-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTrack(searchCode);
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <input
                type="text"
                required
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder={t('enterTrackingPrompt')}
                className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-semibold"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#0B132B] hover:bg-blue-600 disabled:opacity-50 text-[#ffffff] rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                '...'
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  {t('trackButton')}
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Tracking Details Display */}
        {order && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Status Header Banner */}
            <div className="bg-[#ffffff] rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                  <span className="text-xs text-slate-400 font-semibold">
                    {t('orderNumber')} #{order.orderNumber}
                  </span>
                  <h3 className="text-xl font-bold text-[#0B132B]">
                    Status:{' '}
                    <span className="text-blue-600 uppercase tracking-wide">
                      {order.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </h3>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-400 block font-medium">
                    {t('trackingNumber')}
                  </span>
                  <span className="text-sm font-bold text-slate-800 font-mono">
                    {order.trackingNumber}
                  </span>
                </div>
              </div>

              {/* Progress Milestones Tracker */}
              <div className="pt-8 pb-12 sm:pb-4">
                <div className="relative flex items-center justify-between">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 w-full z-0" />
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 z-0 transition-all duration-500"
                    style={{
                      width: `${
                        (getStepIndex(order.orderStatus) /
                          (statusSteps.length - 1)) *
                        100
                      }%`,
                    }}
                  />

                  {statusSteps.map((step, idx) => {
                    const isPassed = idx <= getStepIndex(order.orderStatus);
                    const isCurrent = idx === getStepIndex(order.orderStatus);
                    return (
                      <div
                        key={step}
                        className="relative z-10 flex flex-col items-center"
                      >
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                            isPassed
                              ? 'bg-blue-600 text-[#ffffff] shadow-md'
                              : 'bg-[#ffffff] border-2 border-slate-200 text-slate-400'
                          } ${isCurrent ? 'ring-4 ring-blue-100 scale-110' : ''}`}
                        >
                          {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                        </div>
                        <span
                          className={`absolute top-10 sm:static text-[8px] sm:text-[11px] font-semibold sm:mt-2 text-center uppercase tracking-tighter w-14 sm:w-auto leading-[10px] sm:leading-tight ${
                            isPassed ? 'text-blue-950 font-bold' : 'text-slate-400'
                          }`}
                        >
                          {step.replace(/_/g, ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Granular Timeline & Courier Notes */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Timeline Log */}
              <div className="lg:col-span-7 bg-[#ffffff] rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                <h4 className="text-sm font-bold text-[#0B132B]">
                  Activity History & Checkpoints
                </h4>

                <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                  {order.timeline?.map((event, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-[#ffffff] shadow-xs" />
                      <div>
                        <span className="text-[11px] text-slate-400">
                          {formatDate(event.timestamp)}
                        </span>
                        <h5 className="text-xs font-bold text-[#0B132B] mt-0.5">
                          {event.title}
                        </h5>
                        <p className="text-xs text-slate-600 mt-1">
                          {event.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Order Items & Recipient info */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#ffffff] rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {t('shippingAddress')}
                  </h4>
                  <div className="text-xs text-slate-700 space-y-1">
                    <p className="font-bold text-slate-900">
                      {order.shippingAddress.fullName}
                    </p>
                    <p>{order.shippingAddress.street}</p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                    </p>
                    <p className="text-slate-500 pt-1">{order.customerPhone}</p>
                  </div>
                </div>

                <div className="bg-[#ffffff] rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {t('orderSummary')} ({order.items.length})
                  </h4>
                  <div className="divide-y divide-slate-100">
                    {order.items.map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#0B132B] truncate">
                            {item.productName}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Qty: {item.quantity} • {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AnnouncementBar />
      <Header />
      <Suspense fallback={<div className="p-20 text-center text-sm">Loading tracker...</div>}>
        <TrackOrderContent />
      </Suspense>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
