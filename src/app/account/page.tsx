'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  User as UserIcon,
  Package,
  Heart,
  Truck,
  MapPin,
  LogOut,
  ChevronRight,
  Camera,
  Edit3,
  Check,
  X,
  Phone,
  Mail,
  Plus,
  Trash2,
} from 'lucide-react';
import AnnouncementBar from '@/components/storefront/AnnouncementBar';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import MobileBottomNav from '@/components/storefront/MobileBottomNav';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';

interface SavedAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  area: string;
  postalCode: string;
  isDefault: boolean;
}

const ADDRESSES_KEY = 'bdneeds_addresses';

function loadAddresses(userId: string): SavedAddress[] {
  try {
    const raw = localStorage.getItem(`${ADDRESSES_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAddresses(userId: string, addresses: SavedAddress[]) {
  localStorage.setItem(`${ADDRESSES_KEY}_${userId}`, JSON.stringify(addresses));
}

const EMPTY_ADDRESS: Omit<SavedAddress, 'id' | 'isDefault'> = {
  label: 'Home',
  fullName: '',
  phone: '',
  street: '',
  city: '',
  area: '',
  postalCode: '',
};

export default function AccountPage() {
  const router = useRouter();
  const { user, isAdmin, logout, updateAvatar, updateProfile } = useAuth();
  const { totalWishlist } = useWishlist();

  // Avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Profile edit
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Address management
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [addressesLoaded, setAddressesLoaded] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<Omit<SavedAddress, 'id' | 'isDefault'>>(EMPTY_ADDRESS);

  // Load addresses from localStorage on mount (after user is set)
  React.useEffect(() => {
    if (user && !addressesLoaded) {
      setAddresses(loadAddresses(user.id));
      setAddressesLoaded(true);
    }
  }, [user, addressesLoaded]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      await updateAvatar(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const startEditProfile = () => {
    setProfileForm({ name: user!.name, phone: user!.phone || '' });
    setEditingProfile(true);
    setProfileSuccess(false);
  };

  const cancelEditProfile = () => {
    setEditingProfile(false);
    setProfileSuccess(false);
  };

  const saveProfile = async () => {
    if (!profileForm.name.trim()) return;
    if (profileForm.phone.trim().length !== 11) {
      alert('Phone number must be exactly 11 digits');
      return;
    }
    setProfileSaving(true);
    const res = await updateProfile({ name: profileForm.name.trim(), phone: profileForm.phone.trim() });
    setProfileSaving(false);
    if (res.success) {
      setProfileSuccess(true);
      setTimeout(() => {
        setEditingProfile(false);
        setProfileSuccess(false);
      }, 1200);
    } else {
      alert(res.message);
    }
  };

  // Address helpers
  const startAddAddress = () => {
    setAddressForm({ ...EMPTY_ADDRESS, fullName: user!.name, phone: user!.phone || '' });
    setAddingAddress(true);
    setEditingAddressId(null);
  };

  const startEditAddress = (addr: SavedAddress) => {
    const { id, isDefault, ...rest } = addr;
    setAddressForm(rest);
    setEditingAddressId(id);
    setAddingAddress(false);
  };

  const cancelAddress = () => {
    setAddingAddress(false);
    setEditingAddressId(null);
  };

  const saveAddress = () => {
    if (!addressForm.fullName || !addressForm.street || !addressForm.city) {
      alert('Please fill in Name, Street, and City');
      return;
    }
    if (addressForm.phone.trim().length !== 11) {
      alert('Phone number must be exactly 11 digits');
      return;
    }
    let updated: SavedAddress[];
    if (editingAddressId) {
      updated = addresses.map((a) =>
        a.id === editingAddressId ? { ...a, ...addressForm } : a
      );
    } else {
      const isFirst = addresses.length === 0;
      updated = [
        ...addresses,
        { ...addressForm, id: crypto.randomUUID(), isDefault: isFirst },
      ];
    }
    setAddresses(updated);
    saveAddresses(user!.id, updated);
    setAddingAddress(false);
    setEditingAddressId(null);
  };

  const deleteAddress = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    // If we deleted the default, make the first one default
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }
    setAddresses(updated);
    saveAddresses(user!.id, updated);
  };

  const setDefaultAddress = (id: string) => {
    const updated = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    setAddresses(updated);
    saveAddresses(user!.id, updated);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <AnnouncementBar />
        <Header />
        <main className="flex-1 flex items-center justify-center py-16 px-4">
          <div className="max-w-md w-full bg-[#ffffff] rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
            <UserIcon className="w-12 h-12 text-slate-400 mx-auto" />
            <h2 className="text-xl font-bold text-[#0B132B]">Account Access Required</h2>
            <p className="text-xs text-slate-500">
              Please sign in to access your personal profile, addresses, and order history.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/login" className="w-full py-3 bg-[#0B132B] hover:bg-blue-600 text-[#ffffff] font-bold text-xs rounded-xl transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-colors">
                Create an Account
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* ── Profile Card ── */}
          <div className="bg-[#ffffff] rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              {/* Avatar + name */}
              <div className="flex items-center gap-5">
                <div className="relative group shrink-0">
                  <div
                    className="relative w-20 h-20 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {user.avatarUrl ? (
                      <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-2xl text-slate-500">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-5 h-5 text-[#ffffff]" />
                    </div>
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-[#ffffff] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 text-center mt-1">Click to change</p>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-black text-[#0B132B]">{user.name}</h1>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {user.email}
                  </p>
                  {user.phone && (
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {user.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 self-stretch sm:self-auto flex-wrap">
                <button
                  onClick={startEditProfile}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
                <button
                  onClick={() => { logout(); router.push('/'); }}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>

            {/* Edit profile inline form */}
            {editingProfile && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Edit Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-800"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{11}"
                      title="Phone number must be exactly 11 digits"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value.replace(/[^0-9]/g, '') }))}
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-800"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Email (cannot be changed)</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-3 py-2.5 text-sm border border-slate-100 rounded-xl bg-slate-50 text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={saveProfile}
                    disabled={profileSaving}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-[#ffffff] rounded-xl text-xs font-bold transition-colors flex items-center gap-2 disabled:opacity-70"
                  >
                    {profileSaving ? (
                      <div className="w-3.5 h-3.5 border-2 border-[#ffffff] border-t-transparent rounded-full animate-spin" />
                    ) : profileSuccess ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : null}
                    {profileSuccess ? 'Saved!' : 'Save Changes'}
                  </button>
                  <button
                    onClick={cancelEditProfile}
                    className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Quick Nav ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link href="/orders" className="bg-[#ffffff] rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0B132B]">My Orders</h3>
                <p className="text-xs text-slate-500 mt-1">View recent purchases, delivery receipts, and invoices.</p>
              </div>
            </Link>

            <Link href="/wishlist" className="bg-[#ffffff] rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold bg-slate-100 px-2.5 py-1 rounded-full text-slate-600">
                  {totalWishlist} saved
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0B132B]">Saved Wishlist</h3>
                <p className="text-xs text-slate-500 mt-1">View and manage your bookmarked products.</p>
              </div>
            </Link>

            <Link href="/track-order" className="bg-[#ffffff] rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Truck className="w-6 h-6" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0B132B]">Track Shipment</h3>
                <p className="text-xs text-slate-500 mt-1">Check live courier milestones with your tracking code.</p>
              </div>
            </Link>
          </div>

          {/* ── Addresses ── */}
          <div className="bg-[#ffffff] rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0B132B] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" /> Delivery Addresses
              </h3>
              {!addingAddress && !editingAddressId && (
                <button
                  onClick={startAddAddress}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-[#ffffff] rounded-lg text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New
                </button>
              )}
            </div>

            {/* Address Form */}
            {(addingAddress || editingAddressId) && (
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                <h4 className="text-sm font-bold text-slate-800">
                  {editingAddressId ? 'Edit Address' : 'Add New Address'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Label</label>
                    <select
                      value={addressForm.label}
                      onChange={(e) => setAddressForm((f) => ({ ...f, label: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-[#ffffff]"
                    >
                      <option>Home</option>
                      <option>Work</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Full Name
                      <span className="ml-1.5 text-[10px] font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">From profile</span>
                    </label>
                    <input
                      type="text"
                      value={addressForm.fullName}
                      disabled
                      className="w-full px-3 py-2.5 text-sm border border-slate-100 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{11}"
                      title="Phone number must be exactly 11 digits"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm((f) => ({ ...f, phone: e.target.value.replace(/[^0-9]/g, '') }))}
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-800"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Street / House *</label>
                    <input
                      type="text"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm((f) => ({ ...f, street: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                      placeholder="House/Road/Block"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Area / Thana</label>
                    <input
                      type="text"
                      value={addressForm.area}
                      onChange={(e) => setAddressForm((f) => ({ ...f, area: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                      placeholder="Mirpur, Gulshan..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">City / District *</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                      placeholder="Dhaka, Chittagong..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm((f) => ({ ...f, postalCode: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                      placeholder="1216"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={saveAddress}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-[#ffffff] rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Address
                  </button>
                  <button
                    onClick={cancelAddress}
                    className="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Address List */}
            {addresses.length === 0 && !addingAddress ? (
              <div className="text-center py-8">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No addresses saved yet.</p>
                <button
                  onClick={startAddAddress}
                  className="mt-3 text-xs font-bold text-blue-600 hover:underline"
                >
                  + Add your first address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-4 rounded-2xl border-2 space-y-1 text-xs transition-all ${
                      addr.isDefault
                        ? 'border-blue-500 bg-blue-50/20'
                        : 'border-slate-100 bg-[#ffffff] hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {!addr.isDefault && (
                          <button
                            onClick={() => setDefaultAddress(addr.id)}
                            className="text-[10px] text-slate-400 hover:text-blue-600 font-semibold px-1.5 py-0.5 rounded hover:bg-blue-50 transition-colors"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => startEditAddress(addr)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteAddress(addr.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-800 font-semibold">{addr.fullName}</p>
                    <p className="text-slate-600">{addr.street}</p>
                    {addr.area && <p className="text-slate-600">{addr.area}, {addr.city}</p>}
                    {!addr.area && <p className="text-slate-600">{addr.city}</p>}
                    {addr.postalCode && <p className="text-slate-500">Postal: {addr.postalCode}</p>}
                    {addr.phone && <p className="text-slate-400 pt-1">{addr.phone}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
