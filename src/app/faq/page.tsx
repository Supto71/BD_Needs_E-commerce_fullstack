'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Truck, RefreshCw, ShieldCheck, CreditCard } from 'lucide-react';
import AnnouncementBar from '@/components/storefront/AnnouncementBar';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import MobileBottomNav from '@/components/storefront/MobileBottomNav';
import { useLanguage } from '@/context/LanguageContext';

export default function FAQPage() {
  const { language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const translations = {
    en: {
      subtitle: 'Help Center & Knowledge Base',
      title: 'Frequently Asked Questions',
      desc: 'Everything you need to know about purchasing, warranties, shipping, and returns.',
      faqs: [
        {
          category: 'Shipping & Delivery',
          icon: Truck,
          q: 'What are the delivery charges?',
          a: 'Our delivery charge is 70 BDT inside Dhaka and 130 BDT outside Dhaka.',
        },
        {
          category: 'Returns & Refunds',
          icon: RefreshCw,
          q: 'What is your return policy?',
          a: 'Products can be returned within a maximum of 7 days of delivery. However, the product must be unused, undamaged, and accompanied by its original packaging, tags, and invoice.',
        },
        {
          category: 'Returns & Refunds',
          icon: ShieldCheck,
          q: 'Are there any non-returnable items?',
          a: 'Used products, specific discounted items purchased during promotional offers, and customized products are generally non-returnable or non-exchangeable.',
        },
        {
          category: 'Returns & Refunds',
          icon: RefreshCw,
          q: 'How does the refund process work?',
          a: 'Once the returned product reaches our warehouse and passes quality checks, the refund will be processed within 7 to 10 working days. Refunds will be issued through the original payment method (bKash, card, or bank account). For Cash on Delivery (COD) orders, valid bank account or mobile wallet details must be provided.',
        },
        {
          category: 'Payments & Billing',
          icon: CreditCard,
          q: 'What payment methods do you accept?',
          a: 'We accept bKash and Nagad (01811277828), as well as Cash on Delivery (COD).',
        },
        {
          category: 'Privacy',
          icon: ShieldCheck,
          q: 'What is your privacy policy?',
          a: 'By using our website and services, you agree to our general terms and conditions. All customer personal data (name, phone number, address) is kept strictly confidential and is never shared with third parties.',
        },
      ],
      termsTitle: 'Terms & Conditions',
      termsContent1: 'By using bdneeds and its services, you agree to our general terms and conditions. We reserve the right to update or modify these terms at any time without prior notice.',
      termsPrivacyTitle: 'Privacy & Data Security',
      termsPrivacyContent: 'All customer personal data (such as name, phone number, and address) is kept strictly confidential and is never shared with third parties for marketing purposes. Your data is used exclusively for processing and delivering your orders.',
      termsPricingTitle: 'Pricing & Availability',
      termsPricingContent: 'All prices are subject to change. We make every effort to ensure our inventory is accurate, but in rare cases where an item is out of stock after an order is placed, we will notify you immediately and offer a full refund or an alternative product.',
      returnTitle: 'Return & Refund Policy',
      returnConditionsTitle: 'Return Conditions',
      returnConditions: [
        'Products can be returned within a maximum of 7 days of delivery.',
        'The product must be unused, undamaged, and in its original condition.',
        'Original packaging, tags, and invoice must be provided with the return.',
        'Used products, customized items, and specific discounted promotional items are non-returnable.'
      ],
      refundProcessTitle: 'Refund Process',
      refundProcess1: 'Once the returned product reaches our warehouse and passes our quality check, the refund will be processed within 7 to 10 working days.',
      refundProcess2: 'Refunds are issued through the original payment method (bKash, card, or bank account). For Cash on Delivery (COD) orders, valid bank account or mobile wallet details must be provided by the customer.'
    },
    bn: {
      subtitle: 'হেল্প সেন্টার ও সাধারণ প্রশ্নাবলী',
      title: 'সচরাচর জিজ্ঞাসিত প্রশ্ন (FAQ)',
      desc: 'কেনাকাটা, ওয়ারেন্টি, শিপিং এবং রিটার্ন সম্পর্কে আপনার যা জানা প্রয়োজন।',
      faqs: [
        {
          category: 'শিপিং ও ডেলিভারি',
          icon: Truck,
          q: 'ডেলিভারি চার্জ কত?',
          a: 'ঢাকার ভেতরে আমাদের ডেলিভারি চার্জ ৭০ টাকা এবং ঢাকার বাইরে ১৩০ টাকা।',
        },
        {
          category: 'রিটার্ন ও রিফান্ড',
          icon: RefreshCw,
          q: 'আপনাদের রিটার্ন পলিসি কী?',
          a: 'পণ্য ডেলিভারির সর্বোচ্চ ৭ দিনের মধ্যে রিটার্ন করা যাবে। তবে পণ্যটি অবশ্যই অব্যবহৃত, অক্ষত এবং অরিজিনাল প্যাকেজিং, ট্যাগ ও ইনভয়েসসহ হতে হবে।',
        },
        {
          category: 'রিটার্ন ও রিফান্ড',
          icon: ShieldCheck,
          q: 'কোন পণ্যগুলো রিটার্ন করা যায় না?',
          a: 'ব্যবহৃত পণ্য, প্রমোশনাল অফারে কেনা নির্দিষ্ট ডিসকাউন্টেড পণ্য এবং কাস্টমাইজড পণ্য সাধারণত রিটার্ন বা এক্সচেঞ্জ করা যায় না।',
        },
        {
          category: 'রিটার্ন ও রিফান্ড',
          icon: RefreshCw,
          q: 'রিফান্ড প্রক্রিয়া কীভাবে কাজ করে?',
          a: 'রিটার্ন করা পণ্যটি আমাদের ওয়্যারহাউসে পৌঁছানোর এবং কোয়ালিটি চেকিং পার হওয়ার ৭ থেকে ১০ কার্যদিবসের মধ্যে রিফান্ড প্রসেস করা হবে। যে মাধ্যমে পেমেন্ট করা হয়েছিল (বিকাশ, কার্ড বা ব্যাংক), সেই মাধ্যমেই রিফান্ড দেওয়া হবে। ক্যাশ অন ডেলিভারি (COD) অর্ডারের ক্ষেত্রে, গ্রাহককে সঠিক ব্যাংক অ্যাকাউন্ট বা মোবাইল ওয়ালেট নম্বর দিতে হবে।',
        },
        {
          category: 'পেমেন্ট ও বিলিং',
          icon: CreditCard,
          q: 'আপনারা কী কী পেমেন্ট মেথড সাপোর্ট করেন?',
          a: 'আমরা বিকাশ ও নগদ (01811277828) গ্রহণ করি, পাশাপাশি ক্যাশ অন ডেলিভারি (COD) সুবিধাও রয়েছে।',
        },
        {
          category: 'গোপনীয়তা (Privacy)',
          icon: ShieldCheck,
          q: 'আপনাদের প্রাইভেসি পলিসি কী?',
          a: 'আমাদের ওয়েবসাইট এবং সেবা ব্যবহারের মাধ্যমে আপনি আমাদের সাধারণ শর্তাবলীতে সম্মতি দিচ্ছেন। গ্রাহকের সব ব্যক্তিগত তথ্য (নাম, ফোন নম্বর, ঠিকানা) সম্পূর্ণ গোপন রাখা হয় এবং কখনওই তৃতীয় কোনো পক্ষের সাথে শেয়ার করা হয় না।',
        },
      ],
      termsTitle: 'শর্তাবলী (Terms & Conditions)',
      termsContent1: 'BDNeeds এবং এর সেবা ব্যবহারের মাধ্যমে আপনি আমাদের সাধারণ শর্তাবলীতে সম্মতি দিচ্ছেন। আমরা কোনো পূর্ব ঘোষণা ছাড়াই যেকোনো সময় এই শর্তাবলী আপডেট বা পরিবর্তন করার অধিকার সংরক্ষণ করি।',
      termsPrivacyTitle: 'গোপনীয়তা ও ডেটা সুরক্ষা (Privacy & Data Security)',
      termsPrivacyContent: 'গ্রাহকের সব ব্যক্তিগত তথ্য (যেমন নাম, ফোন নম্বর এবং ঠিকানা) সম্পূর্ণ গোপন রাখা হয় এবং মার্কেটিংয়ের উদ্দেশ্যে কখনওই তৃতীয় কোনো পক্ষের সাথে শেয়ার করা হয় পণ্ডিত হয় না। আপনার ডেটা শুধুমাত্র আপনার অর্ডার প্রসেস এবং ডেলিভারি করার জন্য ব্যবহৃত হয়।',
      termsPricingTitle: 'মূল্য এবং প্রাপ্যতা (Pricing & Availability)',
      termsPricingContent: 'সব পণ্যের মূল্য পরিবর্তনশীল। আমরা আমাদের ইনভেন্টরি ১০০% সঠিক রাখার সর্বোচ্চ চেষ্টা করি, তবে বিরল ক্ষেত্রে কোনো অর্ডার প্লেস করার পর যদি পণ্য স্টক আউট হয়ে যায়, তবে আমরা আপনাকে অবিলম্বে জানাবো এবং সম্পূর্ণ রিফান্ড অথবা বিকল্প পণ্যের অফার দেবো।',
      returnTitle: 'রিটার্ন এবং রিফান্ড পলিসি',
      returnConditionsTitle: 'রিটার্নের শর্তাবলী',
      returnConditions: [
        'পণ্য ডেলিভারির সর্বোচ্চ ৭ দিনের মধ্যে রিটার্ন করা যাবে।',
        'পণ্যটি অবশ্যই অব্যবহৃত, অক্ষত এবং এর অরিজিনাল কন্ডিশনে থাকতে হবে।',
        'রিটার্নের সময় অরিজিনাল প্যাকেজিং, ট্যাগ এবং ইনভয়েস সাথে দিতে হবে।',
        'ব্যবহৃত পণ্য, কাস্টমাইজড আইটেম এবং নির্দিষ্ট ডিসকাউন্টেড প্রমোশনাল আইটেম রিটার্নযোগ্য নয়।'
      ],
      refundProcessTitle: 'রিফান্ড প্রক্রিয়া',
      refundProcess1: 'রিটার্ন করা পণ্যটি আমাদের ওয়্যারহাউসে পৌঁছানোর পর কোয়ালিটি চেকিং পার হলে, ৭ থেকে ১০ কার্যদিবসের মধ্যে রিফান্ড প্রসেস করা হবে।',
      refundProcess2: 'যে মাধ্যমে পেমেন্ট করা হয়েছিল (বিকাশ, কার্ড বা ব্যাংক), রিফান্ডটি সেই মাধ্যমেই দেওয়া হবে। ক্যাশ অন ডেলিভারি (COD) অর্ডারের ক্ষেত্রে, গ্রাহককে সঠিক ব্যাংক অ্যাকাউন্ট বা মোবাইল ওয়ালেট ডিটেইলস প্রদান করতে হবে।'
    }
  };

  const current = translations[language];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">
              {current.subtitle}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#0B132B] mt-1">
              {current.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              {current.desc}
            </p>
          </div>

          <div className="bg-[#ffffff] rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs mb-12">
            {current.faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              const Icon = faq.icon;
              return (
                <div key={idx} className="p-6 transition-colors hover:bg-slate-50/50">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm sm:text-base text-[#0B132B]">
                        {faq.q}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="pt-4 pl-11 text-xs sm:text-sm text-slate-600 leading-relaxed animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div id="terms" className="bg-[#ffffff] rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs mb-8 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-black text-[#0B132B] mb-4 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              {current.termsTitle}
            </h2>
            <div className="prose prose-sm max-w-none text-slate-600 space-y-4">
              <p>{current.termsContent1}</p>
              <h3 className="font-bold text-[#0B132B] text-base mt-6 mb-2">{current.termsPrivacyTitle}</h3>
              <p>{current.termsPrivacyContent}</p>
              <h3 className="font-bold text-[#0B132B] text-base mt-6 mb-2">{current.termsPricingTitle}</h3>
              <p>{current.termsPricingContent}</p>
            </div>
          </div>

          <div id="returns" className="bg-[#ffffff] rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-black text-[#0B132B] mb-4 flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-blue-600" />
              {current.returnTitle}
            </h2>
            <div className="prose prose-sm max-w-none text-slate-600 space-y-4">
              <h3 className="font-bold text-[#0B132B] text-base mt-4 mb-2">{current.returnConditionsTitle}</h3>
              <ul className="list-disc pl-5 space-y-1">
                {current.returnConditions.map((cond, i) => (
                  <li key={i}>{cond}</li>
                ))}
              </ul>
              
              <h3 className="font-bold text-[#0B132B] text-base mt-6 mb-2">{current.refundProcessTitle}</h3>
              <p>{current.refundProcess1}</p>
              <p>{current.refundProcess2}</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
