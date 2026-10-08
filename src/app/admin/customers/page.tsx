'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Users, Mail, Phone, ShoppingBag, DollarSign, Shield, Eye, EyeOff } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function AdminCustomersPage() {
  const { isAdmin, isModerator } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('ADMIN');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail || !newAdminPassword) return;
    setIsAddingAdmin(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newAdminEmail, password: newAdminPassword, role: newAdminRole }),
      });
      if (res.ok) {
        setNewAdminEmail('');
        setNewAdminPassword('');
        alert(`${newAdminRole} added successfully`);
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add user');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setIsAddingAdmin(false);
    }
  };

  useEffect(() => {
    fetch('/api/customers')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCustomers(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleMarkFraud = async (id: string, isFraud: boolean) => {
    if (!confirm(isFraud ? 'Mark this client as fraud?' : 'Unmark this client as fraud?')) return;
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFraud }),
      });
      if (res.ok) {
        setCustomers((prev) => prev.map(c => c.id === id ? { ...c, isFraud, clientTag: isFraud ? 'Fraud Client' : 'Regular Client' } : c));
        // A full refresh would correctly recalculate the tag if we unmarked them, but this optimistic update is ok for now.
        window.location.reload(); 
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeRole = async (id: string, newRole: string) => {
    if (!confirm(`Change role to ${newRole}?`)) return;
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setCustomers((prev) => prev.map(c => c.id === id ? { ...c, role: newRole } : c));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client? This will delete all their orders and reviews.')) return;
    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCustomers((prev) => prev.filter(c => c.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.role === 'CUSTOMER' &&
      (!search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone && c.phone.includes(search)))
  );

  const adminsAndMods = customers.filter((c) => c.role === 'ADMIN' || c.role === 'MODERATOR');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B132B]">
            Customers and Moderators
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage customer accounts, admin access, and platform moderators.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#ffffff] rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name, email, or telephone..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-[#ffffff] rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4 pl-6">Client Profile</th>
                <th className="p-4">Contact Channels</th>
                <th className="p-4">Orders Placed</th>
                <th className="p-4">Lifetime Spend</th>
                <th className="p-4">Last Activity</th>
                <th className="p-4">Member Since</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    Loading clients...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    No client records match your query.
                  </td>
                </tr>
              ) : (
                filtered.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          {client.avatarUrl ? (
                            <Image
                              src={client.avatarUrl}
                              alt={client.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-black text-slate-600">
                              {client.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{client.name}</div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            client.clientTag === 'VIP Client' ? 'text-purple-600 bg-purple-50' :
                            client.clientTag === 'Return Client' ? 'text-orange-600 bg-orange-50' :
                            client.clientTag === 'New Client' ? 'text-green-600 bg-green-50' :
                            client.clientTag === 'Fraud Client' ? 'text-red-600 bg-red-50' :
                            'text-blue-600 bg-blue-50'
                          }`}>
                            {client.clientTag || 'Regular Client'}
                          </span>
                          {client.role !== 'CUSTOMER' && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ml-1 ${
                              client.role === 'ADMIN' ? 'text-indigo-600 bg-indigo-50' : 'text-teal-600 bg-teal-50'
                            }`}>
                              {client.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-800">
                        {client.ordersCount || 0} Orders
                      </span>
                    </td>
                    <td className="p-4 font-black text-base text-[#0B132B]">
                      {formatPrice(client.totalSpent || 0)}
                    </td>
                    <td className="p-4 text-slate-500">
                      {client.lastOrder ? formatDate(client.lastOrder) : 'No orders yet'}
                    </td>
                    <td className="p-4 text-slate-400">
                      {formatDate(client.createdAt)}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {(isAdmin || isModerator) && (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleMarkFraud(client.id, client.clientTag !== 'Fraud Client')}
                            className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-colors ${
                              client.clientTag === 'Fraud Client' 
                              ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' 
                              : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                            }`}
                          >
                            {client.clientTag === 'Fraud Client' ? 'Unmark Fraud' : 'Mark Fraud'}
                          </button>
                          {isAdmin && (
                            <button 
                              onClick={() => handleDeleteClient(client.id)}
                              className="px-2 py-1 text-[10px] font-bold bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Admin List */}
          <div className="bg-[#ffffff] rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-black text-[#0B132B] mb-2">Administrators & Moderators</h2>
            <p className="text-xs text-slate-500 mb-6">
              Current team members with elevated access to the admin panel.
            </p>
            
            <div className="space-y-3">
              {adminsAndMods.map(admin => (
                <div key={admin.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{admin.name}</h3>
                    <div className="text-xs text-slate-500 mt-0.5">{admin.email}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                      admin.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'
                    }`}>
                      {admin.role}
                    </span>
                    {admin.email !== 'admin@bdneeds.com.bd' && (
                      <button 
                        onClick={() => handleDeleteClient(admin.id)}
                        className="px-2 py-1 text-[10px] font-bold bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {adminsAndMods.length === 0 && (
                <div className="text-sm text-slate-500 text-center py-4">No admins or moderators found.</div>
              )}
            </div>
          </div>

          {/* Add Admin Form */}
          <div className="bg-[#ffffff] rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-black text-[#0B132B] mb-2">Add Admin / Moderator</h2>
            <p className="text-xs text-slate-500 mb-6">
              Create a new administrative or moderator account. These credentials are used exclusively for accessing the admin panel and are separated from storefront customer accounts.
            </p>
            
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-800"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="MODERATOR">Moderator</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-800"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showAdminPassword ? "text" : "password"}
                    required
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Secure password"
                    className="w-full px-3 py-2 pr-10 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showAdminPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAddingAdmin}
                className="w-full py-2.5 px-4 bg-[#0B132B] hover:bg-[#1a233a] text-[#ffffff] text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {isAddingAdmin ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
