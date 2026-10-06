'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Truck, Globe } from 'lucide-react';
import { useLanguage, LanguageSwitcher } from '@/context/LanguageContext';
import { Banner } from '@/types';

export default function AnnouncementBar() {
  const { t } = useLanguage();
  const [announcement, setAnnouncement] = useState<Banner | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/banners', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const banner = data.find((b: Banner) => b.type === 'ANNOUNCEMENT');
          if (banner) setAnnouncement(banner);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoaded(true));
  }, []);

  if (!isLoaded) {
    return <div className="bg-[#0B132B] h-[34px] border-b border-[#ffffff]/10" />;
  }

  return (
    <div className="bg-[#0B132B] text-[#ffffff] text-xs font-medium py-1.5 px-4 border-b border-[#ffffff]/10 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden md:flex items-center space-x-6 text-slate-300 text-[11px]">
          <span className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-blue-400" /> {announcement?.subtitle || t('freeShippingNotice')}
          </span>
        </div>

        <div className="w-full md:w-auto flex items-center justify-start md:justify-center gap-1.5 text-[9px] sm:text-[11px] md:text-xs whitespace-nowrap overflow-hidden">
          <span className="inline-flex shrink-0 items-center px-1 py-0.5 rounded text-[8px] font-bold bg-blue-600 text-[#ffffff] tracking-wider uppercase">
            {announcement?.badge || 'Promo'}
          </span>
          <span className="truncate">
            {announcement?.title || t('promoNotice')}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-slate-300 text-[11px]">
          <div className="hidden lg:flex items-center space-x-3">
            <Link href="/track-order" className="hover:text-[#ffffff] transition-colors">
              {t('trackOrder')}
            </Link>
            <span>•</span>
            <Link href="/faq" className="hover:text-[#ffffff] transition-colors">
              {t('helpFaq')}
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-[#ffffff] transition-colors">
              {t('contactUs')}
            </Link>
            <span>•</span>
          </div>
          {/* Compact Language Selector */}
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-slate-400" />
            <LanguageSwitcher className="bg-[#ffffff]/10 border-[#ffffff]/15 text-[#ffffff] scale-90 origin-right" />
          </div>
        </div>
      </div>
    </div>
  );
}
