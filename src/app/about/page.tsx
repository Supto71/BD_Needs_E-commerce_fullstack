import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Award, Sparkles, Globe2, ArrowRight } from 'lucide-react';
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
        {/* Editorial Hero */}
        <section className="relative bg-[#0B132B] text-[#ffffff] py-20 lg:py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-3xl">
            <span className="text-xs font-extrabold tracking-widest uppercase text-blue-400 mb-3 block">
              ABOUT BDNEEDS
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
              Your Daily Life, Made Easier
            </h1>
            <p className="mt-6 text-sm sm:text-base text-slate-300 leading-relaxed">
              We are more than just an e-commerce platform; we are committed to making your daily life easier and more convenient. Our core pledge is to deliver the best quality products at affordable prices right to your doorstep.
            </p>
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent pointer-events-none" />
        </section>

        {/* Pillars Grid */}
        <section className="py-20 bg-slate-50 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-16">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0B132B]">
                Our Mission & Vision
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                The core principles that drive everything we do.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#ffffff] rounded-3xl p-8 border border-slate-100 shadow-2xs space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0B132B]">Building Trust</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Establishing a long-term relationship based on absolute honesty and transparency in every order.
                </p>
              </div>

              <div className="bg-[#ffffff] rounded-3xl p-8 border border-slate-100 shadow-2xs space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0B132B]">Quality Products</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Bringing the finest and most genuine products from home and abroad straight to you.
                </p>
              </div>

              <div className="bg-[#ffffff] rounded-3xl p-8 border border-slate-100 shadow-2xs space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0B132B]">Prompt Service</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Ensuring the fastest delivery and reliable customer support through the use of modern technology.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Action Banner */}
        <section className="py-16 bg-[#ffffff] text-center">
          <div className="max-w-2xl mx-auto px-4 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B132B]">
              Experience The Collection Firsthand
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Enjoy 7-day easy returns and fast delivery nationwide. Shop our diverse range of clothing, electronics, kids' products, and sports equipment.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-[#ffffff] font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-md"
            >
              Explore Catalog Now
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
