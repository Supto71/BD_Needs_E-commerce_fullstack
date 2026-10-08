import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Award, Sparkles, Truck, Phone, ArrowRight, MapPin } from 'lucide-react';
import AnnouncementBar from '@/components/storefront/AnnouncementBar';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import MobileBottomNav from '@/components/storefront/MobileBottomNav';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1">

        {/* Hero Section */}
        <section className="relative bg-[#0B132B] text-[#ffffff] py-20 lg:py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="text-xs font-extrabold tracking-widest uppercase text-blue-400 mb-3 block">
              ABOUT BDNEEDS
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-3xl mx-auto">
              আপনার দৈনন্দিন জীবন,<br />আরও সহজ করি আমরা
            </h1>
            <p className="mt-6 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              BDNeeds একটি বিশ্বস্ত বাংলাদেশী ই-কমার্স প্ল্যাটফর্ম। আমরা ইলেকট্রনিক্স, ফ্যাশন, জুতা, বিউটি, অ্যাক্সেসরিজ এবং গৃহস্থালি পণ্যসহ বিভিন্ন ক্যাটাগরিতে সেরা মানের পণ্য সাশ্রয়ী মূল্যে আপনার দরজায় পৌঁছে দিই।
            </p>
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent pointer-events-none" />
        </section>

        {/* Stats Strip */}
        <section className="bg-blue-600 text-[#ffffff] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {[
                { value: '১০০+', label: 'পণ্য' },
                { value: '১০+', label: 'ক্যাটাগরি' },
                { value: '৭ দিন', label: 'রিটার্ন পলিসি' },
                { value: '২৪/৭', label: 'অনলাইন সাপোর্ট' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl sm:text-3xl font-black">{stat.value}</p>
                  <p className="text-xs text-blue-100 mt-1 font-semibold uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-slate-50 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-16">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0B132B]">
                আমাদের লক্ষ্য ও মিশন
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                যেসব মূলনীতি আমাদের প্রতিটি কাজকে পরিচালিত করে।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: ShieldCheck,
                  color: 'blue',
                  title: 'বিশ্বাসযোগ্যতা',
                  desc: 'প্রতিটি অর্ডারে সম্পূর্ণ সততা ও স্বচ্ছতার ভিত্তিতে দীর্ঘমেয়াদী সম্পর্ক গড়ে তোলা আমাদের অঙ্গীকার।',
                },
                {
                  icon: Award,
                  color: 'emerald',
                  title: 'মানসম্পন্ন পণ্য',
                  desc: 'দেশ-বিদেশ থেকে সেরা ও খাঁটি পণ্য সংগ্রহ করে সরাসরি আপনার কাছে পৌঁছে দেওয়া।',
                },
                {
                  icon: Truck,
                  color: 'purple',
                  title: 'দ্রুত ডেলিভারি',
                  desc: 'আধুনিক প্রযুক্তি ব্যবহার করে দেশের সর্বত্র দ্রুততম ডেলিভারি এবং নির্ভরযোগ্য কাস্টমার সাপোর্ট নিশ্চিত করা।',
                },
                {
                  icon: Sparkles,
                  color: 'orange',
                  title: 'সাশ্রয়ী মূল্য',
                  desc: 'সেরা মানের পণ্য সবচেয়ে সাশ্রয়ী মূল্যে প্রদান করে কাস্টমারদের সর্বোচ্চ সন্তুষ্টি নিশ্চিত করা।',
                },
              ].map((item) => {
                const Icon = item.icon;
                const colorMap: Record<string, string> = {
                  blue: 'bg-blue-50 text-blue-600',
                  emerald: 'bg-emerald-50 text-emerald-600',
                  purple: 'bg-purple-50 text-purple-600',
                  orange: 'bg-orange-50 text-orange-600',
                };
                return (
                  <div key={item.title} className="bg-[#ffffff] rounded-3xl p-8 border border-slate-100 shadow-sm space-y-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[item.color]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-[#0B132B]">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact Info Strip */}
        <section className="py-14 bg-[#ffffff] border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0B132B] uppercase tracking-wider mb-1">আমাদের ঠিকানা</p>
                  <p className="text-sm text-slate-600">খিলবাড়িরটেক, ভাটারা<br />ঢাকা – ১২১২, বাংলাদেশ</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0B132B] uppercase tracking-wider mb-1">যোগাযোগ করুন</p>
                  <p className="text-sm text-slate-600">+880 1811-277828</p>
                  <p className="text-sm text-slate-600">support@bdneeds.com.bd</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-16 bg-[#0B132B] text-center">
          <div className="max-w-2xl mx-auto px-4 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-[#ffffff]">
              এখনই কেনাকাটা শুরু করুন
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              ৭ দিনের সহজ রিটার্ন পলিসি এবং সারাদেশে দ্রুত ডেলিভারি উপভোগ করুন।<br />
              পোশাক, ইলেকট্রনিক্স, শিশু পণ্য এবং স্পোর্টস সরঞ্জামের বিশাল কালেকশন দেখুন।
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-[#ffffff] font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-md"
            >
              সকল পণ্য দেখুন
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
