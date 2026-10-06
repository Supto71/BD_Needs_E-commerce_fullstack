'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Star,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Check,
  ChevronRight,
  ArrowLeft,
  Share2,
  ShoppingCart,
  MessageCircle,
} from 'lucide-react';
import { Product, ProductVariant, Review } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/utils';
import ReviewSection from './ReviewSection';
import ProductCard from './ProductCard';

interface ProductDetailViewProps {
  product: Product;
  reviews: Review[];
  relatedProducts: Product[];
}

export default function ProductDetailView({
  product,
  reviews,
  relatedProducts,
}: ProductDetailViewProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { t, language } = useLanguage();

  // Active Variant State
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );

  // Active Images Gallery (dependent on selected variant)
  const [activeImage, setActiveImage] = useState<string>(
    selectedVariant?.images?.[0] || product.images[0]
  );

  // Options State
  const [selectedSize, setSelectedSize] = useState<string>(
    selectedVariant?.size || (product.variants?.find((v) => v.size)?.size ?? '')
  );
  const [selectedStorage, setSelectedStorage] = useState<string>(
    selectedVariant?.storage || (product.variants?.find((v) => v.storage)?.storage ?? '')
  );
  const [quantity, setQuantity] = useState<number>(1);

  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [isAdded, setIsAdded] = useState(false);

  // Update image when selected variant changes
  useEffect(() => {
    if (selectedVariant && selectedVariant.images?.length > 0) {
      setActiveImage(selectedVariant.images[0]);
    }
  }, [selectedVariant]);

  // Track recently viewed in localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bdneeds_recent');
      let recents: Product[] = stored ? JSON.parse(stored) : [];
      // Filter out current and keep up to 6
      recents = [product, ...recents.filter((p) => p.id !== product.id)].slice(0, 6);
      localStorage.setItem('bdneeds_recent', JSON.stringify(recents));
      setRecentlyViewed(recents.filter((p) => p.id !== product.id));
    } catch (e) {
      console.error(e);
    }
  }, [product]);

  const isFavorite = isInWishlist(product.id);
  const currentPrice = selectedVariant ? selectedVariant.price : product.basePrice;
  const originalPrice = product.originalPrice;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const currentSku = selectedVariant ? selectedVariant.sku : product.sku;

  const handleAddToCart = () => {
    if (currentStock <= 0) return;

    addToCart({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: activeImage,
      variantId: selectedVariant?.id,
      variantSku: currentSku,
      colorName: selectedVariant?.colorName,
      colorHex: selectedVariant?.colorHex,
      size: selectedSize || undefined,
      storage: selectedStorage || undefined,
      price: currentPrice,
      originalPrice,
      quantity,
      maxStock: currentStock,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    const buyNowItem = {
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: activeImage,
      variantId: selectedVariant?.id,
      variantSku: currentSku,
      colorName: selectedVariant?.colorName,
      colorHex: selectedVariant?.colorHex,
      size: selectedSize || undefined,
      storage: selectedStorage || undefined,
      price: currentPrice,
      originalPrice,
      quantity,
      maxStock: currentStock,
    };

    sessionStorage.setItem('bdneeds_buy_now', JSON.stringify([buyNowItem]));
    router.push('/checkout?flow=buy-now');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.shortDescription,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(language === 'bn' ? 'লিঙ্ক কপি করা হয়েছে!' : 'Product link copied to clipboard!');
    }
  };

  // Derive unique sizes and storages available
  const availableSizes = Array.from(
    new Set(product.variants.map((v) => v.size).filter(Boolean))
  ) as string[];

  const availableStorages = Array.from(
    new Set(product.variants.map((v) => v.storage).filter(Boolean))
  ) as string[];

  const allImages = Array.from(
    new Set([
      ...(selectedVariant?.images || []),
      ...product.images,
    ])
  );

  return (
    <div className="bg-[#ffffff]">
      {/* ======================================================== */}
      {/* MOBILE EXPERIENCE (lg:hidden) — Full-Bleed Product Image Stage */}
      {/* ======================================================== */}
      <div className="lg:hidden pb-24">
        {/* Mobile Full-Bleed Hero Image Card */}
        <div className="p-3">
          <div className="relative w-full h-[390px] sm:h-[430px] overflow-hidden rounded-[32px] bg-slate-900 border border-slate-200/50 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.12)]">
            {/* The Main Product Image covering the whole container */}
            <Image
              key={`full-bg-${activeImage}`}
              src={activeImage}
              alt={product.imageAlt?.trim() || `${product.name}${product.brand ? ` - ${product.brand}` : ''} price in Bangladesh`}
              fill
              priority
              className="object-cover object-center transform transition-all duration-500 scale-100 hover:scale-105"
              sizes="(max-width: 768px) 100vw, 600px"
            />

            {/* Gradient Overlays for high-contrast legible controls & typography */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 pointer-events-none" />

            {/* Top Bar with Frosted Glass Floating Buttons */}
            <div className="flex items-center justify-between p-4 z-30 relative">
              <button
                onClick={() => router.back()}
                className="w-11 h-11 rounded-2xl bg-black/35 hover:bg-black/55 backdrop-blur-xl border border-[#ffffff]/25 shadow-lg flex items-center justify-center text-[#ffffff] active:scale-90 transition-all"
                aria-label="Go Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`w-11 h-11 rounded-2xl backdrop-blur-xl border shadow-lg flex items-center justify-center transition-all active:scale-90 ${
                    isFavorite
                      ? 'bg-rose-500/90 text-[#ffffff] border-rose-400'
                      : 'bg-black/35 hover:bg-black/55 text-[#ffffff] border-[#ffffff]/25'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
                </button>

                <button
                  onClick={handleShare}
                  className="w-11 h-11 rounded-2xl bg-black/35 hover:bg-black/55 backdrop-blur-xl border border-[#ffffff]/25 shadow-lg flex items-center justify-center text-[#ffffff] active:scale-90 transition-all"
                  aria-label="Share Product"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Bottom Floating Title, Category & Dots inside the Hero Image Stage */}
            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between gap-3 pointer-events-none">
              <div className="space-y-1 max-w-[78%]">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#ffffff]/25 text-[#ffffff] backdrop-blur-md border border-[#ffffff]/30 shadow-xs">
                  {product.categoryName}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-[#ffffff] tracking-tight leading-tight drop-shadow-md">
                  {product.name}
                </h1>
                {product.brand && (
                  <span className="text-xs font-semibold text-slate-200 drop-shadow-xs block">
                    by {product.brand}
                  </span>
                )}
              </div>

              {/* Multi-Image Indicator Dots */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-1.5 pointer-events-auto bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-[#ffffff]/20">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        activeImage === img
                          ? 'w-5 bg-[#ffffff] shadow-xs'
                          : 'w-2 bg-[#ffffff]/40 hover:bg-[#ffffff]/70'
                      }`}
                      aria-label={`View image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Product Info Section */}
        <div className="px-5 pt-2 pb-6 space-y-5">
          {/* Natural Price & Rating Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50/80 border border-blue-100/70 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] uppercase font-black text-blue-600/80 tracking-wider block">
                {language === 'bn' ? 'মূল্য' : 'OFFICIAL PRICE'}
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-[#0B132B]">
                  {formatPrice(currentPrice)}
                </span>
                {originalPrice > currentPrice && (
                  <span className="text-xs sm:text-sm text-slate-400 line-through font-semibold">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 bg-[#ffffff]/90 px-2.5 py-1 rounded-full border border-slate-200/80 shadow-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-slate-800 font-extrabold text-xs">{product.rating}</span>
                <span className="text-slate-400 text-[10px]">({product.reviewCount})</span>
              </div>
              {originalPrice > currentPrice && (
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  {Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}% {language === 'bn' ? 'ছাড়' : 'OFF'}
                </span>
              )}
            </div>
          </div>

          {/* Description Card */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                {language === 'bn' ? 'বিবরণ' : 'Product Details'}
              </h2>
              {currentStock > 5 ? (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {t('inStock')} ({currentStock})
                </span>
              ) : currentStock > 0 ? (
                <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  {t('lowStockAlert')}
                </span>
              ) : (
                <span className="text-[11px] font-bold text-rose-600">{t('outOfStock')}</span>
              )}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {product.shortDescription}
            </p>
          </div>

          {/* Color Selection Cards (Natural Pebble Layout) */}
          {(() => {
            const colorVariants = product.variants?.filter((v) => (v.colorName && v.colorName.trim() !== '' && v.colorName.toLowerCase() !== 'standard') || (v.colorHex && v.colorHex.trim() !== '')) || [];
            if (colorVariants.length === 0) return null;
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900">
                    {t('color')}:{' '}
                    <span className="text-blue-600 font-bold">{selectedVariant?.colorName}</span>
                  </span>
                </div>
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                  {colorVariants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const thumb = v.images?.[0] || product.images[0];
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`relative w-18 h-18 rounded-2xl border-2 shrink-0 overflow-hidden bg-[#ffffff] transition-all p-1.5 flex flex-col items-center justify-between ${
                          isSelected
                            ? 'border-blue-600 ring-4 ring-blue-500/15 shadow-md scale-102'
                            : 'border-slate-200/80 hover:border-slate-300 opacity-85 hover:opacity-100'
                        }`}
                      >
                        <div className="relative w-full h-9 rounded-xl overflow-hidden bg-slate-50">
                          <Image
                            src={thumb}
                            alt={v.colorName}
                            fill
                            className="object-contain"
                            sizes="72px"
                          />
                        </div>
                        <div className="flex items-center gap-1 w-full justify-center">
                          <span
                            className="w-2 h-2 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: v.colorHex || '#e5e7eb' }}
                          />
                          <span className="text-[9px] font-extrabold text-slate-700 truncate">
                            {v.colorName}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Size Pills (Natural Rounded) */}
          {availableSizes.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-slate-900 block">
                {language === 'bn' ? 'সাইজ নির্বাচন করুন' : 'Select Size'}
              </span>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-11 px-4 py-2.5 rounded-2xl text-xs font-extrabold border transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-[#ffffff] shadow-sm ring-4 ring-blue-500/20 scale-102'
                          : 'border-slate-200 bg-[#ffffff] text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Storage Pills if applicable */}
          {availableStorages.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-slate-900 block">
                {t('storageSize')}
              </span>
              <div className="flex flex-wrap gap-2">
                {availableStorages.map((storage) => {
                  const isSelected = selectedStorage === storage;
                  return (
                    <button
                      key={storage}
                      onClick={() => setSelectedStorage(storage)}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold border transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-[#ffffff] shadow-sm ring-4 ring-blue-500/20 scale-102'
                          : 'border-slate-200 bg-[#ffffff] text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {storage}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          </div>
          {/* Row 1: Quantity Stepper & Buy Now */}
          <div className="flex items-center gap-2 pt-4 px-5">
            <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex-1">
              <span className="text-[10px] font-extrabold text-slate-700 ml-1">{t('quantity')}</span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-[#ffffff] shadow-xs p-0.5 ml-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-90 transition-all"
                  aria-label="Decrease"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-2 text-xs font-black text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-90 transition-all"
                  aria-label="Increase"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={currentStock <= 0}
              className="flex-1 h-12 rounded-2xl font-black text-sm flex items-center justify-center gap-1.5 bg-[#0059FF] hover:bg-[#004BE6] text-[#ffffff] shadow-md active:scale-95 transition-all disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{t('buyNow')}</span>
            </button>
          </div>

          {/* Row 2: Wishlist & Add to Bag */}
          <div className="flex items-center gap-2 pt-2 px-5">
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`w-12 h-12 rounded-2xl border transition-all flex items-center justify-center shrink-0 active:scale-90 shadow-sm ${
                isFavorite
                  ? 'border-rose-200 bg-rose-50 text-rose-600'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
              }`}
              aria-label="Wishlist"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-600 text-rose-600' : ''}`} />
            </button>

            <button
              onClick={handleAddToCart}
              disabled={currentStock <= 0}
              className={`flex-1 h-12 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all ${
                isAdded
                  ? 'bg-emerald-600 text-[#ffffff] shadow-emerald-600/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-[#ffffff]'
              } disabled:opacity-50`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 animate-in zoom-in-75" />
                  <span>{t('addedToBag')}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t('addToBag')}</span>
                </>
              )}
            </button>
          </div>

          {/* Row 3: Social Contact Buttons */}
          <div className="flex gap-2 pt-2 px-5">
            <a
              href="https://m.me/61589093341884"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-3 font-extrabold text-xs rounded-2xl transition-all shadow-sm flex items-center justify-center gap-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-[#ffffff]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 2C6.48 2 2 6.15 2 11.26c0 2.92 1.48 5.51 3.8 7.15v3.42c0 .24.26.4.47.28l3.18-1.74c.82.23 1.68.36 2.55.36 5.52 0 10-4.15 10-9.26S17.52 2 12 2zm1.09 11.9l-2.73-2.9-5.28 2.9 5.8-6.17 2.8 2.9 5.2-2.9-5.79 6.17z"/>
              </svg>
              <span className="truncate">Facebook</span>
            </a>
            <a
              href={`https://wa.me/8801811277828?text=I'm interested in ${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-3 font-extrabold text-xs rounded-2xl transition-all shadow-sm flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20BD5A] text-[#ffffff]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              <span className="truncate">WhatsApp</span>
            </a>
          </div>

        {/* Mobile Technical Information & Description */}
        <div className="pt-6 pb-4 space-y-4 px-5">
          {/* Mobile Anchor Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {product.features && product.features.length > 0 && (
              <button 
                onClick={() => document.getElementById('mobile-overview-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 whitespace-nowrap"
              >
                {t('overview')}
              </button>
            )}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <button 
                onClick={() => document.getElementById('mobile-specs-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 whitespace-nowrap"
              >
                {t('specifications')}
              </button>
            )}
            {product.description && (
              <button 
                onClick={() => document.getElementById('mobile-desc-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 whitespace-nowrap capitalize"
              >
                {t('description')}
              </button>
            )}
          </div>

          {/* Overview (Features) */}
          {product.features && product.features.length > 0 && (
            <div id="mobile-overview-section" className="border border-slate-200/70 rounded-3xl p-5 bg-slate-50/40 scroll-mt-24">
              <h3 className="text-sm font-bold text-[#0B132B] mb-3">{t('overview')}</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div id="mobile-specs-section" className="border border-slate-200/70 rounded-3xl p-5 bg-slate-50/40 scroll-mt-24">
              <h3 className="text-sm font-bold text-[#0B132B] mb-3">{t('specifications')}</h3>
              <div className="divide-y divide-slate-200 text-sm">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="py-2.5 flex justify-between gap-4">
                    <span className="text-slate-500">{key}</span>
                    <span className="font-semibold text-slate-800 text-right">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div id="mobile-desc-section" className="border border-slate-200/70 rounded-3xl p-5 bg-slate-50/40 scroll-mt-24">
              <h3 className="text-sm font-bold text-[#0B132B] mb-3 capitalize">{t('description')}</h3>
              <div 
                className="text-sm text-slate-600 leading-relaxed prose prose-sm prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* DESKTOP EXPERIENCE (hidden lg:block) — Organic Natural Layout */}
      {/* ======================================================== */}
      <div className="hidden lg:block">
        {/* Breadcrumb Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-slate-100 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              {t('home')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link
              href={`/category/${product.categoryId.replace('cat-', '')}`}
              className="hover:text-blue-600 transition-colors"
            >
              {product.categoryName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 font-semibold truncate max-w-xs">
              {product.name}
            </span>
          </div>
        </div>

        {/* Main Product Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Column: Image Gallery with Ambient Background Glow */}
            <div className="lg:col-span-7 flex flex-col gap-10">
              <div className="flex flex-col-reverse md:flex-row gap-4">
              {/* Thumbnails list */}
              {allImages.length > 1 && (
                <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar md:max-h-[560px] pb-2 md:pb-0">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                        activeImage === img
                          ? 'border-blue-600 shadow-md ring-4 ring-blue-500/15 scale-102'
                          : 'border-slate-200/80 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Stage View Image — Full-Bleed Cover Filling Entire Container */}
              <div className="relative flex-1 aspect-square rounded-[32px] overflow-hidden bg-slate-900 border border-slate-200/60 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.12)] group">
                <Image
                  key={`desktop-img-${activeImage}`}
                  src={activeImage}
                  alt={product.imageAlt?.trim() || `${product.name}${product.brand ? ` - ${product.brand}` : ''} price in Bangladesh`}
                  fill
                  priority
                  className="object-cover object-center transform transition-all duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 700px"
                />

                {/* Subtle vignette/gradient at top & bottom for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none opacity-60 group-hover:opacity-40 transition-opacity" />

                {/* Multi-Image Counter Pill at Bottom Right if multiple images exist */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 right-4 z-20 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-[#ffffff]/20 text-[#ffffff] text-xs font-bold shadow-md">
                    {allImages.indexOf(activeImage) + 1} / {allImages.length}
                  </div>
                )}
              </div>
            </div>

            {/* Technical Information & Description */}
            <div className="space-y-6">
              {/* Navigation Buttons */}
              <div className="flex border-b border-slate-200 text-xs font-bold mb-6 pb-2">
                {product.features && product.features.length > 0 && (
                  <button
                    onClick={() => {
                      document.getElementById('overview-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className="mr-6 text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    {t('overview')}
                  </button>
                )}
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <button
                    onClick={() => {
                      document.getElementById('specs-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className="mr-6 text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    {t('specifications')}
                  </button>
                )}
                {product.description && (
                  <button
                    onClick={() => {
                      document.getElementById('desc-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className="text-slate-500 hover:text-blue-600 transition-colors capitalize"
                  >
                    {t('description')}
                  </button>
                )}
              </div>

              {/* Overview (Features) */}
              {product.features && product.features.length > 0 && (
                <div id="overview-section" className="border border-slate-200/70 rounded-3xl p-6 bg-slate-50/40">
                  <h3 className="text-sm font-bold text-[#0B132B] mb-3">{t('overview')}</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {product.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div id="specs-section" className="border border-slate-200/70 rounded-3xl p-6 bg-slate-50/40">
                  <h3 className="text-sm font-bold text-[#0B132B] mb-3">{t('specifications')}</h3>
                  <div className="divide-y divide-slate-200 text-sm">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key} className="py-2.5 flex justify-between gap-4">
                        <span className="text-slate-500">{key}</span>
                        <span className="font-semibold text-slate-800 text-right">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div id="desc-section" className="border border-slate-200/70 rounded-3xl p-6 bg-slate-50/40">
                  <h3 className="text-sm font-bold text-[#0B132B] mb-3 capitalize">{t('description')}</h3>
                  <div 
                    className="text-sm text-slate-600 leading-relaxed prose prose-sm prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Product Specs, Variants, Purchase Panel */}
          <div className="lg:col-span-5 space-y-6">
              <div>
                {/* Brand & Stock Status */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
                    {product.brand || product.categoryName}
                  </span>

                  {currentStock > 5 ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {t('inStock')} ({currentStock})
                    </span>
                  ) : currentStock > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      {t('lowStockAlert')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      {t('outOfStock')}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-black text-[#0B132B] tracking-tight leading-snug">
                  {product.name}
                </h1>

                {/* Ratings & SKU */}
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                  <a
                    href="#reviews-section"
                    className="flex items-center gap-1.5 text-amber-500 font-bold hover:underline"
                  >
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{product.rating}</span>
                    <span className="text-slate-400 font-normal">
                      ({product.reviewCount} {t('reviewsCount')})
                    </span>
                  </a>
                  <span>•</span>
                  <span>SKU: {currentSku}</span>
                </div>

                {/* Price Row in Natural Card */}
                <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-blue-50/30 to-indigo-50/30 border border-slate-200/70 flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-[#0B132B]">
                    {formatPrice(currentPrice)}
                  </span>
                  {originalPrice > currentPrice && (
                    <>
                      <span className="text-base text-slate-400 line-through font-medium">
                        {formatPrice(originalPrice)}
                      </span>
                      <span className="ml-auto text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                        {Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}% {language === 'bn' ? 'ছাড়' : 'OFF'}
                      </span>
                    </>
                  )}
                </div>

                {/* Short Description */}
                <p className="mt-5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {product.shortDescription}
                </p>

                {/* Color Variants Switcher */}
                {(() => {
                const colorVariants = product.variants?.filter((v) => (v.colorName && v.colorName.trim() !== '' && v.colorName.toLowerCase() !== 'standard') || (v.colorHex && v.colorHex.trim() !== '')) || [];
                if (colorVariants.length === 0) return null;
                return (
                  <div>
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-xs mb-2.5">
                      <span className="font-extrabold text-slate-800">
                        {t('color')}:{' '}
                        <span className="text-blue-600 font-semibold">
                          {selectedVariant?.colorName}
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {colorVariants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all ${
                            selectedVariant?.id === v.id
                              ? 'border-blue-600 bg-blue-50/60 text-blue-900 ring-4 ring-blue-500/15'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-[#ffffff]'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                            style={{ backgroundColor: v.colorHex || '#e5e7eb' }}
                          />
                          <span>{v.colorName}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                    </div>
                  );
                })()}

                {/* Size Selector if available */}
                {availableSizes.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-xs mb-2.5">
                      <span className="font-extrabold text-slate-800">{language === 'bn' ? 'সাইজ' : 'Select Size'}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold border transition-all ${
                            selectedSize === size
                              ? 'border-blue-600 bg-blue-600 text-[#ffffff] shadow-sm ring-4 ring-blue-500/20'
                              : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-[#ffffff]'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Storage Selector if available */}
                {availableStorages.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-xs mb-2.5">
                      <span className="font-extrabold text-slate-800">{t('storageSize')}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableStorages.map((storage) => (
                        <button
                          key={storage}
                          onClick={() => setSelectedStorage(storage)}
                          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold border transition-all ${
                            selectedStorage === storage
                              ? 'border-blue-600 bg-blue-600 text-[#ffffff] shadow-sm ring-4 ring-blue-500/20'
                              : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-[#ffffff]'
                          }`}
                        >
                          {storage}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Stepper */}
                <div className="mt-6 flex items-center gap-4">
                  <span className="text-xs font-extrabold text-slate-800">{t('quantity')}</span>
                  <div className="flex items-center border border-slate-200 rounded-2xl bg-slate-50 p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-all active:scale-90"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 text-xs font-black text-slate-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-all active:scale-90"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* CTAs: Buy Now (Primary), Add to Cart, Wishlist */}
                <div className="mt-8 space-y-3">
                  <button
                    onClick={handleBuyNow}
                    disabled={currentStock <= 0}
                    className="w-full py-4 px-6 bg-[#0059FF] hover:bg-[#004BE6] disabled:opacity-50 text-[#ffffff] font-black text-base rounded-2xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2.5"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {t('buyNow')}
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={currentStock <= 0}
                      className={`flex-1 py-3.5 px-6 font-extrabold text-sm rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 ${
                        isAdded
                          ? 'bg-emerald-600 text-[#ffffff]'
                          : 'bg-slate-900 hover:bg-slate-800 text-[#ffffff]'
                      } disabled:opacity-50`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4 animate-in zoom-in-75" />
                          {t('addedToBag')}
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          {t('addToBag')}
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-center ${
                        isFavorite
                          ? 'border-rose-300 bg-rose-50 text-rose-600 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-[#ffffff]'
                      }`}
                      aria-label="Add to Wishlist"
                    >
                      <Heart
                        className={`w-5 h-5 ${isFavorite ? 'fill-rose-600' : ''}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Social Contact Buttons */}
                <div className="flex gap-3 mt-4">
                  <a
                    href="https://m.me/61589093341884"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-4 font-extrabold text-sm rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166FE5] text-[#ffffff]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M12 2C6.48 2 2 6.15 2 11.26c0 2.92 1.48 5.51 3.8 7.15v3.42c0 .24.26.4.47.28l3.18-1.74c.82.23 1.68.36 2.55.36 5.52 0 10-4.15 10-9.26S17.52 2 12 2zm1.09 11.9l-2.73-2.9-5.28 2.9 5.8-6.17 2.8 2.9 5.2-2.9-5.79 6.17z"/>
                    </svg>
                    <span className="truncate">Message on Facebook</span>
                  </a>
                  <a
                    href={`https://wa.me/8801811277828?text=I'm interested in ${encodeURIComponent(product.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-4 font-extrabold text-sm rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-[#ffffff]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                    <span className="truncate">Message on WhatsApp</span>
                  </a>
                </div>

                {/* Featured Products (Moved to right column) */}
                {relatedProducts.length > 0 && (
                  <div className="mt-10 pt-8 border-t border-slate-200/70">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-black text-[#0B132B]">
                        {t('featured')}
                      </h3>
                      <Link
                        href={`/category/${product.categoryId.replace('cat-', '')}`}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        {t('viewAllResults')} →
                      </Link>
                    </div>
                    <div className="flex flex-col gap-4">
                      {relatedProducts.slice(0, 4).map((p) => (
                        <Link href={`/product/${p.slug}`} key={p.id} className="flex gap-4 items-center group bg-slate-50/50 p-2 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                            <Image src={p.images[0]} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                          </div>
                          <div className="flex flex-col flex-1">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">{p.brand}</span>
                            <h4 className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">{p.name}</h4>
                            <div className="mt-1.5 font-black text-sm text-[#0B132B]">
                              BDT {p.basePrice}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Verified Reviews Section */}
      <ReviewSection
        productId={product.id}
        productName={product.name}
        initialReviews={reviews}
        rating={product.rating}
        reviewCount={product.reviewCount}
      />



      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="py-16 bg-[#ffffff] border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-lg sm:text-xl font-black text-[#0B132B] mb-6">
              {t('bestSellers')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {recentlyViewed.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
