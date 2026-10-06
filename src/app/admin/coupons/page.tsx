'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Tag, Trash2, CheckCircle2, Clock, Edit } from 'lucide-react';
import { Coupon } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function AdminCouponsPage() {
  const { isAdmin } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('50');
  const [maxDiscount, setMaxDiscount] = useState('50');
  const [usageLimit, setUsageLimit] = useState('1000');
  const [expiryDate, setExpiryDate] = useState('2027-12-31');

  const fetchCoupons = () => {
    setLoading(true);
    fetch('/api/coupons')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCoupons(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const [editingId, setEditingId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingId(null);
    setCode('');
    setDiscountType('PERCENTAGE');
    setDiscountValue('');
    setMinOrderValue('50');
    setMaxDiscount('50');
    setUsageLimit('1000');
    setExpiryDate('2027-12-31');
    setModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setCode(coupon.code);
    setDiscountType(coupon.discountType);
    setDiscountValue(coupon.discountValue.toString());
    setMinOrderValue(coupon.minOrderValue.toString());
    setMaxDiscount(coupon.maxDiscount?.toString() || '');
    setUsageLimit(coupon.usageLimit.toString());
    setExpiryDate(new Date(coupon.expiryDate).toISOString().split('T')[0]);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) return;

    try {
      const payload = {
        id: editingId,
        code: code.toUpperCase().trim(),
        discountType,
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue || 0),
        maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
        expiryDate: new Date(expiryDate).toISOString(),
        usageLimit: Number(usageLimit || 1000),
        isActive: true,
      };

      const res = await fetch('/api/coupons', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchCoupons();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this voucher?')) return;
    try {
      const res = await fetch(`/api/coupons?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCoupons(coupons.filter((c) => c.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B132B]">
            Promotional Coupons & Vouchers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Program percentage deductions, fixed cart credits, and minimum purchase thresholds.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-[#ffffff] rounded-xl text-xs font-bold transition-colors flex items-center gap-2 self-start sm:self-auto shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Create Promo Voucher
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="bg-[#ffffff] rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 font-mono font-black text-sm rounded-xl tracking-wider border border-blue-200/60">
                  {coupon.code}
                </span>
                <div className="flex items-center gap-1">
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => openEditModal(coupon)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="text-2xl font-black text-[#0B132B]">
                {coupon.discountType === 'PERCENTAGE'
                  ? `${coupon.discountValue}% OFF`
                  : `${formatPrice(coupon.discountValue)} Credit`}
              </div>

              <div className="space-y-1 text-xs text-slate-500 mt-2">
                <p>Minimum Order: <strong>{formatPrice(coupon.minOrderValue)}</strong></p>
                {coupon.maxDiscount && (
                  <p>Maximum Cap: <strong>{formatPrice(coupon.maxDiscount)}</strong></p>
                )}
                <p>Expires: <strong>{formatDate(coupon.expiryDate)}</strong></p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">
                Redeemed: {coupon.usedCount} / {coupon.usageLimit}
              </span>
              <span className="text-emerald-600 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </span>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="relative bg-[#ffffff] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl z-10 space-y-4">
            <h3 className="text-lg font-bold text-[#0B132B]">
              {editingId ? 'Edit Promotional Coupon' : 'Create Promotional Coupon'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. VIP2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Value *</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="15"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Order (৳)</label>
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Discount (৳)</label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-[#ffffff] rounded-xl font-bold shadow-xs"
                >
                  {editingId ? 'Save Changes' : 'Activate Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
