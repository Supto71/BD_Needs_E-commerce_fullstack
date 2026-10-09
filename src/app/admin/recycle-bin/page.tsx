'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCcw, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function RecycleBinPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recycle-bin');
      const data = await res.json();
      if (!data.error) {
        setItems(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleRestore = async (id: string) => {
    setMessage({ text: '', type: '' });
    try {
      const res = await fetch(`/api/recycle-bin/${id}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ text: 'Item restored successfully!', type: 'success' });
        setItems((prev) => prev.filter((i) => i.id !== id));
      } else {
        setMessage({ text: data.error || 'Failed to restore item.', type: 'error' });
      }
    } catch (e) {
      setMessage({ text: 'An error occurred during restoration.', type: 'error' });
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this item? This action cannot be undone.')) return;
    setMessage({ text: '', type: '' });
    try {
      const res = await fetch(`/api/recycle-bin/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ text: 'Item permanently deleted.', type: 'success' });
        setItems((prev) => prev.filter((i) => i.id !== id));
      } else {
        setMessage({ text: data.error || 'Failed to delete item.', type: 'error' });
      }
    } catch (e) {
      setMessage({ text: 'An error occurred during deletion.', type: 'error' });
    }
  };

  const handleEmptyRecycleBin = async () => {
    if (items.length === 0) return;
    if (!confirm('Are you sure you want to permanently empty the entire recycle bin? This action cannot be undone!')) return;
    
    setMessage({ text: '', type: '' });
    try {
      const res = await fetch('/api/recycle-bin?empty=true', { method: 'DELETE' });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessage({ text: 'Recycle bin emptied successfully!', type: 'success' });
        setItems([]);
      } else {
        setMessage({ text: data.error || 'Failed to empty recycle bin.', type: 'error' });
      }
    } catch (e) {
      setMessage({ text: 'An error occurred while emptying the recycle bin.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0B132B]">Recycle Bin</h1>
          <p className="text-sm text-slate-500 mt-1">
            Items deleted from the admin dashboard are kept here. You can restore them or permanently delete them.
          </p>
        </div>
        <button
          onClick={handleEmptyRecycleBin}
          disabled={items.length === 0 || loading}
          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-rose-200"
        >
          <Trash2 className="w-4 h-4" />
          Empty Recycle Bin
        </button>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-[#ffffff] rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Entity Type</th>
                <th className="p-4">Title / Identifier</th>
                <th className="p-4">Deleted At</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 font-semibold text-sm">
                    Loading recycle bin items...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trash2 className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-semibold text-sm">Recycle Bin is empty.</p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                        {item.entityType}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-sm text-[#0B132B]">{item.entityTitle}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {item.entityId}</p>
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-500">
                      {formatDate(item.deletedAt)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRestore(item.id)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <RefreshCcw className="w-3.5 h-3.5" /> Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(item.id)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
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
