'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<{ productId: string; quantity: number }[]>([]);

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    street: '',
    city: '',
  });

  useEffect(() => {
    fetch('/api/products?admin=true')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(console.error);
  }, []);

  const handleAddItem = () => {
    setSelectedItems([...selectedItems, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...selectedItems];
    newItems.splice(index, 1);
    setSelectedItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...selectedItems];
    newItems[index] = { ...newItems[index], [field]: value };
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
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          shippingAddress: {
            street: formData.street,
            city: formData.city,
          },
          paymentMethod: 'COD',
          items: selectedItems,
        }),
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/orders" className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#0B132B]">Create New Order</h1>
          <p className="text-sm text-slate-500">Manually place an order on behalf of a customer.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        
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
            <button type="button" onClick={handleAddItem} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
          
          <div className="space-y-3">
            {selectedItems.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex-1 w-full">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Product</label>
                  <select 
                    required 
                    value={item.productId} 
                    onChange={e => handleItemChange(index, 'productId', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-medium"
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - ৳{p.basePrice}</option>
                    ))}
                  </select>
                </div>
                <div className="w-full sm:w-24">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Qty</label>
                  <input 
                    required 
                    type="number" 
                    min="1" 
                    value={item.quantity} 
                    onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm text-center"
                  />
                </div>
                <button type="button" onClick={() => handleRemoveItem(index)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg mt-4 sm:mt-0 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            
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
            className="px-6 py-3 bg-[#0B132B] hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md transition-all"
          >
            {loading ? 'Creating Order...' : 'Create Order'}
          </button>
        </div>

      </form>
    </div>
  );
}
