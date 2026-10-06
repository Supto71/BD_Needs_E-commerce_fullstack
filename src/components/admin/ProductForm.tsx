'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Save,
  Plus,
  Trash2,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Layers,
  Info,
} from 'lucide-react';
import { Product, ProductVariant } from '@/types';

interface VariantSpec {
  key: string;
  val: string;
}

interface RichVariant extends ProductVariant {
  size?: string;
  variantFeatures?: string[];
  variantSpecs?: VariantSpec[];
  newFeatureInput?: string;
}

interface ProductFormProps {
  initialData?: Product | null;
  isEdit?: boolean;
}

const INPUT_CLS =
  'w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-semibold placeholder:font-normal placeholder:text-slate-400';

const LABEL_CLS = 'block text-xs font-bold text-slate-700 mb-1';

// Dynamic categories will be fetched from the API

export default function ProductForm({ initialData, isEdit }: ProductFormProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'general' | 'variants'>('general');

  const [name, setName] = useState(initialData?.name || '');
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [categoryName, setCategoryName] = useState(initialData?.categoryName || '');
  const [subcategoryId, setSubcategoryId] = useState(initialData?.subcategoryId || '');
  const [subcategoryName, setSubcategoryName] = useState(initialData?.subcategoryName || '');
  const [categories, setCategories] = useState<{id: string, name: string, subcategories?: {id: string, name: string}[]}[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (!initialData?.categoryId && data.length > 0) {
            setCategoryId(data[0].id);
            setCategoryName(data[0].name);
          }
        }
      })
      .catch((err) => console.error('Failed to fetch categories:', err));
  }, [initialData]);
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [originalPrice, setOriginalPrice] = useState(initialData?.originalPrice?.toString() || '');
  const [stock, setStock] = useState(initialData?.stock?.toString() || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? true);
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || '');
  const [imageAlt, setImageAlt] = useState(initialData?.imageAlt || '');

  const [variants, setVariants] = useState<RichVariant[]>(() => {
    if (!initialData?.variants?.length) return [];
    return initialData.variants.map((v) => ({
      ...v,
      size: (v as any).size || '',
      variantFeatures: (v as any).features || [],
      variantSpecs: (v as any).specifications
        ? Object.entries((v as any).specifications as Record<string, string>).map(([key, val]) => ({ key, val }))
        : [],
      newFeatureInput: '',
    }));
  });

  const [expandedVariant, setExpandedVariant] = useState<number | null>(null);
  const [uploadingVariantImage, setUploadingVariantImage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAddVariant = () => {
    const newVar: RichVariant = {
      id: `var-${Date.now()}`,
      productId: initialData?.id || '',
      sku: `${sku || 'SKU'}-${variants.length + 1}`,
      colorName: '',
      colorHex: '',
      size: '',
      price: Number(originalPrice) || 0,
      stock: 0,
      lowStockThreshold: 4,
      images: [],
      variantFeatures: [],
      variantSpecs: [],
      newFeatureInput: '',
    };
    setVariants([...variants, newVar]);
    setExpandedVariant(variants.length);
  };

  const updateVariant = (idx: number, patch: Partial<RichVariant>) => {
    setVariants((prev) => prev.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  };

  const removeVariant = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
    if (expandedVariant === idx) setExpandedVariant(null);
  };

  const handleVariantImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVariantImage(idx);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        updateVariant(idx, { images: [data.url] });
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch {
      alert('Upload failed');
    } finally {
      setUploadingVariantImage(null);
      e.target.value = '';
    }
  };

  const addVariantSpec = (idx: number) => {
    const v = variants[idx];
    updateVariant(idx, { variantSpecs: [...(v.variantSpecs || []), { key: '', val: '' }] });
  };

  const updateVariantSpec = (varIdx: number, specIdx: number, field: 'key' | 'val', value: string) => {
    const v = variants[varIdx];
    const updated = (v.variantSpecs || []).map((s, i) => (i === specIdx ? { ...s, [field]: value } : s));
    updateVariant(varIdx, { variantSpecs: updated });
  };

  const removeVariantSpec = (varIdx: number, specIdx: number) => {
    const v = variants[varIdx];
    updateVariant(varIdx, { variantSpecs: (v.variantSpecs || []).filter((_, i) => i !== specIdx) });
  };

  const addVariantFeature = (idx: number) => {
    const v = variants[idx];
    if (!v.newFeatureInput?.trim()) return;
    updateVariant(idx, {
      variantFeatures: [...(v.variantFeatures || []), v.newFeatureInput.trim()],
      newFeatureInput: '',
    });
  };

  const removeVariantFeature = (varIdx: number, fIdx: number) => {
    const v = variants[varIdx];
    updateVariant(varIdx, { variantFeatures: (v.variantFeatures || []).filter((_, i) => i !== fIdx) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setMessage('Product Title is required'); setActiveSection('general'); return; }
    if (!shortDescription.trim()) { setMessage('Short Description is required'); setActiveSection('general'); return; }
    if (!description.trim()) { setMessage('Description is required'); setActiveSection('general'); return; }
    if (!originalPrice) { setMessage('Original Price is required'); setActiveSection('general'); return; }
    if (!stock) { setMessage('Total Initial Stock is required'); setActiveSection('general'); return; }
    if (!sku.trim()) { setMessage('Base SKU Code is required'); setActiveSection('general'); return; }
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.sku.trim()) { setMessage(`Variant #${i + 1}: SKU is required`); setActiveSection('variants'); return; }
      if (!v.images?.length || !v.images[0]) { setMessage(`Variant #${i + 1}: Picture is required`); setActiveSection('variants'); return; }
      if (!v.variantFeatures?.length) { setMessage(`Variant #${i + 1}: At least one Key Highlight Bullet is required`); setActiveSection('variants'); return; }
    }
    setLoading(true);
    setMessage('');
    const serialisedVariants = variants.map((v) => {
      const specMap: Record<string, string> = {};
      (v.variantSpecs || []).forEach((s) => { if (s.key) specMap[s.key] = s.val; });
      return {
        id: v.id,
        productId: v.productId,
        sku: v.sku,
        colorName: v.colorName || '',
        colorHex: v.colorHex || '',
        size: v.size || null,
        price: Number(originalPrice),
        stock: Number(v.stock),
        lowStockThreshold: v.lowStockThreshold,
        images: v.images,
      };
    });
    const payload = {
      name, brand, categoryId, categoryName, 
      subcategoryId: subcategoryId || undefined,
      subcategoryName: subcategoryName || undefined,
      shortDescription, description,
      basePrice: Number(originalPrice),
      originalPrice: Number(originalPrice),
      stock: Number(stock), sku, isPublished, isFeatured,
      seoTitle: seoTitle.trim() || null,
      seoDescription: seoDescription.trim() || null,
      imageAlt: imageAlt.trim() || null,
      isBestSeller: false, isNew: false,
      images: variants.flatMap((v) => v.images || []),
      variants: serialisedVariants,
      features: variants[0]?.variantFeatures || [],
      specifications: (() => {
        const m: Record<string, string> = {};
        (variants[0]?.variantSpecs || []).forEach((s) => { if (s.key) m[s.key] = s.val; });
        return m;
      })(),
    };
    try {
      const url = isEdit ? `/api/products/${initialData?.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Failed to save product');
      setMessage('Product saved successfully! Redirecting...');
      setTimeout(() => router.push('/admin/products'), 1000);
    } catch (err: any) {
      setMessage(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Products
        </button>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          {isEdit ? 'Editing Existing Product' : 'Creating New Product'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#ffffff] rounded-2xl border border-slate-200 p-1.5 flex gap-1 shadow-2xs">
          {[
            { id: 'general', label: '1. General Information', Icon: Info },
            { id: 'variants', label: '2. Variant Matrix & Specs', Icon: Layers },
          ].map((tab) => (
            <button key={tab.id} type="button" onClick={() => setActiveSection(tab.id as any)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeSection === tab.id ? 'bg-[#0B132B] text-[#ffffff] shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}>
              <tab.Icon className="w-3.5 h-3.5" />{tab.label}
            </button>
          ))}
        </div>

        {activeSection === 'general' && (
          <div className="bg-[#ffffff] rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
            <h3 className="text-base font-bold text-[#0B132B] pb-2 border-b border-slate-100">General Information</h3>
            <div>
              <label className={LABEL_CLS}>Product Title *</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nova Pro Studio Headphones" className={INPUT_CLS} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLS}>Brand / Manufacturer</label>
                <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Novasound Atelier" className={INPUT_CLS} />
              </div>
              <div>
                <label className={LABEL_CLS}>Category / Department *</label>
                <select required value={categoryId} onChange={(e) => { 
                  const sel = categories.find((c) => c.id === e.target.value);
                  setCategoryId(e.target.value); 
                  setCategoryName(sel?.name || ''); 
                  setSubcategoryId('');
                  setSubcategoryName('');
                }} className={INPUT_CLS}>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              {/* Subcategory Select - Always shown so user knows it exists */}
              {(() => {
                const selectedCat = categories.find(c => c.id === categoryId);
                const hasSubcats = selectedCat && selectedCat.subcategories && selectedCat.subcategories.length > 0;
                
                return (
                  <div>
                    <label className={LABEL_CLS}>Subcategory</label>
                    <select 
                      value={subcategoryId} 
                      onChange={(e) => {
                        const selSub = selectedCat?.subcategories?.find(s => s.id === e.target.value);
                        setSubcategoryId(e.target.value);
                        setSubcategoryName(selSub?.name || '');
                      }} 
                      className={INPUT_CLS}
                      disabled={!hasSubcats}
                    >
                      {!hasSubcats ? (
                        <option value="">No subcategories available</option>
                      ) : (
                        <>
                          <option value="">-- Select Subcategory --</option>
                          {selectedCat.subcategories!.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </>
                      )}
                    </select>
                  </div>
                );
              })()}
            </div>
            <div>
              <label className={LABEL_CLS}>Short Description *</label>
              <input type="text" required value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="Brief editorial summary shown on product cards" className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Description *</label>
              <textarea required rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Comprehensive technical details and design story..." className={INPUT_CLS + ' resize-y'} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={LABEL_CLS}>Original Strikethrough Price (৳) *</label>
                <input type="number" step="0.01" required value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="3999.00" className={INPUT_CLS} />
              </div>
              <div>
                <label className={LABEL_CLS}>Total Initial Stock Units *</label>
                <input type="number" required min="0" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="50" className={INPUT_CLS} />
              </div>
              <div>
                <label className={LABEL_CLS}>Base SKU Code *</label>
                <input type="text" required value={sku} onChange={(e) => setSku(e.target.value)} placeholder="NOV-AUD-01" className={INPUT_CLS + ' font-mono'} />
              </div>
            </div>
            <div className="flex flex-wrap gap-6 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                Published on Store
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                Featured Product
              </label>
            </div>
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-[#0B132B]">SEO (Google Search)</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Optional. Khali rakhle auto-generate hobe: "{name || 'Product'} Price in Bangladesh".</p>
              </div>
              <div>
                <label className={LABEL_CLS}>SEO Title <span className={`font-normal ${seoTitle.length > 60 ? 'text-rose-600' : 'text-slate-400'}`}>({seoTitle.length}/60)</span></label>
                <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={`${name || 'Product Name'} Price in Bangladesh`} className={INPUT_CLS} />
              </div>
              <div>
                <label className={LABEL_CLS}>SEO Description <span className={`font-normal ${seoDescription.length > 160 ? 'text-rose-600' : 'text-slate-400'}`}>({seoDescription.length}/160)</span></label>
                <textarea rows={3} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="Keyword, benefit ar CTA likhun. e.g. Buy ... at best price in BD. Cash on Delivery." className={INPUT_CLS + ' resize-y'} />
              </div>
              <div>
                <label className={LABEL_CLS}>Main Image Alt Text</label>
                <input type="text" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} placeholder="e.g. Samsung Galaxy A15 black front view" className={INPUT_CLS} />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Google preview</p>
                <p className="text-[#1a0dab] text-base leading-tight truncate">{(seoTitle || `${name || 'Product Name'} Price in Bangladesh`)} | BDNEEDS</p>
                <p className="text-[12px] text-emerald-700 mt-0.5">bdneeds.com › product › {name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : 'slug'}</p>
                <p className="text-[12px] text-slate-600 mt-0.5 line-clamp-2">{seoDescription || shortDescription || 'Description auto-generate hobe.'}</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'variants' && (
          <div className="bg-[#ffffff] rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-5 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-[#0B132B]">Variant Matrix & Specs</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Each variant can have its own colour, size, image, bullets, and specs.</p>
              </div>
              <button type="button" onClick={handleAddVariant} className="px-4 py-2 bg-blue-600 text-[#ffffff] rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5 shrink-0">
                <Plus className="w-3.5 h-3.5" /> Add Variant
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="py-14 text-center text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-2xl">
                No variants yet. Click <strong>"Add Variant"</strong> to create the first one.
              </div>
            ) : (
              <div className="space-y-3">
                {variants.map((v, idx) => {
                  const isOpen = expandedVariant === idx;
                  const badge = [v.colorName, v.size].filter(Boolean).join(' / ');
                  return (
                    <div key={v.id} className="border border-slate-200 rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                        <button type="button" onClick={() => setExpandedVariant(isOpen ? null : idx)} className="flex items-center gap-3 flex-1 text-left">
                          {v.colorHex && <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: v.colorHex }} />}
                          <span className="text-xs font-bold text-slate-800">Variant #{idx + 1}{badge ? `: ${badge}` : ''}</span>
                          {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                        </button>
                        <button type="button" onClick={() => removeVariant(idx)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {isOpen && (
                        <div className="p-5 space-y-5 bg-[#ffffff]">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className={LABEL_CLS}>Color Name (optional)</label>
                              <input type="text" value={v.colorName} onChange={(e) => updateVariant(idx, { colorName: e.target.value })} placeholder="e.g. Space Black" className={INPUT_CLS} />
                            </div>
                            <div>
                              <label className={LABEL_CLS}>Color Hex (optional)</label>
                              <div className="flex gap-2">
                                <input type="text" value={v.colorHex} onChange={(e) => updateVariant(idx, { colorHex: e.target.value })} placeholder="#1E1E24" className={INPUT_CLS + ' font-mono'} />
                                {v.colorHex && <span className="w-10 h-10 rounded-xl border border-slate-200 shrink-0" style={{ backgroundColor: v.colorHex }} />}
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className={LABEL_CLS}>Size (optional)</label>
                            <input type="text" value={v.size || ''} onChange={(e) => updateVariant(idx, { size: e.target.value })} placeholder="e.g. S / M / XL or 256GB" className={INPUT_CLS} />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className={LABEL_CLS}>Variant SKU *</label>
                              <input type="text" value={v.sku} onChange={(e) => updateVariant(idx, { sku: e.target.value })} placeholder="NOV-AUD-01-BLK" className={INPUT_CLS + ' font-mono'} />
                            </div>
                            <div>
                              <label className={LABEL_CLS}>Stock *</label>
                              <input type="number" min="0" value={v.stock} onChange={(e) => updateVariant(idx, { stock: Number(e.target.value) })} placeholder="20" className={INPUT_CLS} />
                            </div>
                          </div>

                          <div>
                            <label className={LABEL_CLS}>Variant Picture *</label>
                            <div className="flex gap-3 items-start">
                              {v.images?.[0] && (
                                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                                  <Image src={v.images[0]} alt="Variant" fill className="object-cover" />
                                </div>
                              )}
                              <div className="flex-1 space-y-2">
                                <input type="text" value={v.images?.[0] || ''} onChange={(e) => updateVariant(idx, { images: [e.target.value] })} placeholder="https://... or upload below" className={INPUT_CLS} />
                                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B132B] text-[#ffffff] text-xs font-bold rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
                                  {uploadingVariantImage === idx ? 'Uploading...' : 'Upload Image'}
                                  <input type="file" accept="image/*" onChange={(e) => handleVariantImageUpload(e, idx)} className="hidden" disabled={uploadingVariantImage !== null} />
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-4">
                            <label className={LABEL_CLS}>Variant's Key Highlight Bullets *</label>
                            <div className="flex gap-2 mb-3">
                              <input type="text" value={v.newFeatureInput || ''} onChange={(e) => updateVariant(idx, { newFeatureInput: e.target.value })}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addVariantFeature(idx); } }}
                                placeholder="e.g. 52-Hour battery life" className={INPUT_CLS} />
                              <button type="button" onClick={() => addVariantFeature(idx)} className="px-4 py-2 bg-slate-800 text-[#ffffff] rounded-xl text-xs font-bold hover:bg-slate-700 shrink-0">Add</button>
                            </div>
                            {(v.variantFeatures || []).length > 0 && (
                              <ul className="space-y-1.5">
                                {(v.variantFeatures || []).map((f, fi) => (
                                  <li key={fi} className="flex justify-between items-center px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                                    <span className="text-slate-700">{f}</span>
                                    <button type="button" onClick={() => removeVariantFeature(idx, fi)} className="text-slate-400 hover:text-rose-600 ml-2"><Trash2 className="w-3.5 h-3.5" /></button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>

                          <div className="border-t border-slate-100 pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <label className={LABEL_CLS + ' mb-0'}>Technical Specifications</label>
                              <button type="button" onClick={() => addVariantSpec(idx)} className="text-xs text-blue-600 font-bold hover:underline">+ Add Row</button>
                            </div>
                            <div className="space-y-2">
                              {(v.variantSpecs || []).map((s, si) => (
                                <div key={si} className="flex gap-2">
                                  <input type="text" value={s.key} onChange={(e) => updateVariantSpec(idx, si, 'key', e.target.value)} placeholder="e.g. Driver Size" className="w-1/3 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20" />
                                  <input type="text" value={s.val} onChange={(e) => updateVariantSpec(idx, si, 'val', e.target.value)} placeholder="e.g. 40mm Planar" className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/20" />
                                  <button type="button" onClick={() => removeVariantSpec(idx, si)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                              ))}
                              {(v.variantSpecs || []).length === 0 && <p className="text-[11px] text-slate-400">No specs added. Click "+ Add Row" to start.</p>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {message && (
          <div className={`p-4 border rounded-2xl text-xs font-bold flex items-center gap-2 ${message.toLowerCase().includes('failed') || message.toLowerCase().includes('error') || message.toLowerCase().includes('required') ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
            {message.toLowerCase().includes('failed') || message.toLowerCase().includes('error') || message.toLowerCase().includes('required') ? <XCircle className="w-4 h-4 text-rose-600 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            <span>{message}</span>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => router.push('/admin/products')} className="px-6 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button type="submit" disabled={loading} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-[#ffffff] rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-md">
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
