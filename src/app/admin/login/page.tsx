'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ShieldAlert, ArrowRight, AlertCircle, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password, 'ADMIN');
    setLoading(false);

    if (res.success) {
      router.push('/admin');
    } else {
      setError(res.message || 'Invalid administrator credentials');
    }
  };


  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-950 overflow-hidden">
      {/* Dark theme glowing decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-900/30 blur-[100px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-purple-900/20 blur-[90px]" />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-slate-700/50 p-8 sm:p-10 shadow-2xl shadow-black space-y-8 relative overflow-hidden">
          
          {/* Top highlight line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-[#ffffff] font-black text-xl mx-auto shadow-lg shadow-blue-900/50 mb-2 relative group">
              <Shield className="w-8 h-8 relative z-10" />
              <div className="absolute inset-0 rounded-2xl bg-blue-500 blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <h1 className="text-3xl font-black text-[#ffffff] tracking-tight">Admin Portal</h1>
            <p className="text-sm text-slate-400 font-medium">
              Authorized management personnel only.
            </p>
          </div>


          {error && (
            <div className="p-4 bg-rose-950/50 border border-rose-900/50 rounded-2xl text-rose-400 text-sm font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-300 ml-1">
                Administrator Email
              </label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your admin email"
                  className="w-full pl-11 pr-4 py-3.5 text-sm bg-slate-950/50 border border-slate-700/80 rounded-2xl text-[#ffffff] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 font-medium transition-all duration-300 shadow-inner"
                />
                <Mail className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-400 transition-colors" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-300 ml-1">
                Master Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3.5 text-sm bg-slate-950/50 border border-slate-700/80 rounded-2xl text-[#ffffff] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 font-medium transition-all duration-300 shadow-inner"
                />
                <Lock className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-400 transition-colors" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none transition-colors"
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
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed text-[#ffffff] rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/50 hover:shadow-blue-500/25 active:scale-[0.98]"
            >
              {loading ? 'Authenticating Admin...' : 'Authenticate & Enter Console'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="pt-6 text-center">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-400 hover:text-[#ffffff] transition-colors flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-3 h-3 rotate-180" />
              Return to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
