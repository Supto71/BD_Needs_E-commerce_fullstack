'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit, Trash2, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';
import { Banner } from '@/types';
import { formatPrice } from '@/lib/utils';

import { useAuth } from '@/context/AuthContext';

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
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
      e.target.value = '';
    }
  };

  const fetchBanners = () => {
    setLoading(true);
    fetch('/api/banners?admin=true')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBanners(data.filter((b: any) => b.type !== 'ANNOUNCEMENT'));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreate = () => {
    setEditBanner(null);
    setTitle('');
    setSubtitle('');
    setType('HERO');
    setBadge('FEATURED RELEASE');
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
    if (!confirm('Are you sure you want to delete this hero banner?')) return;
    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBanners(banners.filter((b) => b.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B132B]">
            Hero Banners & Campaigns
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Program dynamic seasonal slides, flash sale campaigns, and product showcase headlines.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreate}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-[#ffffff] rounded-xl text-xs font-bold transition-colors flex items-center gap-2 self-start sm:self-auto shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Create Hero Slide
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((b) => (
          <div
            key={b.id}
            className="bg-[#ffffff] rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-video w-full bg-slate-900">
                <Image src={b.image} alt={b.title} fill className="object-cover" />
                <div className="absolute top-3 left-3 bg-[#0B132B]/80 backdrop-blur-xs text-[#ffffff] px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                  {b.badge}
                </div>
              </div>

              <div className="p-6 space-y-2">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                  {b.type === 'CAMPAIGN' ? 'Campaign Banner' : b.type === 'ANNOUNCEMENT' ? 'Announcement Bar' : 'Hero Carousel'} • {b.subtitle}
                </p>
                <h3 className="text-base font-black text-[#0B132B] line-clamp-1">{b.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{b.description}</p>
                <div className="pt-2 flex items-center gap-3 text-xs">
                  <span className="font-extrabold text-[#0B132B]">{formatPrice(b.price)}</span>
                  {b.discount > 0 && (
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      Save {b.discount}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between text-xs font-semibold mt-4">
              <span className={b.isActive ? 'text-emerald-600 font-bold flex items-center gap-1' : 'text-slate-400 font-bold flex items-center gap-1'}>
                {b.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {b.isActive ? 'Active on Carousel' : 'Disabled'}
              </span>

              <div className="flex items-center gap-1">
                {isAdmin && (
                  <>
                    <button
                      onClick={() => openEdit(b)}
                      className="p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="relative bg-[#ffffff] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl z-10 space-y-4">
            <h3 className="text-lg font-bold text-[#0B132B]">
              {editBanner ? 'Edit Hero Banner' : 'Create Hero Slide'}
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
                    <label className="px-4 py-2 bg-[#0B132B] text-[#ffffff] text-xs font-bold rounded-xl hover:bg-blue-600 transition-colors cursor-pointer flex items-center justify-center">
                      {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
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
                <span>Active on Homepage Hero</span>
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
                  Save Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
