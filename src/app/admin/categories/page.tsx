'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit, Trash2, CheckCircle2, XCircle, FolderTree } from 'lucide-react';
import { Category } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function AdminCategoriesPage() {
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [subcategoriesText, setSubcategoriesText] = useState('');
  const [featuredSubcategoriesText, setFeaturedSubcategoriesText] = useState('');
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

  const fetchCategories = () => {
    setLoading(true);
    fetch('/api/categories?admin=true')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80');
    setIsActive(true);
    setSubcategoriesText('');
    setFeaturedSubcategoriesText('');
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setImage(cat.image);
    setIsActive(cat.isActive);
    setSubcategoriesText((cat as any).subcategories?.map((s: any) => s.name).join(', ') || '');
    setFeaturedSubcategoriesText((cat as any).subcategories?.filter((s: any) => s.isFeatured).map((s: any) => s.name).join(', ') || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description,
      image,
      isActive,
      subcategories: subcategoriesText.split(',').map(s => s.trim()).filter(s => s),
      featuredSubcategories: featuredSubcategoriesText.split(',').map(s => s.trim()).filter(s => s),
    };

    try {
      if (editCategory) {
        await fetch(`/api/categories/${editCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id));
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
            Category Architecture
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create departments, manage circular image thumbnails, and reorder storefront navigation.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-[#ffffff] rounded-xl text-xs font-bold transition-colors flex items-center gap-2 self-start sm:self-auto shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        )}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-[#ffffff] rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-slate-100">
                  <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                </div>
                <div className="flex items-center gap-1">
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <h3 className="text-base font-bold text-[#0B132B]">{cat.name}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">/{cat.slug}</p>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2">{cat.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">{cat.productCount} Products</span>
              {cat.isActive ? (
                <span className="text-emerald-600 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1 font-bold">
                  <XCircle className="w-3.5 h-3.5" /> Hidden
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative bg-[#ffffff] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl z-10 space-y-4">
            <h3 className="text-lg font-bold text-[#0B132B]">
              {editCategory ? 'Edit Category' : 'Create Category'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Smart Appliances"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. smart-appliances"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Thumbnail Image URL or File
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
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
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subcategories (Comma Separated)
                </label>
                <input
                  type="text"
                  value={subcategoriesText}
                  onChange={(e) => setSubcategoriesText(e.target.value)}
                  placeholder="e.g. Men, Women, Kids"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Featured Subcategories (Comma Separated)
                </label>
                <input
                  type="text"
                  value={featuredSubcategoriesText}
                  onChange={(e) => setFeaturedSubcategoriesText(e.target.value)}
                  placeholder="e.g. Men, Kids (must be part of subcategories above)"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-blue-700"
                />
                <p className="text-[10px] text-slate-400 mt-1">These will appear on the storefront filter bar.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Editorial overview of this collection"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Active on Storefront</span>
              </label>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-[#ffffff] rounded-xl text-xs font-bold shadow-xs"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
