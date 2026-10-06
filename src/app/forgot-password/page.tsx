'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, ArrowRight, ChevronLeft } from 'lucide-react';
import AnnouncementBar from '@/components/storefront/AnnouncementBar';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6">
        <div className="max-w-md w-full bg-[#ffffff] rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>

          <div className="space-y-1">
            <h1 className="text-2xl font-black text-[#0B132B]">Reset Password</h1>
            <p className="text-xs text-slate-500">
              Enter your registered email and we will send password reset instructions.
            </p>
          </div>

          {submitted ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-bold text-emerald-950">Instructions Sent</h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                If an account exists for <strong className="font-semibold">{email}</strong>, you will receive a secure password reset link shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alexander@example.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#0B132B] hover:bg-blue-600 text-[#ffffff] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                Send Reset Link
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
