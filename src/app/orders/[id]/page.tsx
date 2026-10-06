import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Truck, Package, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import AnnouncementBar from '@/components/storefront/AnnouncementBar';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import MobileBottomNav from '@/components/storefront/MobileBottomNav';
import { getOrderById } from '@/lib/db';
import { formatPrice, formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Orders
          </Link>

          <div className="bg-[#ffffff] rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Order Details & Manifest
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-[#0B132B]">
                  #{order.orderNumber}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Placed on {formatDate(new Date(order.createdAt).toISOString())} • Tracking #{order.trackingNumber}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/track-order?orderId=${order.orderNumber}`}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-[#ffffff] rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-xs"
                >
                  <Truck className="w-4 h-4" />
                  Live GPS Tracking
                </Link>
              </div>
            </div>

            {/* Status Timeline */}
            <div>
              <h3 className="text-sm font-bold text-[#0B132B] mb-4">
                Milestones & Dispatch Status
              </h3>
              <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                {(order.timeline as any[])?.map((ev, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-[#ffffff] shadow-xs" />
                    <div>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(ev.timestamp)}
                      </span>
                      <h4 className="text-xs font-bold text-[#0B132B] mt-0.5">
                        {ev.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">{ev.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Line items */}
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-[#0B132B] mb-4">
                Purchased Items ({order.items.length})
              </h3>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                {order.items.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-xl bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div>
                        <Link
                          href={`/product/${item.productSlug}`}
                          className="text-xs sm:text-sm font-bold text-[#0B132B] hover:text-blue-600 transition-colors line-clamp-1"
                        >
                          {item.productName}
                        </Link>
                        <div className="text-[11px] text-slate-400 mt-0.5 space-x-2">
                          {item.variantColor && <span>Color: {item.variantColor}</span>}
                          {item.variantSize && <span>• Size: {item.variantSize}</span>}
                          <span>• SKU: {item.variantSku || 'BASE'}</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-700 mt-1 block">
                          {formatPrice(item.price)} × {item.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-[#0B132B]">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Totals & Address Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-slate-100 text-xs">
              <div className="space-y-2 text-slate-600">
                <span className="font-bold text-slate-900 block text-sm mb-2">
                  Delivery Destination
                </span>
                <p className="font-semibold text-slate-800">{(order.shippingAddress as any)?.fullName}</p>
                <p>{(order.shippingAddress as any)?.street}</p>
                <p>{(order.shippingAddress as any)?.city}, {(order.shippingAddress as any)?.postalCode}</p>
                <p className="text-slate-400 mt-2">Phone: {order.customerPhone}</p>
                <p className="text-slate-400">Email: {order.customerEmail}</p>
              </div>

              <div className="space-y-2 text-slate-600 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <span className="font-bold text-slate-900 block text-sm mb-2">
                  Invoice Breakdown
                </span>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon Discount:</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee:</span>
                  <span className="font-semibold text-slate-800">
                    {order.shippingFee === 0 ? 'FREE' : formatPrice(order.shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sales Tax:</span>
                  <span className="font-semibold text-slate-800">{formatPrice(order.tax)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-[#0B132B]">Total Paid:</span>
                  <span className="text-xl font-black text-[#0B132B]">
                    {formatPrice(order.total)}
                  </span>
                </div>
                <div className="pt-2 text-[11px] text-slate-500">
                  Payment Method: <strong>{order.paymentMethod}</strong> ({order.paymentStatus})
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
