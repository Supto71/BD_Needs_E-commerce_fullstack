'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import AnnouncementBar from '@/components/storefront/AnnouncementBar';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import { useAuth } from '@/context/AuthContext';
import { signIn } from 'next-auth/react';

//someting added

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(identifier, password);
    setLoading(false);

    if (res.success) {
      router.push('/account');
    } else {
      setError(res.message || 'Invalid credentials');
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 relative flex items-center justify-center py-20 px-4 sm:px-6 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[120px]" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-purple-400/20 blur-[120px]" />
          <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-teal-400/20 blur-[120px]" />
        </div>

        <div className="max-w-md w-full relative z-10">
          <div className="bg-[#ffffff]/70 backdrop-blur-xl rounded-[2rem] border border-[#ffffff]/50 p-8 sm:p-10 shadow-2xl shadow-blue-900/5 space-y-8">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center mb-6">
                <Image
                  src="/logomain.png"
                  alt="BdNeeds Logo"
                  width={160}
                  height={48}
                  className="object-contain h-12 w-auto"
                  priority
                />
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Sign in to access your exclusive perks and orders.
              </p>
            </div>


            {error && (
              <div className="p-4 bg-rose-50/80 backdrop-blur-sm border border-rose-200 rounded-2xl text-rose-700 text-sm font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700 ml-1">
                  Email Address or Phone Number
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="email@example.com or 01XXXXXXXXX"
                    className="w-full pl-11 pr-4 py-3.5 text-sm bg-[#ffffff]/50 border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-[#ffffff] font-medium transition-all duration-300 shadow-sm"
                  />
                  <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-bold text-slate-700">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3.5 text-sm bg-[#ffffff]/50 border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-[#ffffff] font-medium transition-all duration-300 shadow-sm"
                  />
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 disabled:opacity-70 disabled:cursor-not-allowed text-[#ffffff] rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-[0.98]"
              >
                {loading ? 'Authenticating...' : 'Sign In To Account'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="relative flex items-center justify-center">
              <div className="absolute border-t border-slate-200/60 w-full" />
              <span className="bg-[#ffffff]/70 backdrop-blur-xl px-4 text-xs font-semibold text-slate-500 relative">
                Or continue with
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => signIn('google', { callbackUrl: '/account' })}
                className="flex items-center justify-center gap-2 py-3.5 bg-[#ffffff] border border-slate-200 hover:bg-slate-50 rounded-2xl text-sm font-bold text-slate-700 transition-colors shadow-sm active:scale-[0.98]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => signIn('facebook', { callbackUrl: '/account' })}
                className="flex items-center justify-center gap-2 py-3.5 bg-[#1877F2] hover:bg-[#166FE5] text-[#ffffff] rounded-2xl text-sm font-bold transition-colors shadow-sm shadow-blue-500/20 active:scale-[0.98]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
            </div>

            <div className="pt-6 border-t border-slate-200/60 text-center text-sm font-medium text-slate-500">
              New to our store?{' '}
              <Link href="/register" className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-80 transition-opacity">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
