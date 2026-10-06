'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Boxes, AlertTriangle, CheckCircle2, Save, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminInventoryPage() {
  const { isAdmin } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [editingThreshold, setEditingThreshold] = useState<Record<string, number>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [savingAll, setSavingAll] = useState(false);

  const fetchInventory = () => {
    setLoading(true);
    fetch('/api/inventory')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setInventory(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockChange = (key: string, val: number) => {
    setEditingStock((prev) => ({ ...prev, [key]: val }));
  };

  const handleThresholdChange = (key: string, val: number) => {
    setEditingThreshold((prev) => ({ ...prev, [key]: val }));
  };

  const handleSaveAll = async () => {
    setSavingAll(true);
    try {
      // Find all keys that have either stock or threshold changed
      const changedKeys = new Set([...Object.keys(editingStock), ...Object.keys(editingThreshold)]);
      const changes = Array.from(changedKeys).filter((key) => {
        const item = inventory.find((i) => `${i.productId}-${i.variantId || 'base'}` === key);
        if (!item) return false;
        const stockChanged = editingStock[key] !== undefined && editingStock[key] !== item.stock;
        const thresholdChanged = editingThreshold[key] !== undefined && editingThreshold[key] !== item.lowStockThreshold;
        return stockChanged || thresholdChanged;
      });

      await Promise.all(
        changes.map(async (key) => {
          const item = inventory.find((i) => `${i.productId}-${i.variantId || 'base'}` === key);
          if (!item) return;

          await fetch('/api/inventory', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: item.productId,
              variantId: item.variantId,
              stock: editingStock[key] !== undefined ? editingStock[key] : item.stock,
              threshold: editingThreshold[key] !== undefined ? editingThreshold[key] : item.lowStockThreshold,
            }),
          });
        })
      );

      fetchInventory();
      setIsEditing(false);
      setEditingStock({});
      setEditingThreshold({});
    } catch (e) {
      console.error(e);
    } finally {
      setSavingAll(false);
    }
  };

  const filtered = inventory.filter((item) => {
    const matchesSearch =
      !search ||
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      (item.colorName && item.colorName.toLowerCase().includes(search.toLowerCase()));

    const matchesLow = !filterLowStock || item.isLowStock || item.isOutOfStock;
    return matchesSearch && matchesLow;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B132B]">
            Inventory Ledger & Stock Levels
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-variant inventory allocations and quick inline replenishment.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isAdmin && (
            <>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-[#ffffff] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  Edit Stock
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditingStock({});
                      setEditingThreshold({});
                    }}
                    disabled={savingAll}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAll}
                    disabled={savingAll}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-[#ffffff] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-70"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingAll ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </>
          )}

          <button
            onClick={fetchInventory}
            disabled={savingAll}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#ffffff] rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product, SKU, or color variant..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={filterLowStock}
            onChange={(e) => setFilterLowStock(e.target.checked)}
            className="rounded text-rose-600 focus:ring-rose-500"
          />
          <span className="flex items-center gap-1 text-rose-600">
            <AlertTriangle className="w-3.5 h-3.5" /> Show Low / Out of Stock Only
          </span>
        </label>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#ffffff] rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4 pl-6">Product Title</th>
                <th className="p-4">Variant Option</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Threshold</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Quick Stock Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    Loading inventory ledger...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    No items match your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const key = `${item.productId}-${item.variantId || 'base'}`;
                  const currentVal =
                    editingStock[key] !== undefined ? editingStock[key] : item.stock;
                  const currentThreshold =
                    editingThreshold[key] !== undefined ? editingThreshold[key] : item.lowStockThreshold;

                  return (
                    <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6 font-bold text-slate-900 max-w-xs truncate">
                        {item.productName}
                      </td>
                      <td className="p-4">
                        {item.colorName ? (
                          <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-800 font-semibold text-[11px]">
                            {item.colorName} {item.size ? `• ${item.size}` : ''}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Standard</span>
                        )}
                      </td>
                      <td className="p-4 font-mono font-semibold text-slate-600">
                        {item.sku}
                      </td>
                      <td className="p-4 font-black text-base text-[#0B132B]">
                        {item.stock}
                      </td>
                      <td className="p-4 text-slate-400">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={currentThreshold}
                            onChange={(e) =>
                              handleThresholdChange(key, parseInt(e.target.value) || 0)
                            }
                            disabled={savingAll}
                            className="w-16 px-2 py-1 bg-[#ffffff] border border-blue-200 text-slate-900 rounded text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                          />
                        ) : (
                          <>{item.lowStockThreshold} units</>
                        )}
                      </td>
                      <td className="p-4">
                        {item.isOutOfStock ? (
                          <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-full font-bold text-[10px] uppercase">
                            Out of Stock
                          </span>
                        ) : item.isLowStock ? (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full font-bold text-[10px] uppercase">
                            Low Stock Warning
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[10px] uppercase">
                            Healthy Reserve
                          </span>
                        )}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            min="0"
                            value={currentVal}
                            onChange={(e) =>
                              handleStockChange(key, parseInt(e.target.value) || 0)
                            }
                            disabled={!isEditing || savingAll}
                            className={`w-20 px-2.5 py-1 border rounded-lg text-xs font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-600/20 ${
                              isEditing
                                ? 'bg-[#ffffff] border-blue-200 text-slate-900'
                                : 'bg-slate-50 border-transparent text-slate-500 cursor-not-allowed'
                            }`}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
