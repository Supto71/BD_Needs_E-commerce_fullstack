'use client';

import React, { useState, useEffect, use } from 'react';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import Image from 'next/image';

export default function InvoicePage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setOrder(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (order) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [order]);

  if (loading || !order) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-medium">Generating Invoice...</div>;

  return (
    <div className="min-h-screen bg-[#ffffff] text-black p-4 sm:p-6 font-sans w-full max-w-[1000px] mx-auto">
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
          .no-print, .fixed { display: none !important; }
          @page { margin: 10mm; size: auto; }
        }
      `}} />
      
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-[#0B132B] pb-6 mb-6">
        <div>
          <div className="mb-4">
            <Image src="/logo.png" alt="BdNeeds" width={140} height={40} className="h-8 w-auto object-contain" priority />
          </div>
          <h2 className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Invoice To:</h2>
          <h1 className="text-xl font-bold text-slate-900">{order.customerName}</h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xs">
            {typeof order.shippingAddress === 'string' 
              ? order.shippingAddress 
              : (() => { const a = order.shippingAddress as { street: string; area?: string; city: string; postalCode: string }; return `${a.street}, ${a.area ? a.area + ', ' : ''}${a.city} - ${a.postalCode}`; })()}
          </p>
          <p className="text-sm text-slate-600 mt-2">{order.customerPhone}</p>
          <p className="text-sm text-slate-600">{order.customerEmail}</p>
        </div>
        <div className="text-right">
          <h1 className="text-4xl font-black text-[#0B132B] mb-2 uppercase tracking-tight">Invoice</h1>
          <p className="text-slate-500 font-semibold mb-1">Order #{order.orderNumber}</p>
          <p className="text-sm text-slate-600">Date: {formatDate(order.createdAt)}</p>
          <div className="mt-6 inline-block text-right">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Payment info</p>
            <p className="text-sm text-slate-800 font-semibold">{order.paymentMethod}</p>
            <p className={`text-xs font-bold mt-1 uppercase tracking-wider ${
              order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'
            }`}>
              {order.paymentStatus}
            </p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0B132B] text-[#ffffff]">
              <th className="py-3.5 px-5 font-semibold text-xs tracking-wider uppercase">Item Description</th>
              <th className="py-3.5 px-5 font-semibold text-xs tracking-wider uppercase text-center w-24">Qty</th>
              <th className="py-3.5 px-5 font-semibold text-xs tracking-wider uppercase text-right w-32">Price</th>
              <th className="py-3.5 px-5 font-semibold text-xs tracking-wider uppercase text-right w-32">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((item, i) => (
              <tr key={i} className="bg-[#ffffff]">
                <td className="py-4 px-5">
                  <p className="font-bold text-slate-900">{item.productName}</p>
                  {item.variantName && <p className="text-xs text-slate-500 mt-1">Variant: {item.variantName}</p>}
                </td>
                <td className="py-4 px-5 text-center font-medium text-slate-700">{item.quantity}</td>
                <td className="py-4 px-5 text-right text-slate-500 font-medium">{formatPrice(item.price)}</td>
                <td className="py-4 px-5 text-right font-bold text-slate-900">{formatPrice(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end border-b border-slate-200 pb-8 mb-8">
        <div className="w-72 space-y-3">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal:</span>
            <span className="font-semibold text-slate-900">{formatPrice(order.subtotal)}</span>
          </div>
          {((order.discountAmount ?? 0) > 0 || order.discount > 0) && (
            <div className="flex justify-between text-sm text-emerald-600 font-medium">
              <span>Discount ({order.appliedCoupon || order.couponCode || 'Promo'}):</span>
              <span>-{formatPrice((order.discountAmount ?? 0) || order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-slate-600">
            <span>Shipping:</span>
            <span className="font-semibold text-slate-900">{formatPrice(order.shippingCost || order.shippingFee || 0)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Tax:</span>
            <span className="font-semibold text-slate-900">{formatPrice(order.tax || 0)}</span>
          </div>
          <div className="flex justify-between items-center text-xl font-black text-[#0B132B] pt-4 border-t-2 border-[#0B132B] mt-2">
            <span>Grand Total:</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-slate-500 text-sm mt-16 pt-8">
        <p className="font-bold text-[#0B132B] mb-1">Thank you for shopping with BdNeeds!</p>
        <p>If you have any questions concerning this invoice, please contact our support.</p>
      </div>
      
      {/* Print Button (hidden in print) */}
      <div className="mt-12 text-center no-print">
        <button 
          onClick={() => window.print()} 
          className="px-8 py-3 bg-[#0B132B] text-[#ffffff] rounded-full font-bold hover:bg-blue-600 shadow-xl shadow-blue-900/20 transition-all active:scale-95"
        >
          Print / Download PDF
        </button>
      </div>
    </div>
  );
}
