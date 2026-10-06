'use client';

import React from 'react';
import { ShieldCheck, Truck, RefreshCw, Headphones } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function TrustSection() {
  const { t } = useLanguage();

  const features = [
    {
      icon: ShieldCheck,
      title: t('trustWarrantyTitle'),
      desc: t('trustWarrantyDesc'),
    },
    {
      icon: Truck,
      title: t('trustFreeShippingTitle'),
      desc: t('trustFreeShippingDesc'),
    },
    {
      icon: Headphones,
      title: t('trustSupportTitle'),
      desc: t('trustSupportDesc'),
    },
    {
      icon: RefreshCw,
      title: t('trustSecurityTitle'),
      desc: t('trustSecurityDesc'),
    },
  ];

  return (
    <section className="py-16 bg-slate-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-4 p-5 rounded-2xl bg-[#ffffff] border border-slate-100 shadow-2xs hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0B132B] mb-1">
                    {f.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
