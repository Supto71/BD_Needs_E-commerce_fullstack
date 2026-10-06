'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data.slice(0, 5));
        }
      })
      .catch(console.error);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#0B132B] text-[#ffffff] pt-16 pb-24 lg:pb-12 border-t border-[#ffffff]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#ffffff]/10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center">
              <Link href="/">
                <Image
                  src="/logomain.png"
                  alt="BdNeeds Logo"
                  width={160}
                  height={48}
                  className="object-contain h-10 sm:h-12 w-auto"
                  style={{ filter: 'brightness(0) invert(1)' }}
                  priority
                />
              </Link>
            </div>

            <p className="text-sm text-slate-300 max-w-sm leading-relaxed">
              {t('footerAboutDesc')}
            </p>


          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase text-[#ffffff] mb-4">
              {t('categories')}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link href="/shop" className="hover:text-blue-400 transition-colors">
                  {t('allCategories')}
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.slug}`} className="hover:text-blue-400 transition-colors">
                    {t(cat.slug as any, cat.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase text-[#ffffff] mb-4">
              {t('customerCare')}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link href="/track-order" className="hover:text-blue-400 transition-colors">
                  {t('trackOrder')}
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-blue-400 transition-colors">
                  {t('myOrders')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-blue-400 transition-colors">
                  {t('helpFaq')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-400 transition-colors">
                  {t('contactUs')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-400 transition-colors">
                  {t('aboutUs')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold tracking-wider uppercase text-[#ffffff] mb-2">
              Contact Us
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Dhaka, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>+880 1811-277828</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>contact@bdneeds.com</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Sat – Thu: 09:00 – 21:00 BST | 24/7 Online Support</span>
              </div>
              <div className="flex items-start gap-2">
                <a href="https://www.facebook.com/profile.php?id=61589093341884" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#ffffff] transition-colors">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                  <span>BdNeeds</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods & Legal Copyright */}
        <div className="pt-8 flex flex-col items-center justify-center gap-6 text-xs text-slate-400">

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            <p>© {new Date().getFullYear()} {t('allRightsReserved')}</p>
            <div className="flex items-center gap-4 border-l border-r border-slate-700 px-4">
              <Link href="/faq#terms" className="hover:text-blue-400 transition-colors">{t('footerTerms')}</Link>
              <Link href="/faq#returns" className="hover:text-blue-400 transition-colors">{t('footerRefund')}</Link>
            </div>
            <p className="font-semibold text-slate-300">DBID: <span className="text-[#ffffff]">Pending</span></p>
          </div>
        </div>
      </div>
    </footer>
  );
}
