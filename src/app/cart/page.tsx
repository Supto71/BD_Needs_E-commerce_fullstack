'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Trash2,
  Heart,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle2,
  AlertCircle,
  Truck,
} from 'lucide-react';
import AnnouncementBar from '@/components/storefront/AnnouncementBar';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import MobileBottomNav from '@/components/storefront/MobileBottomNav';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { t } = useLanguage();

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    message: string;
  } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const freeShippingThreshold = 1000;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 60;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = Number((taxableAmount * 0.05).toFixed(2));
  const orderTotal = Number((taxableAmount + shippingFee + tax).toFixed(2));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponError('');
    setValidatingCoupon(true);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon({
          code: data.code,
          discount: data.discount,
          message: data.message,
        });
        setCouponCode('');
      } else {
        setCouponError(data.message || 'Invalid coupon code.');
      }
    } catch {
      setCouponError('Failed to validate coupon.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleMoveToWishlist = (productId: string, cartItemId: string) => {
    if (!isInWishlist(productId)) {
      toggleWishlist(productId);
    }
    removeFromCart(cartItemId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 bg-slate-50/50 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-200">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B132B]">
                {t('shoppingBag')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {t('cartEmptyDesc')}
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-[#ffffff] px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
              {totalItems} {t('productsCount')}
            </span>
          </div>

          {items.length === 0 ? (
            <div className="py-24 text-center bg-[#ffffff] rounded-3xl border border-slate-100 shadow-xs max-w-2xl mx-auto mt-8 p-8">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-[#0B132B]">{t('cartEmptyTitle')}</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-2 mb-8 leading-relaxed">
                {t('cartEmptyDesc')}
              </p>
              <Link
                href="/shop"
                className="px-8 py-3.5 bg-[#0B132B] hover:bg-blue-600 text-[#ffffff] font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-sm inline-flex items-center gap-2"
              >
                {t('allProducts')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8">
              {/* Items List */}
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-[#ffffff] rounded-3xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </div>
                        <div>
                          <Link
                            href={`/product/${item.productSlug}`}
                            className="text-sm sm:text-base font-bold text-[#0B132B] hover:text-blue-600 transition-colors line-clamp-1"
                          >
                            {item.productName}
                          </Link>
                          <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                            {item.colorName && (
                              <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-slate-300"
                                  style={{ backgroundColor: item.colorHex || '#000' }}
                                />
                                {item.colorName}
                              </span>
                            )}
                            {item.size && <span>• Size: {item.size}</span>}
                            {item.storage && <span>• {item.storage}</span>}
                          </div>
                          <div className="text-xs font-semibold text-slate-500 mt-1 sm:hidden">
                            {formatPrice(item.price)} each
                          </div>
                        </div>
                      </div>

                      {/* Quantity & Actions Row */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                        <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-slate-100 text-slate-600 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-slate-100 text-slate-600 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right min-w-20">
                          <span className="text-base font-extrabold text-[#0B132B]">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>

                        {/* Actions: Wishlist & Remove */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveToWishlist(item.productId, item.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                            title="Save for later"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                            title="Remove from bag"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Continue Shopping */}
                <div className="pt-2">
                  <Link
                    href="/shop"
                    className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    ← {t('continueShopping')}
                  </Link>
                </div>
              </div>

              {/* Order Summary & Coupon Card */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#ffffff] rounded-3xl border border-slate-100 shadow-xs p-6 space-y-6">
                  <h3 className="text-base font-bold text-[#0B132B] pb-3 border-b border-slate-100">
                    {t('orderSummary')}
                  </h3>

                  {/* Coupon Input Form */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-blue-600" />
                      {t('haveCoupon')}
                    </label>

                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          {appliedCoupon.code} (-{formatPrice(appliedCoupon.discount)})
                        </span>
                        <button
                          onClick={() => setAppliedCoupon(null)}
                          className="text-slate-400 hover:text-rose-600 text-[11px]"
                        >
                          {t('removeItem')}
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder={t('enterCouponCode')}
                            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl uppercase font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                          />
                          <button
                            type="submit"
                            disabled={validatingCoupon}
                            className="px-4 py-2 bg-[#0B132B] hover:bg-blue-600 text-[#ffffff] text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                          >
                            {validatingCoupon ? '...' : t('apply')}
                          </button>
                        </div>
                        {couponError && (
                          <p className="text-[11px] text-rose-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {couponError}
                          </p>
                        )}
                      </form>
                    )}
                  </div>

                  {/* Cost Breakdown */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>{t('subtotal')}</span>
                      <span className="font-semibold text-slate-800">
                        {formatPrice(subtotal)}
                      </span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>{t('discount')} ({appliedCoupon.code})</span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-blue-600" />
                        {t('shipping')}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {shippingFee === 0 ? (
                          <span className="text-emerald-600 uppercase font-bold">
                            {t('free')}
                          </span>
                        ) : (
                          formatPrice(shippingFee)
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>{t('estimatedTax')}</span>
                      <span className="font-semibold text-slate-800">
                        {formatPrice(tax)}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                      <span className="text-sm font-bold text-[#0B132B]">{t('total')}</span>
                      <span className="text-2xl font-black text-[#0B132B]">
                        {formatPrice(orderTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Proceed to Checkout CTA */}
                  <Link
                    href={`/checkout${appliedCoupon ? `?coupon=${appliedCoupon.code}` : ''}`}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-[#ffffff] rounded-xl text-sm font-bold text-center transition-all shadow-md hover:shadow-blue-500/20 flex items-center justify-center gap-2"
                  >
                    {t('proceedToCheckout')}
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  {/* Trust Micro Footer */}
                  <div className="pt-2 text-center text-slate-400 text-[11px] flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>256-Bit SSL Encrypted Checkout</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
