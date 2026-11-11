'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  UploadCloud,
  GripVertical,
  Sparkles,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';
import { Banner } from '@/types';
import { formatPrice } from '@/lib/utils';
import { compressImage } from '@/lib/imageCompression';
import { useAuth } from '@/context/AuthContext';

type SectionType = 'HERO' | 'CAMPAIGN';

export default function AdminBannersPage() {
  const { isAdmin } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [type, setType] = useState<'HERO' | 'CAMPAIGN' | 'ANNOUNCEMENT'>('HERO');
  const [badge, setBadge] = useState('NEW RELEASE');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [image, setImage] = useState('');
  const [ctaText, setCtaText] = useState('Shop Collection');
  const [ctaLink, setCtaLink] = useState('/shop');
  const [isActive, setIsActive] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPreviewUrl, setUploadingPreviewUrl] = useState<string | null>(null);

  // Per-card toggle & drag-and-drop reorder state
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [draggingBanner, setDraggingBanner] = useState<{ id: string; type: SectionType } | null>(null);
  const [savingOrderType, setSavingOrderType] = useState<SectionType | null>(null);
  const [savedOrderType, setSavedOrderType] = useState<SectionType | null>(null);

  const preDragBannersRef = useRef<Banner[] | null>(null);
  const latestBannersRef = useRef<Banner[]>([]);
  latestBannersRef.current = banners;

  const getSectionType = (b: Banner): SectionType =>
    b.type === 'CAMPAIGN' ? 'CAMPAIGN' : 'HERO';

  const heroBanners = banners.filter((b) => getSectionType(b) === 'HERO');
  const campaignBanners = banners.filter((b) => getSectionType(b) === 'CAMPAIGN');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreviewUrl = URL.createObjectURL(file);
    setUploadingPreviewUrl(localPreviewUrl);
    setUploadingImage(true);

    try {
      const compressed = await compressImage(file, { maxWidth: 1920, maxHeight: 1080, quality: 0.82 });
      const formData = new FormData();
      formData.append('file', compressed);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setImage(data.url);
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
      setUploadingPreviewUrl(null);
      URL.revokeObjectURL(localPreviewUrl);
      e.target.value = '';
    }
  };

  const fetchBanners = () => {
    setLoading(true);
    fetch('/api/banners?admin=true')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBanners(data.filter((b: Banner) => b.type !== 'ANNOUNCEMENT'));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreate = (defaultType: SectionType = 'HERO') => {
    setEditBanner(null);
    setTitle('');
    setSubtitle('');
    setType(defaultType);
    setBadge(defaultType === 'CAMPAIGN' ? 'SEASONAL CAMPAIGN' : 'FEATURED RELEASE');
    setDescription('');
    setPrice('299');
    setDiscount('20');
    setImage('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&q=85');
    setCtaText('Explore Collection');
    setCtaLink('/shop');
    setIsActive(true);
    setModalOpen(true);
  };

  const openEdit = (b: Banner) => {
    setEditBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle);
    setType(b.type || 'HERO');
    setBadge(b.badge);
    setDescription(b.description);
    setPrice(b.price.toString());
    setDiscount(b.discount.toString());
    setImage(b.image);
    setCtaText(b.ctaText);
    setCtaLink(b.ctaLink);
    setIsActive(b.isActive);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    if (type !== 'ANNOUNCEMENT' && !image) return;

    const sectionCount = banners.filter((b) => (b.type || 'HERO') === type).length;

    const payload = {
      title,
      subtitle,
      type,
      badge,
      description,
      price: Number(price) || 0,
      discount: Number(discount) || 0,
      image,
      ctaText,
      ctaLink,
      isActive,
      ...(editBanner ? {} : { order: sectionCount }),
    };

    try {
      if (editBanner) {
        await fetch(`/api/banners/${editBanner.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setModalOpen(false);
      fetchBanners();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBanners((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    if (!isAdmin || togglingId === banner.id) return;
    const nextActive = !banner.isActive;
    setTogglingId(banner.id);

    // Optimistic update
    setBanners((prev) =>
      prev.map((b) => (b.id === banner.id ? { ...b, isActive: nextActive } : b))
    );

    try {
      const res = await fetch(`/api/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextActive }),
      });
      if (!res.ok) {
        throw new Error('Failed to update status');
      }
    } catch (err) {
      console.error(err);
      // Revert on failure
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, isActive: banner.isActive } : b))
      );
      alert('Could not update banner status. Please try again.');
    } finally {
      setTogglingId(null);
    }
  };

  const persistSectionOrder = async (
    sectionType: SectionType,
    orderedSectionItems: Banner[],
    fallbackBanners: Banner[]
  ) => {
    setSavingOrderType(sectionType);
    try {
      const res = await fetch('/api/banners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderedSectionItems.map((item, idx) => ({
            id: item.id,
            order: idx,
          })),
        }),
      });
      if (!res.ok) {
        throw new Error('Failed to save banner order');
      }
      setSavedOrderType(sectionType);
      setTimeout(() => {
        setSavedOrderType((curr) => (curr === sectionType ? null : curr));
      }, 2000);
    } catch (err) {
      console.error(err);
      setBanners(fallbackBanners);
      alert('Failed to save banner order. Reverted changes.');
    } finally {
      setSavingOrderType(null);
    }
  };

  const reorderInSection = (
    list: Banner[],
    sectionType: SectionType,
    fromId: string,
    toId: string
  ): Banner[] => {
    const sectionItems = list.filter((b) => getSectionType(b) === sectionType);
    const otherItems = list.filter((b) => getSectionType(b) !== sectionType);
    const fromIdx = sectionItems.findIndex((b) => b.id === fromId);
    const toIdx = sectionItems.findIndex((b) => b.id === toId);

    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return list;

    const updatedSection = [...sectionItems];
    const [moved] = updatedSection.splice(fromIdx, 1);
    updatedSection.splice(toIdx, 0, moved);

    const normalizedSection = updatedSection.map((item, idx) => ({
      ...item,
      order: idx,
    }));

    return sectionType === 'HERO'
      ? [...normalizedSection, ...otherItems]
      : [...otherItems, ...normalizedSection];
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    banner: Banner,
    sectionType: SectionType
  ) => {
    if (!isAdmin) return;
    preDragBannersRef.current = banners;
    setDraggingBanner({ id: banner.id, type: sectionType });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', banner.id);
  };

  const handleDragEnter = (
    e: React.DragEvent<HTMLDivElement>,
    targetId: string,
    sectionType: SectionType
  ) => {
    e.preventDefault();
    if (!draggingBanner || draggingBanner.type !== sectionType || draggingBanner.id === targetId) {
      return;
    }
    setBanners((prev) => reorderInSection(prev, sectionType, draggingBanner.id, targetId));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = async () => {
    const activeDrag = draggingBanner;
    const snapshot = preDragBannersRef.current;
    setDraggingBanner(null);
    preDragBannersRef.current = null;

    if (!activeDrag || !snapshot) return;

    const sectionType = activeDrag.type;
    const prevSectionIds = snapshot
      .filter((b) => getSectionType(b) === sectionType)
      .map((b) => b.id);
    const currentSection = latestBannersRef.current.filter(
      (b) => getSectionType(b) === sectionType
    );
    const currentSectionIds = currentSection.map((b) => b.id);

    const changed = prevSectionIds.some((id, idx) => id !== currentSectionIds[idx]);
    if (changed) {
      await persistSectionOrder(sectionType, currentSection, snapshot);
    }
  };

  const handleStepMove = async (
    sectionType: SectionType,
    index: number,
    direction: -1 | 1
  ) => {
    if (!isAdmin) return;
    const sectionItems = banners.filter((b) => getSectionType(b) === sectionType);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sectionItems.length) return;

    const snapshot = banners;
    const fromId = sectionItems[index].id;
    const toId = sectionItems[targetIndex].id;
    const reorderedAll = reorderInSection(banners, sectionType, fromId, toId);
    setBanners(reorderedAll);

    const updatedSection = reorderedAll.filter((b) => getSectionType(b) === sectionType);
    await persistSectionOrder(sectionType, updatedSection, snapshot);
  };

  const renderSection = ({
    sectionType,
    heading,
    subheading,
    items,
    emptyText,
    buttonLabel,
    accentClass,
    Icon,
  }: {
    sectionType: SectionType;
    heading: string;
    subheading: string;
    items: Banner[];
    emptyText: string;
    buttonLabel: string;
    accentClass: string;
    Icon: React.ComponentType<{ className?: string }>;
  }) => {
    const activeCount = items.filter((b) => b.isActive).length;

    return (
      <section className="bg-slate-50/70 border border-slate-200/80 rounded-3xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-2xl shrink-0 ${accentClass}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-black text-[#0B132B]">{heading}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ffffff] border border-slate-200 text-slate-600">
                  {activeCount} Active / {items.length} Total
                </span>
                {savingOrderType === sectionType && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving order...
                  </span>
                )}
                {savedOrderType === sectionType && savingOrderType !== sectionType && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    <Check className="w-3 h-3" />
                    Order saved
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{subheading}</p>
            </div>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => openCreate(sectionType)}
              className="px-4 py-2 bg-[#0B132B] hover:bg-blue-600 text-[#ffffff] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              {buttonLabel}
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-80 rounded-3xl bg-[#ffffff] border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-[#ffffff] border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-2">
            <p className="text-sm font-bold text-slate-700">{emptyText}</p>
            {isAdmin && (
              <button
                type="button"
                onClick={() => openCreate(sectionType)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-3.5 h-3.5" />
                {buttonLabel}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((b, idx) => {
              const isDragging = draggingBanner?.id === b.id;
              const isToggling = togglingId === b.id;

              return (
                <div
                  key={b.id}
                  draggable={isAdmin}
                  onDragStart={(e) => handleDragStart(e, b, sectionType)}
                  onDragEnter={(e) => handleDragEnter(e, b.id, sectionType)}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  className={`bg-[#ffffff] rounded-3xl border overflow-hidden shadow-xs flex flex-col justify-between transition-all duration-150 ${
                    isDragging
                      ? 'border-blue-500 ring-2 ring-blue-400/60 opacity-70 scale-[0.98]'
                      : b.isActive
                      ? 'border-slate-200 hover:border-slate-300'
                      : 'border-slate-200/80 opacity-85'
                  } ${isAdmin ? 'cursor-grab active:cursor-grabbing' : ''}`}
                >
                  <div>
                    <div className="relative aspect-video w-full bg-slate-900 select-none">
                      <Image
                        src={b.image}
                        alt={b.title}
                        fill
                        draggable={false}
                        className={`object-cover pointer-events-none transition-all ${
                          b.isActive ? '' : 'grayscale-[40%]'
                        }`}
                      />
                      <div className="absolute top-3 left-3 bg-[#0B132B]/85 backdrop-blur-xs text-[#ffffff] px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        {b.badge}
                      </div>

                      {/* Order indicator + Drag Handle */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#ffffff]/90 backdrop-blur-xs text-[#0B132B] px-2 py-1 rounded-lg text-[11px] font-extrabold shadow-xs">
                        {isAdmin && <GripVertical className="w-3.5 h-3.5 text-slate-500" />}
                        <span>#{idx + 1}</span>
                      </div>
                    </div>

                    <div className="p-6 space-y-2">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                        {sectionType === 'CAMPAIGN' ? 'Campaign Banner' : 'Hero Carousel'}
                        {b.subtitle ? ` • ${b.subtitle}` : ''}
                      </p>
                      <h3 className="text-base font-black text-[#0B132B] line-clamp-1">
                        {b.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{b.description}</p>
                      <div className="pt-2 flex items-center gap-3 text-xs">
                        <span className="font-extrabold text-[#0B132B]">
                          {formatPrice(b.price)}
                        </span>
                        {b.discount > 0 && (
                          <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                            Save {b.discount}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-2 text-xs font-semibold">
                    {/* Direct Active / Deactive Toggle Button */}
                    {isAdmin ? (
                      <button
                        type="button"
                        disabled={isToggling}
                        onClick={() => handleToggleActive(b)}
                        title={
                          b.isActive
                            ? 'Click to deactivate banner'
                            : 'Click to activate banner'
                        }
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer disabled:opacity-60 ${
                          b.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {isToggling ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span
                            className={`w-7 h-4 rounded-full relative transition-colors inline-flex items-center ${
                              b.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          >
                            <span
                              className={`w-3 h-3 rounded-full bg-[#ffffff] shadow-xs transition-transform ${
                                b.isActive ? 'translate-x-3.5' : 'translate-x-0.5'
                              }`}
                            />
                          </span>
                        )}
                        <span>{b.isActive ? 'Active' : 'Deactive'}</span>
                      </button>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          b.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {b.isActive ? 'Active' : 'Deactive'}
                      </span>
                    )}

                    <div className="flex items-center gap-0.5">
                      {isAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStepMove(sectionType, idx, -1)}
                            disabled={idx === 0}
                            title="Move earlier"
                            className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStepMove(sectionType, idx, 1)}
                            disabled={idx === items.length - 1}
                            title="Move later"
                            className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(b)}
                            title="Edit banner"
                            className="p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(b.id)}
                            title="Delete banner"
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B132B]">
            Hero Banners & Campaigns
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Drag and drop cards to arrange their display order, or toggle active status directly from each card.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => openCreate('HERO')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-[#ffffff] rounded-xl text-xs font-bold transition-colors flex items-center gap-2 self-start sm:self-auto shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Create Banner
          </button>
        )}
      </div>

      {/* Section 1: Hero Carousel Banners */}
      {renderSection({
        sectionType: 'HERO',
        heading: 'Hero Carousel Banners',
        subheading: 'Drag cards to reorder slides on the homepage hero carousel.',
        items: heroBanners,
        emptyText: 'No Hero Carousel banners found yet.',
        buttonLabel: 'Add Hero Slide',
        accentClass: 'bg-blue-50 text-blue-600 border border-blue-100',
        Icon: Sparkles,
      })}

      {/* Section 2: Campaign Banners */}
      {renderSection({
        sectionType: 'CAMPAIGN',
        heading: 'Campaign Banners',
        subheading: 'Drag cards to prioritize campaign banners (first active banner shows on homepage).',
        items: campaignBanners,
        emptyText: 'No Campaign banners found yet.',
        buttonLabel: 'Add Campaign Banner',
        accentClass: 'bg-amber-50 text-amber-600 border border-amber-100',
        Icon: Megaphone,
      })}

      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="relative bg-[#ffffff] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl z-10 space-y-4">
            <h3 className="text-lg font-bold text-[#0B132B]">
              {editBanner
                ? `Edit ${type === 'CAMPAIGN' ? 'Campaign' : 'Hero'} Banner`
                : `Create ${type === 'CAMPAIGN' ? 'Campaign' : 'Hero'} Banner`}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Headline Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Acoustic Precision Reimagined"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Banner Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'HERO' | 'CAMPAIGN' | 'ANNOUNCEMENT')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="HERO">Hero Carousel</option>
                    <option value="CAMPAIGN">Campaign Banner</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Nova Pro Studio Series"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Badge</label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="LIMITED EDITION"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl uppercase font-bold"
                />
              </div>

              {type !== 'ANNOUNCEMENT' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Image URL or File *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://images.unsplash.com/... or upload"
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                    <label className="px-4 py-2 bg-[#0B132B] text-[#ffffff] text-xs font-bold rounded-xl hover:bg-blue-600 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0">
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Upload Image</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>

                  {/* Banner Image Preview */}
                  {(uploadingPreviewUrl || image) && (
                    <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="relative w-full h-36 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 group">
                        <img
                          src={uploadingPreviewUrl || image}
                          alt="Banner Preview"
                          className="w-full h-full object-cover"
                        />
                        {uploadingImage && (
                          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white gap-1">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                            <span className="text-xs font-bold">Optimizing & Uploading...</span>
                          </div>
                        )}
                        {!uploadingImage && (
                          <button
                            type="button"
                            onClick={() => setImage('')}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors"
                            title="Remove image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1.5 truncate">
                        {uploadingPreviewUrl ? 'Compressing and uploading image...' : image}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (৳)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Destination URL</label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>
                  {type === 'CAMPAIGN'
                    ? 'Active Campaign Banner'
                    : 'Active on Homepage Hero'}
                </span>
              </label>

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
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
