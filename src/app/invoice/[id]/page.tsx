'use client';

import React, { useState, useEffect, use, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import Image from 'next/image';
import { Printer, ArrowLeft, Download } from 'lucide-react';

function InvoiceContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tokenParam = searchParams.get('token');
  const autoPrint = searchParams.get('print') === '1';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let resolvedToken = tokenParam || '';
    if (!resolvedToken) {
      try {
        resolvedToken = sessionStorage.getItem(`bdneeds_chalan_${id}`) || '';
        if (!resolvedToken) {
          const guestList = JSON.parse(
            localStorage.getItem('bdneeds_guest_orders') || '[]'
          );
          if (Array.isArray(guestList)) {
            const match = guestList.find((g: any) => g?.id === id);
            if (match?.token) resolvedToken = match.token;
          }
        }
      } catch {}
    }

    const query = resolvedToken ? `?token=${encodeURIComponent(resolvedToken)}` : '';
    fetch(`/api/orders/${id}${query}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setOrder(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, tokenParam]);

  useEffect(() => {
    if (order && autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [order, autoPrint]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 font-medium">
        Generating Order Chalan...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-slate-500">
        <p className="font-semibold">Order Chalan not found.</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 bg-[#0B132B] text-[#ffffff] rounded-xl text-xs font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ffffff] text-black p-4 sm:p-6 font-sans w-full max-w-[1000px] mx-auto">
      {/* Print styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
          .no-print, .fixed { display: none !important; }
          @page { margin: 10mm; size: auto; }
        }
      `,
        }}
      />

      {/* Non-printable Top Action Bar */}
      <div className="no-print flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0B132B] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-[#ffffff] rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Download / Print Chalan (PDF)
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-[#0B132B] pb-6 mb-6">
        <div>
          <div className="mb-4">
            <Image
              src="/logo.png"
              alt="BdNeeds"
              width={140}
              height={40}
              className="h-8 w-auto object-contain"
              priority
            />
          </div>
          <h2 className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">
            Chalan / Bill To:
          </h2>
          <h1 className="text-xl font-bold text-slate-900">{order.customerName}</h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xs">
            {typeof order.shippingAddress === 'string'
              ? order.shippingAddress
              : (() => {
                  const a = order.shippingAddress as {
                    street: string;
                    area?: string;
                    city: string;
                    postalCode: string;
                  };
                  return `${a.street}, ${a.area ? a.area + ', ' : ''}${a.city}${
                    a.postalCode ? ' - ' + a.postalCode : ''
                  }`;
                })()}
          </p>
          <p className="text-sm text-slate-600 mt-2">{order.customerPhone}</p>
          {order.customerEmail && (
            <p className="text-sm text-slate-600">{order.customerEmail}</p>
          )}
        </div>
        <div className="sm:text-right">
          <h1 className="text-3xl sm:text-4xl font-black text-[#0B132B] mb-2 uppercase tracking-tight">
            Order Chalan
          </h1>
          <p className="text-slate-600 font-bold mb-1">Order #{order.orderNumber}</p>
          <p className="text-xs text-slate-500 font-semibold mb-1">
            Tracking #{order.trackingNumber}
          </p>
          <p className="text-sm text-slate-600">Date: {formatDate(order.createdAt)}</p>
          <div className="mt-5 inline-block sm:text-right">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">
              Payment Info
            </p>
            <p className="text-sm text-slate-800 font-semibold">{order.paymentMethod}</p>
            <p
              className={`text-xs font-bold mt-1 uppercase tracking-wider ${
                order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
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
              <th className="py-3.5 px-5 font-semibold text-xs tracking-wider uppercase">
                Item Description
              </th>
              <th className="py-3.5 px-5 font-semibold text-xs tracking-wider uppercase text-center w-24">
                Qty
              </th>
              <th className="py-3.5 px-5 font-semibold text-xs tracking-wider uppercase text-right w-32">
                Price
              </th>
              <th className="py-3.5 px-5 font-semibold text-xs tracking-wider uppercase text-right w-32">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((item, i) => {
              const variantDetails = [
                item.variantName,
                item.variantColor ? `Color: ${item.variantColor}` : null,
                item.variantSize ? `Size: ${item.variantSize}` : null,
                item.variantStorage ? `Storage: ${item.variantStorage}` : null,
              ]
                .filter(Boolean)
                .join(' • ');

              return (
                <tr key={i} className="bg-[#ffffff]">
                  <td className="py-4 px-5">
                    <p className="font-bold text-slate-900">{item.productName}</p>
                    {variantDetails && (
                      <p className="text-xs text-slate-500 mt-1">{variantDetails}</p>
                    )}
                    {item.variantSku && (
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        SKU: {item.variantSku}
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-5 text-center font-medium text-slate-700">
                    {item.quantity}
                  </td>
                  <td className="py-4 px-5 text-right text-slate-500 font-medium">
                    {formatPrice(item.price)}
                  </td>
                  <td className="py-4 px-5 text-right font-bold text-slate-900">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end border-b border-slate-200 pb-8 mb-8">
        <div className="w-72 space-y-3">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal:</span>
            <span className="font-semibold text-slate-900">
              {formatPrice(order.subtotal)}
            </span>
          </div>
          {((order.discountAmount ?? 0) > 0 || order.discount > 0) && (
            <div className="flex justify-between text-sm text-emerald-600 font-medium">
              <span>Discount ({order.appliedCoupon || order.couponCode || 'Promo'}):</span>
              <span>-{formatPrice((order.discountAmount ?? 0) || order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-slate-600">
            <span>Shipping:</span>
            <span className="font-semibold text-slate-900">
              {formatPrice(order.shippingCost || order.shippingFee || 0)}
            </span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Tax:</span>
            <span className="font-semibold text-slate-900">
              {formatPrice(order.tax || 0)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xl font-black text-[#0B132B] pt-4 border-t-2 border-[#0B132B] mt-2">
            <span>Grand Total:</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-slate-500 text-sm mt-16 pt-8">
        <p className="font-bold text-[#0B132B] mb-1">
          Thank you for shopping with BdNeeds!
        </p>
        <p>
          If you have any questions concerning this chalan, please contact our support.
        </p>
      </div>

      {/* Bottom Print Button (hidden in print) */}
      <div className="mt-12 text-center no-print">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#0B132B] text-[#ffffff] rounded-full font-bold hover:bg-blue-600 shadow-xl shadow-blue-900/20 transition-all active:scale-95 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Print / Download PDF Chalan
        </button>
      </div>
    </div>
  );
}

export default function InvoicePage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-400 font-medium">
          Loading Order Chalan...
        </div>
      }
    >
      <InvoiceContent id={id} />
    </Suspense>
  );
}
