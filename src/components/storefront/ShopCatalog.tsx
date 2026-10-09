'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Star,
  Search,
  RotateCcw,
} from 'lucide-react';
import { Product, Category } from '@/types';
import ProductCard from './ProductCard';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

interface ShopCatalogProps {
  initialProducts: Product[];
  categories: Category[];
  initialCategorySlug?: string;
  initialSearchQuery?: string;
  title?: string;
  subtitle?: string;
}

export default function ShopCatalog({
  initialProducts,
  categories,
  initialCategorySlug,
  initialSearchQuery,
  title,
  subtitle,
}: ShopCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  // State
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategorySlug || searchParams.get('category') || ''
  );
  const [selectedBrand, setSelectedBrand] = useState<string>(
    searchParams.get('brand') || ''
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(
    searchParams.get('subcategory') || ''
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery || '');
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get('sort') || 'featured'
  );
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Derive unique brands and colors
  const brands = useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach((p) => p.brand && set.add(p.brand));
    return Array.from(set);
  }, [initialProducts]);

  const subcategories = useMemo(() => {
    if (selectedCategory) {
      const cat = categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory);
      if (cat?.subcategories && cat.subcategories.length > 0) {
        return cat.subcategories.map((s) => s.name);
      }
      return [];
    }
    const set = new Set<string>();
    categories.forEach((c) => {
      c.subcategories?.forEach((s) => {
        if (s.isFeatured) set.add(s.name);
      });
    });
    return Array.from(set);
  }, [categories, selectedCategory]);

  const globalFeaturedSubcategories = useMemo(() => {
    if (selectedCategory) return [];
    const set = new Set<string>();
    categories.forEach((c) => {
      c.subcategories?.forEach((s) => {
        if (s.isFeatured) set.add(s.name);
      });
    });
    return Array.from(set);
  }, [categories, selectedCategory]);

  const colors = useMemo(() => {
    const map = new Map<string, string>();
    initialProducts.forEach((p) => {
      p.variants?.forEach((v) => {
        if (v.colorName && v.colorHex && !map.has(v.colorName)) {
          map.set(v.colorName, v.colorHex);
        }
      });
    });
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [initialProducts]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let list = [...initialProducts];

    if (searchQuery.trim() && searchQuery.trim().toLowerCase() !== initialSearchQuery?.toLowerCase().trim()) {
      const originalTerms = searchQuery.toLowerCase().trim().split(/\s+/);
      const synonyms: Record<string, string[]> = {
        'clothes': ['apparel', 'fashion', 't-shirt', 'shirt', 'pant', 'wear'],
        'cloth': ['apparel', 'fashion', 't-shirt', 'shirt', 'pant', 'wear'],
        'clothing': ['apparel', 'fashion', 't-shirt', 'shirt', 'pant', 'wear'],
        'gadget': ['electronic', 'smart', 'device', 'audio'],
        'gadgets': ['electronic', 'smart', 'device', 'audio'],
        'skin': ['skincare', 'serum', 'beauty', 'grooming', 'lotion'],
        'shoe': ['sneaker', 'footwear', 'boot', 'runner'],
        'shoes': ['sneaker', 'footwear', 'boot', 'runner'],
        'pc': ['computer', 'laptop', 'desktop', 'workstation'],
        'computer': ['pc', 'laptop', 'desktop', 'workstation'],
        'phone': ['smartphone', 'mobile', 'cellphone'],
        'bag': ['briefcase', 'backpack', 'tote', 'luggage', 'pouch'],
        'bags': ['briefcase', 'backpack', 'tote', 'luggage', 'pouch'],
      };

      const termGroups = originalTerms.map(term => {
        const group = [term];
        if (synonyms[term]) group.push(...synonyms[term]);
        return group.map(t => {
          let stem = t;
          if (stem.length > 3) {
            if (stem.endsWith('ies')) stem = stem.slice(0, -3) + 'y';
            else if (stem.endsWith('es') && !stem.endsWith('shoes')) stem = stem.slice(0, -2);
            else if (stem.endsWith('s') && !stem.endsWith('ss')) stem = stem.slice(0, -1);
            else if (stem.endsWith('ing')) stem = stem.slice(0, -3);
            else if (stem.endsWith('e')) stem = stem.slice(0, -1);
          }
          return stem.length < 3 ? t : stem;
        });
      });

      list = list.filter((p) => {
        return termGroups.every(groupStems => 
          groupStems.some(stem =>
            p.name.toLowerCase().includes(stem) ||
            p.brand.toLowerCase().includes(stem) ||
            p.categoryName.toLowerCase().includes(stem) ||
            (p.shortDescription && p.shortDescription.toLowerCase().includes(stem)) ||
            p.tags.some((t) => t.toLowerCase().includes(stem))
          )
        );
      });
    }

    if (selectedCategory) {
      list = list.filter(
        (p) =>
          p.categoryId === selectedCategory ||
          categories.find((c) => c.slug === selectedCategory)?.id === p.categoryId
      );
    }

    if (selectedBrand) {
      list = list.filter((p) => p.brand === selectedBrand);
    }

    if (selectedSubcategory) {
      list = list.filter((p) => p.subcategoryName === selectedSubcategory);
    }

    list = list.filter(
      (p) => p.basePrice >= priceRange[0] && p.basePrice <= priceRange[1]
    );

    if (minRating > 0) {
      list = list.filter((p) => p.rating >= minRating);
    }

    if (inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }

    if (selectedColor) {
      list = list.filter((p) =>
        p.variants.some((v) =>
          v.colorName.toLowerCase().includes(selectedColor.toLowerCase())
        )
      );
    }

    // Sort
    switch (sortBy) {
      case 'best-selling':
        list.sort((a, b) => b.salesCount - a.salesCount);
        break;
      case 'newest':
        list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'price-low-high':
        list.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price-high-low':
        list.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'featured':
      default:
        list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return list;
  }, [
    initialProducts,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    selectedBrand,
    priceRange,
    minRating,
    inStockOnly,
    selectedColor,
    sortBy,
    categories,
  ]);

  const resetFilters = () => {
    if (initialCategorySlug) {
      setSelectedCategory(initialCategorySlug);
    } else {
      setSelectedCategory('');
    }
    setSelectedSubcategory('');
    setSelectedBrand('');
    setPriceRange([0, 200000]);
    setMinRating(0);
    setInStockOnly(false);
    setSelectedColor('');
    setSearchQuery('');
    setSortBy('featured');
    if (searchParams.toString()) {
      router.push(window.location.pathname);
    }
  };

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    (selectedSubcategory ? 1 : 0) +
    (selectedBrand ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 200000 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (selectedColor ? 1 : 0) +
    (searchQuery ? 1 : 0);

  return (
    <div className="bg-[#ffffff] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header & Context Title */}
        <div className="pb-8 border-b border-slate-100">
          <h1 className="text-3xl sm:text-4xl font-black text-[#0B132B] tracking-tight">
            {title || t('allProducts')}
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            {subtitle || t('exploreDepartmentsDesc')}
          </p>

          {/* Subcategory Cards */}
          {subcategories.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5 sm:gap-3">
              <button
                onClick={() => setSelectedSubcategory('')}
                className={`px-2.5 py-1 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-bold border transition-all ${
                  !selectedSubcategory
                    ? 'bg-[#0B132B] text-[#ffffff] border-[#0B132B] shadow-sm sm:shadow-md'
                    : 'bg-[#ffffff] text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                All Products
              </button>
              {subcategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubcategory(sub)}
                  className={`px-2.5 py-1 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-bold border transition-all ${
                    selectedSubcategory === sub
                      ? 'bg-[#0B132B] text-[#ffffff] border-[#0B132B] shadow-sm sm:shadow-md'
                      : 'bg-[#ffffff] text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls Bar (Mobile Filters Button, Count, Sorting) */}
        <div className="py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile Filter Drawer Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              {t('filterBy')}
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-[#ffffff] text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Results Counter */}
            <span className="text-xs text-slate-500 font-medium">
              {t('showingResults')} <strong className="text-slate-900">{filteredProducts.length}</strong> {t('productsCount')}
            </span>
          </div>

          {/* Sort Selector Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
              {t('sortBy')}:
            </span>
            <div className="relative inline-block text-left">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
              >
                <option value="featured">{t('sortFeatured')}</option>
                <option value="best-selling">{t('bestsellerRank')}</option>
                <option value="newest">{t('sortNewest')}</option>
                <option value="price-low-high">{t('sortPriceLowHigh')}</option>
                <option value="price-high-low">{t('sortPriceHighLow')}</option>
                <option value="rating">{t('sortRating')}</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active Filters Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 py-4">
            <span className="text-xs text-slate-400 font-semibold mr-1">Active:</span>

            {selectedCategory && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                {categories.find((c) => c.id === selectedCategory || c.slug === selectedCategory)?.name || 'Category'}
                <button onClick={() => {
                  if (initialCategorySlug) {
                    router.push('/shop');
                  } else {
                    setSelectedCategory('');
                  }
                }}>
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                </button>
              </span>
            )}

            {selectedBrand && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                Brand: {selectedBrand}
                <button onClick={() => setSelectedBrand('')}>
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                </button>
              </span>
            )}

            {selectedSubcategory && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                {selectedSubcategory}
                <button onClick={() => setSelectedSubcategory('')}>
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                </button>
              </span>
            )}

            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                {t('inStockOnly')}
                <button onClick={() => setInStockOnly(false)}>
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                </button>
              </span>
            )}

            {(activeFilterCount > (selectedCategory && selectedCategory === initialCategorySlug ? 1 : 0)) && (
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 ml-2"
              >
                <RotateCcw className="w-3 h-3" /> {t('resetFilters')}
              </button>
            )}
          </div>
        )}

        {/* Global Featured Subcategories (Top of Shop Page) */}
        {!selectedCategory && globalFeaturedSubcategories.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-4 pt-2 border-b border-slate-100">
            {globalFeaturedSubcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(selectedSubcategory === sub ? '' : sub)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  selectedSubcategory === sub
                    ? 'bg-blue-600 text-[#ffffff] shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* Main Layout: Sidebar Filters + Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-4">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block space-y-8 pr-4">
            {/* Search within results */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                {t('searchPlaceholder')}
              </h4>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by keyword..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-800"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                {t('categories')}
              </h4>
              <div className="space-y-1.5">
                <button
                  onClick={() => router.push('/shop')}
                  className={`w-full flex items-center justify-between text-xs py-1.5 px-2 rounded-md transition-colors ${
                    !selectedCategory && !initialCategorySlug
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{t('allCategories')}</span>
                  <span className="text-slate-400"></span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => router.push(`/category/${cat.slug}`)}
                    className={`w-full flex items-center justify-between text-xs py-1.5 px-2 rounded-md transition-colors ${
                      selectedCategory === cat.id || selectedCategory === cat.slug || initialCategorySlug === cat.id || initialCategorySlug === cat.slug
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="text-slate-400">{cat.productCount}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                {t('priceRange')}
              </h4>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="200000"
                  step="500"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
              </div>
            </div>

            {/* Subcategories */}
            {subcategories.length > 0 && selectedCategory && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Sub-Categories
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {subcategories.map((sub) => (
                    <label
                      key={sub}
                      className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer py-1"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSubcategory === sub}
                        onChange={() =>
                          setSelectedSubcategory(selectedSubcategory === sub ? '' : sub)
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{sub}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Brands */}
            {brands.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Brand
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {brands.map((brand) => (
                    <label
                      key={brand}
                      className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer py-1"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBrand === brand}
                        onChange={() =>
                          setSelectedBrand(selectedBrand === brand ? '' : brand)
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* In Stock Only */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center justify-between text-xs font-bold text-slate-700 cursor-pointer">
                <span>{t('inStockOnly')}</span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
              </label>
            </div>
          </div>

          {/* Products Grid Area */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-slate-100 p-8">
                <div className="w-16 h-16 rounded-full bg-[#ffffff] shadow-sm flex items-center justify-center text-slate-400 mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#0B132B] mb-1">
                  {t('noResultsFound')}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                  Try adjusting your keywords, price filters, or category selections.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-[#0B132B] text-[#ffffff] text-xs font-bold rounded-xl hover:bg-blue-600 transition-colors"
                >
                  {t('resetFilters')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex bg-slate-900/50 backdrop-blur-sm transition-opacity lg:hidden">
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-[#ffffff] py-4 pb-12 shadow-xl animate-in slide-in-from-right-full duration-300">
            <div className="flex items-center justify-between px-4 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-[#0B132B]">{t('filterBy')}</h2>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Filters */}
            <div className="mt-4 px-4 space-y-8">
              {/* Search */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  {t('searchPlaceholder')}
                </h4>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter by keyword..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-800"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  {t('categories')}
                </h4>
                <div className="space-y-1.5">
                  <button
                    onClick={() => router.push('/shop')}
                    className={`w-full flex items-center justify-between text-xs py-2 px-3 rounded-md transition-colors ${
                      !selectedCategory && !initialCategorySlug
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 border border-slate-100'
                    }`}
                  >
                    <span>{t('allCategories')}</span>
                    <span className="text-slate-400"></span>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setMobileFilterOpen(false);
                        router.push(`/category/${cat.slug}`);
                      }}
                      className={`w-full flex items-center justify-between text-xs py-2 px-3 rounded-md transition-colors ${
                        selectedCategory === cat.id || selectedCategory === cat.slug || initialCategorySlug === cat.id || initialCategorySlug === cat.slug
                          ? 'bg-blue-50 text-blue-600 font-bold'
                          : 'text-slate-600 hover:bg-slate-50 border border-slate-100'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-slate-400">{cat.productCount}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  {t('priceRange')}
                </h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>
              </div>

              {/* Subcategories */}
              {subcategories.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Sub-Categories
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {subcategories.map((sub) => (
                      <label
                        key={sub}
                        className="flex items-center gap-3 text-sm text-slate-600 hover:text-slate-900 cursor-pointer py-1"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSubcategory === sub}
                          onChange={() =>
                            setSelectedSubcategory(selectedSubcategory === sub ? '' : sub)
                          }
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span>{sub}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Brands */}
              {brands.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Brand
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {brands.map((brand) => (
                      <label
                        key={brand}
                        className="flex items-center gap-3 text-sm text-slate-600 hover:text-slate-900 cursor-pointer py-1"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBrand === brand}
                          onChange={() =>
                            setSelectedBrand(selectedBrand === brand ? '' : brand)
                          }
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span>{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* In Stock Only */}
              <div className="pt-4 border-t border-slate-100">
                <label className="flex items-center justify-between text-sm font-bold text-slate-700 cursor-pointer">
                  <span>{t('inStockOnly')}</span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
                  />
                </label>
              </div>
            </div>
            
            <div className="mt-8 px-4">
               <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-3 bg-[#0B132B] hover:bg-blue-600 text-[#ffffff] font-bold rounded-xl transition-colors shadow-md text-sm"
                >
                  View Results ({filteredProducts.length})
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
