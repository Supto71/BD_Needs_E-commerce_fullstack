'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ChevronLeft,
  Truck,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  Save,
  Clock,
  Trash2,
  Printer,
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminOrderDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(props.params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  // Status Form State
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('PENDING');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus>('PENDING');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  const fetchOrder = () => {
    setLoading(true);
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setOrder(data);
          setSelectedStatus(data.orderStatus);
          setSelectedPaymentStatus(data.paymentStatus);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateMessage('');

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedStatus,
          paymentStatus: selectedPaymentStatus,
          note: statusNote.trim() || `Workflow state transitioned to ${selectedStatus}`,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrder(data);
        setStatusNote('');
        setUpdateMessage('Order status updated successfully and recorded to customer timeline.');
        setTimeout(() => setUpdateMessage(''), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/admin/orders');
      } else {
        alert('Failed to delete order.');
        setDeleting(false);
      }
    } catch (e) {
      alert('An error occurred.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs font-semibold text-slate-400">
        Loading consignment manifest...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center text-sm font-semibold text-slate-600">
        Order not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B132B]">
              Fulfillment Order #{order.orderNumber}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                order.orderStatus === 'DELIVERED'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-blue-50 text-blue-700'
              }`}
            >
              {order.orderStatus}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Tracking Code: {order.trackingNumber} • Placed {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          <Link
            href={`/admin/orders/${order.id}/receipt`}
            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 border border-blue-200"
          >
            <Printer className="w-4 h-4" />
            POS Receipt
          </Link>
          <Link
            href={`/track-order?orderId=${order.orderNumber}`}
            target="_blank"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
          >
            <Truck className="w-4 h-4 text-blue-600" />
            Tracking View
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Line Items & Customer Specs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Line Items Details Card */}
          <div className="bg-[#ffffff] rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#0B132B] flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-blue-600" />
              Purchased Line Items ({order.items.length})
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
                      <h4 className="text-xs sm:text-sm font-bold text-[#0B132B]">
                        {item.productName}
                      </h4>
                      <div className="text-[11px] text-slate-500 mt-0.5 space-x-2">
                        {item.variantColor && <span>Color: <strong>{item.variantColor}</strong></span>}
                        {item.variantSize && <span>• Size: <strong>{item.variantSize}</strong></span>}
                        <span>• SKU: <strong>{item.variantSku || 'BASE'}</strong></span>
                      </div>
                      <span className="text-xs font-semibold text-slate-700 mt-1 block">
                        {formatPrice(item.price)} × {item.quantity} units
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-black text-[#0B132B]">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Ledger Breakdown */}
            <div className="pt-4 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount ({order.couponCode || 'PROMO'})</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Courier Shipping Fee</span>
                <span className="font-semibold text-slate-900">
                  {order.shippingFee === 0 ? 'FREE' : formatPrice(order.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="font-semibold text-slate-900">{formatPrice(order.tax)}</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-sm font-bold text-[#0B132B]">Total Billed</span>
                <span className="text-2xl font-black text-[#0B132B]">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="bg-[#ffffff] rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Customer Information
              </h4>
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm text-slate-900">{order.customerName}</p>
                {order.user?.isFraud && (
                  <div className="flex items-center gap-1 bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                    <AlertCircle className="w-3 h-3" />
                    <span>Fraud Alert</span>
                  </div>
                )}
              </div>
              <p className="text-slate-600 mt-1">{order.customerEmail}</p>
              <p className="text-slate-600 font-medium">{order.customerPhone}</p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Shipping Destination
              </h4>
              <p className="font-bold text-slate-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              {order.shippingAddress.area && <p>{order.shippingAddress.area}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </p>
              {order.deliveryNote && (
                <p className="text-amber-700 bg-amber-50 p-2 rounded-lg mt-2 font-medium">
                  Note: {order.deliveryNote}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Status Transition Engine */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#ffffff] rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0B132B]">
              Update Fulfillment Workflow
            </h3>

            {updateMessage && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{updateMessage}</span>
              </div>
            )}

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Order Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="PENDING">Pending Verification</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PROCESSING">Processing & Packing</option>
                  <option value="SHIPPED">Shipped with Courier</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Payment Status
                </label>
                <select
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Courier Note / Checkpoint Reason
                </label>
                <textarea
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Dispatched via FedEx tracking flight 402..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-[#ffffff] rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Save className="w-4 h-4" />
                {updating ? 'Updating...' : 'Commit Status Change'}
              </button>

              <div className="pt-4 border-t border-slate-100">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={handleDeleteOrder}
                    disabled={deleting}
                    className="w-full py-3 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 border border-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deleting ? 'Deleting...' : 'Delete Order'}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Timeline History */}
          <div className="bg-[#ffffff] rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Audit Milestones
            </h4>
            <div className="relative pl-5 border-l-2 border-slate-200 space-y-4 text-xs">
              {order.timeline?.map((ev, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-blue-600 border-2 border-[#ffffff] shadow-xs" />
                  <div>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(ev.timestamp)}
                    </span>
                    <h5 className="font-bold text-[#0B132B]">{ev.title}</h5>
                    <p className="text-slate-500 text-[11px] mt-0.5">{ev.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
