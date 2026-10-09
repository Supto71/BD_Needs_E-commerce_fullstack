'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { Product } from '@/types';
import { Flame, Sparkles, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CurationsPage() {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products?admin=true'),
        fetch('/api/categories?admin=true')
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      
      if (Array.isArray(prodData)) setProducts(prodData);
      if (Array.isArray(catData)) setCategories(catData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleStatus = async (product: Product, field: 'isBestSeller' | 'isNew') => {
    const newValue = !product[field];
    
    // Optimistic update
    setProducts((prev) => 
      prev.map((p) => (p.id === product.id ? { ...p, [field]: newValue } : p))
    );

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: newValue }),
      });

      if (!res.ok) {
        throw new Error('Failed to update');
      }
    } catch (e) {
      console.error(e);
      // Revert optimistic update
      setProducts((prev) => 
        prev.map((p) => (p.id === product.id ? { ...p, [field]: !newValue } : p))
      );
      alert('Failed to update product. Please try again.');
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch = search ? (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())) : true;
    const matchCat = selectedCategory ? p.categoryId === selectedCategory : true;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0B132B]">
          {t('adminCurations')}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Select which products appear in the Best Sellers and New Arrivals sections.
        </p>
      </div>

      <div className="bg-[#ffffff] rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('adminFilterPlaceholder')}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-medium cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                <th className="pb-3 pl-2 font-medium">Product</th>
                <th className="pb-3 font-medium text-center">Best Seller</th>
                <th className="pb-3 font-medium text-center">New Arrival</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">Loading products...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">No products found.</td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pl-2 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden relative shrink-0">
                        {product.images?.[0] ? (
                          <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="40px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">No img</div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 truncate max-w-xs">{product.name}</div>
                        <div className="text-[10px] text-slate-500">{product.sku}</div>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => toggleStatus(product, 'isBestSeller')}
                        disabled={!isAdmin}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                          product.isBestSeller ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'
                        } ${isAdmin ? 'hover:bg-slate-200 cursor-pointer' : 'opacity-70 cursor-not-allowed'}`}
                        title="Toggle Best Seller"
                      >
                        <Flame className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => toggleStatus(product, 'isNew')}
                        disabled={!isAdmin}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                          product.isNew ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                        } ${isAdmin ? 'hover:bg-slate-200 cursor-pointer' : 'opacity-70 cursor-not-allowed'}`}
                        title="Toggle New Arrival"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
