'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Edit,
  Trash2,
  ExternalLink,
  Star,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

export default function AdminProductsPage() {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = () => {
    setLoading(true);
    fetch('/api/products?admin=true')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    fetch('/api/categories?admin=true')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(console.error);
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete product "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
      }
    } catch (e) {
      console.error('Delete error', e);
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());

    const matchesCat = !categoryFilter || p.categoryId === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B132B]">
            {t('adminProductCatalog')}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t('adminProductCatalogSubtitle')}
          </p>
        </div>

        {isAdmin && (
          <Link
            href="/admin/products/new"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-[#ffffff] rounded-xl text-xs font-bold transition-colors flex items-center gap-2 self-start sm:self-auto shadow-xs"
          >
            <Plus className="w-4 h-4" />
            {t('adminAddNewProduct')}
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#ffffff] rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-semibold">{t('department')}:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="">{t('allCategories')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#ffffff] rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4 pl-6">{t('adminProducts')}</th>
                <th className="p-4">{t('department')}</th>
                <th className="p-4">{t('adminBasePrice')}</th>
                <th className="p-4">{t('adminVariants')}</th>
                <th className="p-4">{t('adminStock')}</th>
                <th className="p-4">{t('adminSales')}</th>
                <th className="p-4">{t('adminStatus')}</th>
                <th className="p-4 pr-6 text-right">{t('adminActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    Loading products...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    No products match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          <Image
                            src={prod.images[0]}
                            alt={prod.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1 max-w-xs">
                            {prod.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {prod.brand} • SKU: {prod.sku}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-600">
                      {prod.categoryName}
                    </td>
                    <td className="p-4 font-bold text-[#0B132B]">
                      {formatPrice(prod.basePrice)}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-bold text-[11px]">
                        {prod.variants?.length || 0} Variants
                      </span>
                    </td>
                    <td className="p-4">
                      {prod.stock > 10 ? (
                        <span className="text-emerald-600 font-bold">{prod.stock} {t('adminUnits')}</span>
                      ) : prod.stock > 0 ? (
                        <span className="text-amber-600 font-bold">{prod.stock} {t('adminLeft')}</span>
                      ) : (
                        <span className="text-rose-600 font-bold">{t('adminOutOfStock')}</span>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-slate-800">
                      {prod.salesCount || 0}
                    </td>
                    <td className="p-4">
                      {prod.isPublished ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {t('adminPublished')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 text-[11px] font-bold">
                          <XCircle className="w-3.5 h-3.5" /> {t('adminDraft')}
                        </span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/product/${prod.slug}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                          title="View on storefront"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        {isAdmin && (
                          <>
                            <Link
                              href={`/admin/products/${prod.id}`}
                              className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                              title="Edit product"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(prod.id, prod.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
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
