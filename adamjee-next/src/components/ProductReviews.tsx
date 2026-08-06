'use client';
import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, CheckCircle, Send, Loader2 } from 'lucide-react';

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  helpful: number;
  createdAt: string;
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

function StarRating({ value, onChange, size = 'md' }: { value: number; onChange?: (v: number) => void; size?: 'sm' | 'md' | 'lg' }) {
  const [hovered, setHovered] = useState(0);
  const sz = size === 'lg' ? 'w-8 h-8' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`${sz} transition-all duration-100 ${
            star <= (hovered || value)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-gray-200 text-gray-200'
          } ${onChange ? 'cursor-pointer hover:scale-110' : ''}`}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          onClick={() => onChange && onChange(star)}
        />
      ))}
    </div>
  );
}

function RatingBar({ count, total, star }: { count: number; total: number; star: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-4 text-right text-gray-500 font-semibold">{star}</span>
      <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-gray-400 font-medium">{count}</span>
    </div>
  );
}

const LABELS = ['', 'Terrible', 'Poor', 'OK', 'Good', 'Excellent'];

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [helpfulVoted, setHelpfulVoted] = useState<Set<string>>(new Set());

  // Form state
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState('');

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews/${encodeURIComponent(productId)}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
    // Poll every 30s for real-time feel
    const interval = setInterval(fetchReviews, 30000);
    return () => clearInterval(interval);
  }, [productId]);

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim()) return setFormError('Please enter your name.');
    if (rating === 0) return setFormError('Please select a star rating.');
    if (comment.trim().length < 10) return setFormError('Comment must be at least 10 characters.');

    setSubmitting(true);
    try {
      const res = await fetch(`/api/reviews/${encodeURIComponent(productId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), rating, comment: comment.trim() }),
      });
      if (res.ok) {
        setSubmitted(true);
        setShowForm(false);
        setName(''); setRating(0); setComment('');
        await fetchReviews(); // refresh immediately
      } else {
        const d = await res.json();
        setFormError(d.message || 'Failed to submit review. Please try again.');
      }
    } catch {
      setFormError('Network error. Please check your connection and try again.');
    }
    setSubmitting(false);
  };

  const handleHelpful = async (reviewId: string) => {
    if (helpfulVoted.has(reviewId)) return;
    try {
      await fetch(`/api/reviews/${encodeURIComponent(productId)}/helpful`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId }),
      });
      setHelpfulVoted(prev => new Set([...prev, reviewId]));
      setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, helpful: r.helpful + 1 } : r));
    } catch {}
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return ''; }
  };

  return (
    <section className="mt-20 pt-16 border-t border-gray-200" id="reviews">
      <div className="max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl font-black text-[#0a1b2d]">Customer Reviews</h2>
            <p className="text-sm text-gray-500 mt-1">
              Real reviews from verified customers of {productName}
            </p>
          </div>
          {!showForm && !submitted && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#103256] hover:bg-[#0c2540] text-white rounded-xl text-sm font-bold transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
            >
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              Write a Review
            </button>
          )}
          {submitted && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-bold bg-green-50 border border-green-200 px-4 py-2 rounded-xl">
              <CheckCircle className="w-4 h-4" />
              Thank you for your review!
            </div>
          )}
        </div>

        {/* Rating Summary */}
        {reviews.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-8 flex flex-col sm:flex-row gap-8 items-center">
            {/* Big average */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <span className="text-6xl font-black text-[#0a1b2d]">{avgRating.toFixed(1)}</span>
              <StarRating value={Math.round(avgRating)} size="md" />
              <span className="text-xs text-gray-400 font-medium">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
            </div>
            {/* Bar breakdown */}
            <div className="flex-1 w-full space-y-2">
              {ratingCounts.map(({ star, count }) => (
                <RatingBar key={star} star={star} count={count} total={reviews.length} />
              ))}
            </div>
          </div>
        )}

        {/* Write Review Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8 space-y-5 animate-in slide-in-from-top-2 duration-200"
          >
            <h3 className="text-base font-black text-[#0a1b2d]">Share Your Experience</h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Your Rating</label>
              <div className="flex items-center gap-3">
                <StarRating value={rating} onChange={setRating} size="lg" />
                {rating > 0 && (
                  <span className="text-sm font-bold text-amber-500">{LABELS[rating]}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Ahmed from Lahore"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#103256] focus:ring-2 focus:ring-[#103256]/10 transition-all"
                  maxLength={60}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Your Review</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your honest experience with this product... (min. 10 characters)"
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#103256] focus:ring-2 focus:ring-[#103256]/10 transition-all resize-none"
              />
              <p className="text-[10px] text-gray-400 text-right">{comment.length}/1000</p>
            </div>

            {formError && (
              <p className="text-sm text-red-500 font-semibold bg-red-50 border border-red-100 px-4 py-2 rounded-xl">
                {formError}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#103256] hover:bg-[#0c2540] disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-all duration-200 shadow-sm"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormError(''); }}
                className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-sm font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#103256]" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Star className="w-10 h-10 mx-auto mb-3 fill-gray-100 text-gray-200" />
            <p className="font-bold text-gray-500">No reviews yet</p>
            <p className="text-sm mt-1">Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, idx) => (
              <div
                key={review._id}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Avatar + name */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#103256] to-[#1a5491] flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-black text-sm">
                        {review.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#0a1b2d] text-sm">{review.name}</span>
                        {review.isVerified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-2.5 h-2.5" />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating value={review.rating} size="sm" />
                        <span className="text-[11px] text-gray-400">{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  {/* Rating badge */}
                  <div className={`flex-shrink-0 text-xs font-black px-2.5 py-1 rounded-xl ${
                    review.rating >= 4 ? 'bg-green-50 text-green-700 border border-green-100'
                    : review.rating === 3 ? 'bg-amber-50 text-amber-700 border border-amber-100'
                    : 'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                    {review.rating}/5
                  </div>
                </div>

                {/* Comment */}
                <p className="mt-3 text-sm text-gray-700 leading-relaxed pl-13">{review.comment}</p>

                {/* Helpful button */}
                <div className="mt-3 pl-13 flex items-center gap-3">
                  <button
                    onClick={() => handleHelpful(review._id)}
                    disabled={helpfulVoted.has(review._id)}
                    className={`inline-flex items-center gap-1.5 text-[11px] font-semibold transition-colors ${
                      helpfulVoted.has(review._id)
                        ? 'text-[#103256] cursor-default'
                        : 'text-gray-400 hover:text-[#103256] cursor-pointer'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${helpfulVoted.has(review._id) ? 'fill-[#103256]' : ''}`} />
                    Helpful ({review.helpful})
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
