'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, CheckCircle2, MessageSquarePlus, X } from 'lucide-react';
import { Review } from '@/types';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface ReviewSectionProps {
  productId: string;
  productName: string;
  initialReviews: Review[];
  rating: number;
  reviewCount: number;
}

export default function ReviewSection({
  productId,
  productName,
  initialReviews,
  rating,
  reviewCount,
}: ReviewSectionProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formName, setFormName] = useState(user?.name || '');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Rating breakdown stats
  const total = reviews.length;
  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return { star, count, percentage };
  });

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          userId: user?.id,
          customerName: formName || user?.name || 'Verified Client',
          customerAvatar: user?.avatarUrl,
          rating: formRating,
          title: formTitle,
          comment: formComment,
          isVerifiedPurchase: true,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setReviews([data, ...reviews]);
        setSuccessMessage('Thank you! Your review has been published.');
        setTimeout(() => {
          setModalOpen(false);
          setSuccessMessage('');
          setFormTitle('');
          setFormComment('');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews-section" className="py-16 border-t border-slate-100 bg-[#ffffff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-slate-100 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              {t('customerReviews')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B132B]">
              {t('customerReviews')}
            </h2>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-2.5 bg-[#0B132B] hover:bg-blue-600 text-[#ffffff] font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <MessageSquarePlus className="w-4 h-4" />
            {t('writeReview')}
          </button>
        </div>

        {/* Rating Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-10 items-center">
          {/* Left: Big Score */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left space-y-2">
            <div className="text-5xl sm:text-6xl font-black text-[#0B132B] tracking-tight">
              {rating.toFixed(1)}
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${
                    s <= Math.round(rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Based on {reviewCount} {t('reviewsCount')}
            </p>
          </div>

          {/* Center: Breakdown Progress Bars */}
          <div className="md:col-span-8 space-y-2.5 max-w-xl">
            {breakdown.map((item) => (
              <div key={item.star} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-semibold text-slate-700 flex items-center gap-1">
                  {item.star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="w-10 text-right text-slate-400 font-medium">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="divide-y divide-slate-100 pt-4">
          {reviews.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              {t('noReviewsYet')}
            </div>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="py-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      {rev.customerAvatar ? (
                        <Image
                          src={rev.customerAvatar}
                          alt={rev.customerName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-600 text-xs">
                          {rev.customerName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0B132B]">
                          {rev.customerName}
                        </span>
                        {rev.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> {t('verifiedBuyer')}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {formatDate(String(rev.createdAt))}
                      </div>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center text-amber-400 gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating ? 'fill-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Review Body */}
                {rev.title && (
                  <h4 className="text-sm font-bold text-[#0B132B]">{rev.title}</h4>
                )}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {rev.comment}
                </p>

                {/* Review Photos if any */}
                {rev.images && rev.images.length > 0 && (
                  <div className="flex gap-2 pt-2">
                    {rev.images.map((img, i) => (
                      <div
                        key={i}
                        className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200"
                      >
                        <Image
                          src={img}
                          alt="Review customer photo"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Submission Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative bg-[#ffffff] rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 z-10 animate-in zoom-in-95">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#0B132B] mb-1">{t('writeReview')}</h3>
            <p className="text-xs text-slate-500 mb-6">
              Share your honest feedback on {productName}.
            </p>

            {successMessage ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-sm font-medium rounded-xl border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                {successMessage}
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Star rating picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('yourRating')}
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setFormRating(s)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            s <= formRating
                              ? 'fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('yourName')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('reviewTitle')}
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Exceptional acoustics and design"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('reviewComment')}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Tell us what you liked, how it performs in daily use..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-[#ffffff] text-xs font-bold rounded-xl transition-colors shadow-sm"
                >
                  {submitting ? t('submitting') : t('submitReview')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
