'use client';

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, XCircle, Trash2, ShieldCheck } from 'lucide-react';
import { Review } from '@/types';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function AdminReviewsPage() {
  const { isAdmin } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = () => {
    setLoading(true);
    fetch('/api/reviews?admin=true')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setReviews(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleModerate = async (id: string, isApproved: boolean) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isApproved } : r))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews(reviews.filter((r) => r.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B132B]">
            Client Review Moderation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Validate verified purchase badges, review testimonials, and curate storefront sentiment.
          </p>
        </div>
      </div>

      <div className="bg-[#ffffff] rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4 pl-6">Client</th>
                <th className="p-4">Rating & Headline</th>
                <th className="p-4">Comment</th>
                <th className="p-4">Verification</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    Loading reviews...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    No customer reviews to moderate.
                  </td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-900">
                      {rev.customerName}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-amber-500 gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= rev.rating ? 'fill-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-[#0B132B]">{rev.title}</span>
                    </td>
                    <td className="p-4 max-w-sm">
                      <p className="line-clamp-2 text-slate-600">{rev.comment}</p>
                    </td>
                    <td className="p-4">
                      {rev.isVerifiedPurchase ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Unverified</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400">{formatDate(String(rev.createdAt))}</td>
                    <td className="p-4">
                      {rev.isApproved ? (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[10px] uppercase">
                          Approved
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full font-bold text-[10px] uppercase">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isAdmin && (
                          <>
                            {rev.isApproved ? (
                              <button
                                onClick={() => handleModerate(rev.id, false)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-700 rounded-lg text-xs font-bold"
                              >
                                Unpublish
                              </button>
                            ) : (
                              <button
                                onClick={() => handleModerate(rev.id, true)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-[#ffffff] rounded-lg text-xs font-bold shadow-2xs"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(rev.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
