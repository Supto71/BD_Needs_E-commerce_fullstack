'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/utils';

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeFromCart, subtotal, totalItems } =
    useCart();
  const { t } = useLanguage();

  if (!isOpen) return null;

  const freeShippingThreshold = 1000;
  const progressToFreeShipping = Math.min(
    100,
    (subtotal / freeShippingThreshold) * 100
  );
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#ffffff] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-[#0B132B]">
                {t('shoppingBag')}
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {totalItems} {t('productsCount')}
                </span>
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 text-xs">
            <div className="flex items-center justify-between mb-1.5 font-medium text-slate-700">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-600" />
                {remainingForFreeShipping > 0
                  ? `${t('addMoreForFreeShipping')} (${formatPrice(remainingForFreeShipping)})`
                  : t('freeShippingUnlocked')}
              </span>
              <span className="text-slate-500 font-semibold">{Math.round(progressToFreeShipping)}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-[#0B132B] mb-1">
                  {t('cartEmptyTitle')}
                </h3>
                <p className="text-sm text-slate-500 max-w-xs mb-6">
                  {t('cartEmptyDesc')}
                </p>
                <button
                  onClick={closeCart}
                  className="px-6 py-2.5 bg-[#0B132B] text-[#ffffff] text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {t('continueShopping')}
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                  <div className="relative w-20 h-20 bg-slate-50 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/product/${item.productSlug}`}
                          onClick={closeCart}
                          className="text-sm font-semibold text-[#0B132B] hover:text-blue-600 transition-colors line-clamp-1"
                        >
                          {item.productName}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-xs text-slate-500 mt-0.5 space-x-2">
                        {item.colorName && (
                          <span className="inline-flex items-center gap-1">
                            <span
                              className="w-2 h-2 rounded-full border border-slate-300"
                              style={{ backgroundColor: item.colorHex || '#000' }}
                            />
                            {item.colorName}
                          </span>
                        )}
                        {item.size && <span>• Size: {item.size}</span>}
                        {item.storage && <span>• {item.storage}</span>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-slate-200 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-[#0B132B]">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 font-medium">{t('subtotal')}</span>
                <span className="text-base font-bold text-[#0B132B]">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full py-3 px-4 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 bg-[#ffffff] hover:bg-slate-50 text-center transition-colors"
                >
                  {t('shoppingBag')}
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-[#ffffff] rounded-lg text-sm font-semibold text-center transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {t('proceedToCheckout')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
