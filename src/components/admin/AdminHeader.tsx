'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, ExternalLink, Globe, Camera } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { useLanguage, LanguageSwitcher } from '@/context/LanguageContext';

export default function AdminHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();
  const { user, logout, updateAvatar } = useAuth();
  const { t } = useLanguage();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);

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
      const base64String = reader.result as string;
      const res = await updateAvatar(base64String);
      if (!res.success) {
        alert(res.message);
      }
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <header className="h-16 bg-[#ffffff] border-b border-slate-200 px-6 flex items-center justify-between z-30">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onMenuClick}
          className="md:hidden p-1.5 -ml-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
        <span className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {t('adminLiveSync')}
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Admin Language Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
          <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          <LanguageSwitcher />
        </div>

        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <span>{t('adminViewStore')}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <div className="h-4 w-px bg-slate-200" />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-900 block leading-tight">
              {user?.name || 'Administrator'}
            </span>
            <span className="text-[10px] text-slate-400 block leading-tight">
              {user?.email || 'admin@bdneeds.com.bd'}
            </span>
          </div>

          <div className="relative group shrink-0">
            <div 
              className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {user?.avatarUrl ? (
                <Image src={user.avatarUrl} alt={user.name || 'Admin'} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-sm text-slate-500">
                  {user?.name?.charAt(0) || 'A'}
                </div>
              )}
              {/* Overlay for hover */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-3.5 h-3.5 text-[#ffffff]" />
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-3.5 h-3.5 border-2 border-[#ffffff] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <button
            onClick={() => {
              logout();
              router.push('/admin/login');
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
            title={t('logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
