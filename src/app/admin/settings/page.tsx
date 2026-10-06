'use client';

import React, { useState } from 'react';
import { Save, CheckCircle2, Store, DollarSign, Truck, ShieldCheck, Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminSettingsPage() {
  const { isAdmin } = useAuth();
  const [storeName, setStoreName] = useState('BDNEEDS');
  const [currency, setCurrency] = useState('BDT (৳)');
  const [shippingFeeInsideDhaka, setShippingFeeInsideDhaka] = useState('70');
  const [shippingFeeOutsideDhaka, setShippingFeeOutsideDhaka] = useState('130');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('5000');
  const [taxRate, setTaxRate] = useState('0');
  const [contactEmail, setContactEmail] = useState('contact@bdneeds.com');
  const [contactPhone, setContactPhone] = useState('01811277828');
  const [saved, setSaved] = useState(false);

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
          setContactEmail(data.contactEmail || 'contact@bdneeds.com');
          setContactPhone(data.contactPhone || '01811277828');
        }
      })
      .catch(console.error);
  }, []);

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
