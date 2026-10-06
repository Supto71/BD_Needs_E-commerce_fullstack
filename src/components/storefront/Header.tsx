'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  Heart,
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Flame,
  Clock,
  LogOut,
  ShieldAlert,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage, LanguageSwitcher } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/utils';
import { Product, Category } from '@/types';

export default function Header() {
  const router = useRouter();
  const { toggleCart, totalItems } = useCart();
  const { totalWishlist } = useWishlist();
  const { user, isAdmin, logout } = useAuth();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Fetch categories for mega menu
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(() => {});
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(() => {
      fetch(`/api/products?search=${encodeURIComponent(searchQuery.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setSearchResults(data.slice(0, 5));
          }
        })
        .catch(() => {})
        .finally(() => setIsSearching(false));
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#ffffff]/95 backdrop-blur-md border-b border-slate-100 transition-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          {/* Mobile Menu Trigger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Brand Logo */}
            <Link href="/" className="flex items-center group">
              <Image 
                src="/logomain.png" 
                alt="BdNeeds Logo" 
                width={160} 
                height={48} 
                className="object-contain h-10 sm:h-12 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            <Link
              href="/"
              className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 rounded-lg transition-colors"
            >
              {t('home')}
            </Link>
            <Link
              href="/shop"
              className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 rounded-lg transition-colors"
            >
              {t('shop')}
            </Link>

            {/* Mega Menu Trigger */}
            <div
              className="relative"
              onMouseEnter={() => setShowMegaMenu(true)}
              onMouseLeave={() => setShowMegaMenu(false)}
            >
              <button className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 rounded-lg transition-colors">
                {t('categories')}
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showMegaMenu ? 'rotate-180 text-blue-600' : 'text-slate-400'
                  }`}
                />
              </button>

              {/* Mega Menu Dropdown */}
              {showMegaMenu && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[720px] xl:w-[840px] bg-[#ffffff] rounded-2xl shadow-2xl border border-slate-100 p-8 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        onClick={() => setShowMegaMenu(false)}
                        className="group flex flex-col items-start p-2 -m-2 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors whitespace-nowrap overflow-hidden text-ellipsis w-full">
                          {t(cat.slug as any, cat.name)}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/best-sellers"
              className="flex items-center gap-1 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 rounded-lg transition-colors"
            >
              <Flame className="w-4 h-4 text-orange-500" />
              {t('bestSellers')}
            </Link>
            <Link
              href="/new-arrivals"
              className="flex items-center gap-1 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 rounded-lg transition-colors"
            >
              <Clock className="w-4 h-4 text-emerald-500" />
              {t('newArrivals')}
            </Link>
          </nav>

          {/* Search Bar with Live Suggestions */}
          <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-[#ffffff] border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-slate-800 placeholder-slate-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </form>

            {/* Live Search Autocomplete Dropdown */}
            {showSearchDropdown && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#ffffff] rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3 border-b border-slate-100 flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  <span>{t('shop')}</span>
                  {isSearching && <span className="animate-pulse">{t('searching')}</span>}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 p-1">
                  {searchResults.length === 0 && !isSearching ? (
                    <div className="p-6 text-center text-sm text-slate-500">
                      {t('noResultsFound')} &ldquo;{searchQuery}&rdquo;
                    </div>
                  ) : (
                    searchResults.map((prod) => (
                      <Link
                        key={prod.id}
                        href={`/product/${prod.slug}`}
                        onClick={() => setShowSearchDropdown(false)}
                        className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <div className="relative w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                          <Image
                            src={prod.images[0]}
                            alt={prod.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-[#0B132B] truncate">
                            {prod.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {prod.categoryName} • {prod.brand}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-[#0B132B]">
                            {formatPrice(prod.basePrice)}
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>

                <Link
                  href={`/search?q=${encodeURIComponent(searchQuery)}`}
                  onClick={() => setShowSearchDropdown(false)}
                  className="block p-3 text-center text-xs font-semibold text-blue-600 bg-slate-50 hover:bg-blue-50 transition-colors border-t border-slate-100"
                >
                  {t('viewAllResults')} &ldquo;{searchQuery}&rdquo; →
                </Link>
              </div>
            )}
          </div>

          {/* Right Action Icons (Wishlist, Cart, User) */}
          <div className="flex items-center space-x-1 sm:space-x-2">

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {totalWishlist > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-[#ffffff] text-[10px] font-bold flex items-center justify-center animate-in zoom-in-50">
                  {totalWishlist}
                </span>
              )}
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={toggleCart}
              className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-[#ffffff] text-[10px] font-bold flex items-center justify-center animate-in zoom-in-50">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Profile / Menu */}
            <div ref={userRef} className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-1.5 p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
                aria-label="Account menu"
              >
                {user?.avatarUrl ? (
                  <div className="relative w-7 h-7 rounded-full overflow-hidden border border-slate-200">
                    <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-[#ffffff] rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-400 font-medium">{t('signedInAs')}</p>
                        <p className="text-sm font-bold text-[#0B132B] truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>



                      <Link
                        href="/account"
                        onClick={() => setShowUserDropdown(false)}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        {t('myProfile')}
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setShowUserDropdown(false)}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        {t('myOrders')}
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setShowUserDropdown(false)}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        {t('wishlist')}
                      </Link>
                      <Link
                        href="/track-order"
                        onClick={() => setShowUserDropdown(false)}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        {t('trackOrder')}
                      </Link>

                      <div className="border-t border-slate-100 my-1" />
                      <button
                        onClick={() => {
                          logout();
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('logout')}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="p-3 text-center border-b border-slate-100">
                        <p className="text-xs text-slate-500 mb-2">{t('signInPrompt')}</p>
                        <Link
                          href="/login"
                          onClick={() => setShowUserDropdown(false)}
                          className="block w-full py-2 px-3 bg-[#0B132B] hover:bg-blue-600 text-[#ffffff] rounded-lg text-xs font-semibold transition-colors"
                        >
                          {t('signIn')}
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setShowUserDropdown(false)}
                          className="block mt-2 text-xs font-semibold text-blue-600 hover:underline"
                        >
                          {t('register')}
                        </Link>
                      </div>

                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Compact Mobile Search Bar */}
        <div className="md:hidden pb-3 pt-0.5">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-[#ffffff] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-slate-800 placeholder-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-[#ffffff] px-4 pt-3 pb-6 space-y-3">




          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 rounded-lg"
            >
              {t('home')}
            </Link>
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 rounded-lg"
            >
              {t('shop')}
            </Link>
            <div className="py-2">
              <span className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                {t('categories')}
              </span>
              <div className="grid grid-cols-2 gap-2 mt-2 px-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-medium text-slate-700 hover:text-blue-600 p-1.5 rounded-md hover:bg-slate-50 truncate"
                  >
                    {t(cat.slug as any, cat.name)}
                  </Link>
                ))}
              </div>
            </div>


          </div>
        </div>
      )}
    </header>
  );
}
