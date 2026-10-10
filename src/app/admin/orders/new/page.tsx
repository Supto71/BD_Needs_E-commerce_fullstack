'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { Plus, Trash2, ArrowLeft, Search, ChevronDown } from 'lucide-react';
import Link from 'next/link';

// Custom Searchable Dropdown Component
function SearchableProductSelect({ 
  products, 
  value, 
  onChange 
}: { 
  products: Product[], 
  value: string, 
  onChange: (val: string) => void 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedProduct = products.find(p => p.id === value);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div 
        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedProduct ? "text-slate-900" : "text-slate-400"}>
          {selectedProduct ? `${selectedProduct.name} - ৳${selectedProduct.basePrice}` : '-- Search and Select Product --'}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-80 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50 shrink-0">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              autoFocus
              placeholder="Search products..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </div>
          <div className="overflow-y-auto p-1 flex-1">
            {filteredProducts.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-400">No products found</div>
            ) : (
              filteredProducts.map(p => (
                <div 
                  key={p.id}
                  onClick={() => {
                    onChange(p.id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer rounded-lg mt-1 transition-colors ${
                    p.id === value ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {p.name} <span className="text-slate-400 text-xs float-right">৳{p.basePrice}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [selectedItems, setSelectedItems] = useState<{ categoryId: string; productId: string; quantity: number }[]>([]);

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    street: '',
    city: '',
    adminDiscountPercentage: '',
    adminShippingFee: '',
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/products?admin=true').then(res => res.json()),
      fetch('/api/categories?admin=true').then(res => res.json())
    ]).then(([prodData, catData]) => {
      if (Array.isArray(prodData)) setProducts(prodData);
      if (Array.isArray(catData)) setCategories(catData);
    }).catch(console.error);
  }, []);

  const handleAddItem = () => {
    setSelectedItems([...selectedItems, { categoryId: '', productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...selectedItems];
    newItems.splice(index, 1);
    setSelectedItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...selectedItems];
    if (field === 'categoryId') {
      newItems[index] = { ...newItems[index], categoryId: value as string, productId: '' }; // Reset product when category changes
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setSelectedItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0 || selectedItems.some(i => !i.productId)) {
      alert('Please select at least one product.');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        shippingAddress: {
          street: formData.street,
          city: formData.city,
        },
        paymentMethod: 'COD',
        items: selectedItems.map(i => ({ productId: i.productId, quantity: i.quantity })),
      };

      if (formData.adminDiscountPercentage) payload.adminDiscountPercentage = parseFloat(formData.adminDiscountPercentage);
      if (formData.adminShippingFee) payload.adminShippingFee = parseFloat(formData.adminShippingFee);

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Order created successfully!');
        router.push('/admin/orders');
      } else {
        const data = await res.json();
        alert('Error: ' + (data.error || 'Failed to create order'));
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/orders" className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#0B132B]">Create New Order</h1>
          <p className="text-sm text-slate-500">Manually place an order on behalf of a customer.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        
        {/* Order Overrides */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Order Adjustments (Optional)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Delivery Charge (৳)</label>
              <input type="number" min="0" placeholder="e.g. 70 or 130" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.adminShippingFee} onChange={e => setFormData({...formData, adminShippingFee: e.target.value})} />
              <p className="text-[10px] text-slate-400 mt-1">Leave empty to auto-calculate based on city.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Discount (%)</label>
              <input type="number" min="0" max="100" placeholder="e.g. 10" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.adminDiscountPercentage} onChange={e => setFormData({...formData, adminDiscountPercentage: e.target.value})} />
              <p className="text-[10px] text-slate-400 mt-1">Apply a percentage discount on the subtotal.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100"></div>

        {/* Customer Information */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Full Name</label>
              <input required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
              <input required type="email" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.customerEmail} onChange={e => setFormData({...formData, customerEmail: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number</label>
              <input required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Shipping Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Street Address</label>
              <input required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">City</label>
              <input required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Order Items</h2>
            <button type="button" onClick={handleAddItem} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
          
          <div className="space-y-4">
            {selectedItems.map((item, index) => {
              const availableProducts = item.categoryId === 'all' 
                ? products 
                : item.categoryId 
                  ? products.filter(p => p.categoryId === item.categoryId) 
                  : [];

              return (
                <div key={index} className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  
                  <div className="w-full sm:w-1/3">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Category</label>
                    <select 
                      required 
                      value={item.categoryId} 
                      onChange={e => handleItemChange(index, 'categoryId', e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium"
                    >
                      <option value="">-- Select Category --</option>
                      <option value="all">All Categories</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full sm:w-1/2 relative">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Product</label>
                    <SearchableProductSelect 
                      products={availableProducts}
                      value={item.productId}
                      onChange={(val) => handleItemChange(index, 'productId', val)}
                    />
                  </div>

                  <div className="w-full sm:w-24">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Qty</label>
                    <input 
                      required 
                      type="number" 
                      min="1" 
                      value={item.quantity} 
                      onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-center"
                    />
                  </div>
                  
                  <button type="button" onClick={() => handleRemoveItem(index)} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-lg mt-4 sm:mt-0 shrink-0 transition-colors self-end sm:self-auto">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
            
            {selectedItems.length === 0 && (
              <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium">
                No products added yet. Click "Add Product" to select items.
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button 
            type="submit" 
            disabled={loading || selectedItems.length === 0}
            className="px-6 py-3 bg-[#0B132B] hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer"
          >
            {loading ? 'Creating Order...' : 'Create Order'}
          </button>
        </div>

      </form>
    </div>
  );
}
