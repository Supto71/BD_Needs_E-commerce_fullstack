'use client';

import React, { useState } from 'react';
import { Save, CheckCircle2, Store, Truck, Globe, Mail, Phone, Eye, EyeOff, Clock, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminSettingsPage() {
  const { isAdmin } = useAuth();
  const [storeName, setStoreName] = useState('BDNEEDS');
  const [currency, setCurrency] = useState('BDT (৳)');
  const [shippingFeeInsideDhaka, setShippingFeeInsideDhaka] = useState('70');
  const [shippingFeeOutsideDhaka, setShippingFeeOutsideDhaka] = useState('130');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('5000');
  const [taxRate, setTaxRate] = useState('0');
  const [contactEmail, setContactEmail] = useState('contact@bdneeds.com.bd');
  const [contactPhone, setContactPhone] = useState('01811277828');
  const [saved, setSaved] = useState(false);

  // Contact Messages State
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [expandedMsg, setExpandedMsg] = useState<string | null>(null);

  // Announcement Bar State
  const [announcementId, setAnnouncementId] = useState<string | null>(null);
  const [freeDeliveryText, setFreeDeliveryText] = useState('FREE STANDARD SHIPPING ON ORDERS OVER ৳99');
  const [promoText, setPromoText] = useState('GET 20% OFF ALL ACCESSORIES THIS WEEKEND');
  const [promoBadge, setPromoBadge] = useState('PROMO');
  const [promoLink, setPromoLink] = useState('/shop');

  React.useEffect(() => {
    fetch('/api/banners')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const banner = data.find((b: any) => b.type === 'ANNOUNCEMENT');
          if (banner) {
            setAnnouncementId(banner.id);
            setFreeDeliveryText(banner.subtitle || '');
            setPromoText(banner.title || '');
            setPromoBadge(banner.badge || '');
            setPromoLink(banner.ctaLink || '');
          }
        }
      })
      .catch(console.error);

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setStoreName(data.storeName || 'BDNEEDS');
          setCurrency('BDT (৳)');
          setShippingFeeInsideDhaka(data.shippingFeeInsideDhaka?.toString() || '70');
          setShippingFeeOutsideDhaka(data.shippingFeeOutsideDhaka?.toString() || '130');
          setFreeShippingThreshold(data.freeShippingThreshold?.toString() || '5000');
          setTaxRate(data.taxRate?.toString() || '0');
          setContactEmail(data.contactEmail || 'contact@bdneeds.com.bd');
          setContactPhone(data.contactPhone || '01811277828');
        }
      })
      .catch(console.error);

    // Fetch contact messages
    fetch('/api/contact')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch(console.error)
      .finally(() => setMessagesLoading(false));
  }, []);

  const handleMarkRead = async (id: string, isRead: boolean) => {
    await fetch('/api/contact', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isRead }),
    });
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead } : m));
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message? It will be moved to the recycle bin.')) return;
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Save Store Settings
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName,
          currency: 'BDT',
          shippingFeeInsideDhaka: Number(shippingFeeInsideDhaka),
          shippingFeeOutsideDhaka: Number(shippingFeeOutsideDhaka),
          freeShippingThreshold: Number(freeShippingThreshold),
          taxRate: Number(taxRate),
          contactEmail,
          contactPhone
        })
      });
    } catch (err) {
      console.error(err);
    }

    // Save Announcement Banner
    const payload = {
      type: 'ANNOUNCEMENT',
      title: promoText,
      subtitle: freeDeliveryText,
      badge: promoBadge,
      ctaLink: promoLink,
      ctaText: 'Shop Now',
      image: '',
      description: '',
      price: 0,
      discount: 0,
      isActive: true,
      order: 1
    };

    try {
      if (announcementId) {
        await fetch(`/api/banners/${announcementId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        const res = await fetch('/api/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.id) setAnnouncementId(data.id);
      }
    } catch (err) {
      console.error(err);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0B132B]">
          Store Settings & Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure regional currencies, delivery thresholds, tax rates, and support channels.
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-2xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Global storefront configuration parameters updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#ffffff] rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
          <h3 className="text-base font-bold text-[#0B132B] flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-600" />
            Brand Identity & Channels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Store Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Display Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
              >
                <option value="BDT (৳)">BDT (৳) - Bangladeshi Taka</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Concierge Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact Phone Number
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#ffffff] rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
          <h3 className="text-base font-bold text-[#0B132B] flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-600" />
            Shipping & Tax Rules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Inside Dhaka Shipping Fee (BDT)
              </label>
              <input
                type="number"
                value={shippingFeeInsideDhaka}
                onChange={(e) => setShippingFeeInsideDhaka(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Outside Dhaka Shipping Fee (BDT)
              </label>
              <input
                type="number"
                value={shippingFeeOutsideDhaka}
                onChange={(e) => setShippingFeeOutsideDhaka(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Free Shipping Threshold (BDT)
              </label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estimated Sales Tax Rate (%)
              </label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#ffffff] rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
          <h3 className="text-base font-bold text-[#0B132B] flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            Announcement Bar Settings
          </h3>
          <p className="text-xs text-slate-500">
            Customize the message that appears at the very top of the website.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Free Delivery Text (Left Side, Non-clickable)
              </label>
              <input
                type="text"
                value={freeDeliveryText}
                onChange={(e) => setFreeDeliveryText(e.target.value)}
                placeholder="e.g. FREE STANDARD SHIPPING ON ORDERS OVER ৳99"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Promo Badge Text (Inside Blue Box)
              </label>
              <input
                type="text"
                value={promoBadge}
                onChange={(e) => setPromoBadge(e.target.value)}
                placeholder="e.g. PROMO"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Promo Middle Text (Clickable)
              </label>
              <input
                type="text"
                value={promoText}
                onChange={(e) => setPromoText(e.target.value)}
                placeholder="e.g. GET 20% OFF ALL ACCESSORIES THIS WEEKEND"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Promo Redirect Link
              </label>
              <input
                type="text"
                value={promoLink}
                onChange={(e) => setPromoLink(e.target.value)}
                placeholder="e.g. /shop or /category/accessories"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Contact Messages */}
        <div className="bg-[#ffffff] rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0B132B] flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              Contact Messages
              {messages.filter(m => !m.isRead).length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-blue-600 text-[#ffffff] text-[10px] font-bold rounded-full">
                  {messages.filter(m => !m.isRead).length} new
                </span>
              )}
            </h3>
            <span className="text-xs text-slate-400">{messages.length} total</span>
          </div>

          {messagesLoading ? (
            <p className="text-xs text-slate-400 py-4 text-center">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No contact messages yet.</p>
          ) : (
            <div className="space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-2xl border p-4 transition-all ${
                    msg.isRead ? 'border-slate-100 bg-slate-50' : 'border-blue-100 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {!msg.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                        )}
                        <span className="text-xs font-bold text-[#0B132B]">{msg.name}</span>
                        <span className="text-xs text-slate-500">&lt;{msg.email}&gt;</span>
                      </div>
                      {msg.subject && (
                        <p className="text-xs font-semibold text-slate-700 mt-1">{msg.subject}</p>
                      )}
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        {new Date(msg.createdAt).toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setExpandedMsg(expandedMsg === msg.id ? null : msg.id)}
                        className="text-[10px] font-bold text-blue-600 hover:underline"
                      >
                        {expandedMsg === msg.id ? 'Hide' : 'View'}
                      </button>
                      <button
                        onClick={() => handleMarkRead(msg.id, !msg.isRead)}
                        title={msg.isRead ? 'Mark as unread' : 'Mark as read'}
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        {msg.isRead ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        title="Delete message"
                        className="text-slate-400 hover:text-rose-600 transition-colors ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {expandedMsg === msg.id && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      <a
                        href={`mailto:${msg.email}`}
                        className="inline-flex items-center gap-1 mt-3 text-[10px] font-bold text-blue-600 hover:underline"
                      >
                        <Mail className="w-3 h-3" /> Reply via Email
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          {isAdmin && (
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-[#ffffff] rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-md"
            >
              <Save className="w-4 h-4" />
              Save Store Configuration
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
