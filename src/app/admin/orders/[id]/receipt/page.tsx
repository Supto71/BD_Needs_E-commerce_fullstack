'use client';

import React, { useState, useEffect, use } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { Printer, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function POSReceiptPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setOrder(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-sm font-semibold text-slate-500">Loading receipt...</div>;
  }

  if (!order) {
    return <div className="p-8 text-center text-sm font-semibold text-red-500">Order not found.</div>;
  }

  const invoiceUrl = typeof window !== 'undefined' ? `${window.location.origin}/invoice/${order.id}` : `https://bdneeds.com/invoice/${order.id}`;

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 font-mono text-slate-900 flex justify-center print:bg-white print:p-0 print:py-0">
      
      {/* Non-printable Action Bar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-lg border border-slate-200 flex items-center gap-4 print:hidden z-50">
        <Link
          href={`/admin/orders/${id}`}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>
        <div className="w-px h-6 bg-slate-200" />
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Printer className="w-4 h-4" /> Print Receipt
        </button>
      </div>

      {/* POS Receipt Container - 80mm width roughly corresponds to 300px */}
      <div className="bg-white p-6 rounded-none sm:rounded-xl shadow-none sm:shadow-sm w-full max-w-[320px] print:w-full print:max-w-full print:shadow-none mx-auto mt-16 sm:mt-12 print:mt-0 text-xs">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-black uppercase tracking-wider mb-1">BDNEEDS</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Premium Essentials</p>
          <div className="mt-4 border-b border-dashed border-slate-300 pb-4">
            <p className="font-bold">Order #{order.orderNumber}</p>
            <p className="text-slate-500">{formatDate(order.createdAt)}</p>
          </div>
        </div>

        {/* Customer Details */}
        <div className="mb-6 border-b border-dashed border-slate-300 pb-4">
          <h2 className="font-bold mb-1 uppercase tracking-wider text-[10px] text-slate-500">Bill To / Ship To</h2>
          <p className="font-bold text-sm">{order.customerName}</p>
          <p className="font-semibold">{order.customerPhone}</p>
          <p className="mt-1">
            {order.shippingAddress.street}
            {order.shippingAddress.area && `, ${order.shippingAddress.area}`}
          </p>
          <p>
            {order.shippingAddress.city} {order.shippingAddress.postalCode && `- ${order.shippingAddress.postalCode}`}
          </p>
        </div>

        {/* Items */}
        <div className="mb-6 border-b border-dashed border-slate-300 pb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 uppercase text-[10px] text-slate-500">
                <th className="pb-2 font-bold w-1/2">Item</th>
                <th className="pb-2 font-bold text-center">Qty</th>
                <th className="pb-2 font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="align-top">
              {order.items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 pr-2">
                    <div className="font-bold truncate max-w-[140px]">{item.productName}</div>
                    <div className="text-[10px] text-slate-500">
                      {item.variantColor && `${item.variantColor}`}
                      {item.variantSize && ` ${item.variantSize}`}
                    </div>
                  </td>
                  <td className="py-2 text-center font-semibold">{item.quantity}</td>
                  <td className="py-2 text-right font-bold">{formatPrice(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mb-6 border-b border-dashed border-slate-300 pb-4 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-bold">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Delivery</span>
            <span className="font-bold">{formatPrice(order.shippingFee)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-600">Discount</span>
              <span className="font-bold text-emerald-600">-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 mt-2 border-t border-slate-200">
            <span className="font-black text-sm uppercase">Total</span>
            <span className="font-black text-lg">{formatPrice(order.total)}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-slate-500 text-[10px] uppercase">Payment</span>
            <span className="font-bold text-[10px] uppercase">{order.paymentMethod} - {order.paymentStatus}</span>
          </div>
        </div>

        {/* QR Code & Footer */}
        <div className="text-center flex flex-col items-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">Scan for detailed invoice</p>
          <div className="bg-white p-2 rounded-lg border border-slate-200 inline-block">
            <QRCodeSVG value={invoiceUrl} size={100} level="M" />
          </div>
          <p className="text-[10px] text-slate-400 mt-4">Thank you for shopping with us!</p>
          <p className="text-[10px] text-slate-400">bdneeds.com</p>
        </div>

      </div>
    </div>
  );
}
