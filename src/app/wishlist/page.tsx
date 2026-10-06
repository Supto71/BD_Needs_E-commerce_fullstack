'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import AnnouncementBar from '@/components/storefront/AnnouncementBar';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import MobileBottomNav from '@/components/storefront/MobileBottomNav';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function WishlistPage() {
  const { wishlistIds, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((allProducts: Product[]) => {
        if (Array.isArray(allProducts)) {
          setProducts(allProducts.filter((p) => wishlistIds.includes(p.id)));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [wishlistIds]);

  const handleMoveToCart = (product: Product) => {
    addToCart({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.images[0] as string,
      price: product.basePrice,
      originalPrice: product.originalPrice,
      quantity: 1,
      maxStock: product.stock,
    });
    removeFromWishlist(product.id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 bg-slate-50/60 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-200">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B132B]">
                {t('wishlist')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Items you have curated for future acquisitions.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-[#ffffff] px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
              {wishlistIds.length} {t('productsCount')}
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs font-semibold text-slate-400">
              Loading wishlist...
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center bg-[#ffffff] rounded-3xl border border-slate-100 shadow-xs max-w-lg mx-auto mt-8 p-8">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 fill-rose-500" />
              </div>
              <h2 className="text-xl font-bold text-[#0B132B]">{t('wishlist')}</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-2 mb-8 leading-relaxed">
                Save pieces you adore while browsing our collection to keep track of their availability and seasonal discounts.
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#ffffff] rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <Link
                      href={`/product/${product.slug}`}
                      className="relative aspect-square w-full block bg-slate-50 overflow-hidden"
                    >
                      <Image
                        src={product.images[0] as string}
                        alt={product.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                    </Link>

                    <div className="p-4 space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {product.brand}
                      </span>
                      <Link
                        href={`/product/${product.slug}`}
                        className="block font-bold text-sm text-[#0B132B] hover:text-blue-600 transition-colors line-clamp-1"
                      >
                        {product.name}
                      </Link>

                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-extrabold text-[#0B132B]">
                          {formatPrice(product.basePrice)}
                        </span>
                        {product.originalPrice > product.basePrice && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-semibold">
                        {product.stock > 0 ? (
                          <span className="text-emerald-600">{t('inStock')}</span>
                        ) : (
                          <span className="text-rose-600">{t('outOfStock')}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex gap-2">
                    <button
                      onClick={() => handleMoveToCart(product)}
                      disabled={product.stock <= 0}
                      className="flex-1 py-2.5 px-3 bg-[#0B132B] hover:bg-blue-600 disabled:opacity-50 text-[#ffffff] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {t('addToBag')}
                    </button>
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
