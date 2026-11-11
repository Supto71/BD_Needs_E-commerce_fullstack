'use client';

import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollTriggerProps {
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  loadedCount: number;
  totalCount: number;
  itemLabel?: string;
}

export default function InfiniteScrollTrigger({
  hasMore,
  loadingMore,
  onLoadMore,
  loadedCount,
  totalCount,
  itemLabel = 'entries',
}: InfiniteScrollTriggerProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    if (!hasMore || loadingMore) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMoreRef.current();
        }
      },
      { rootMargin: '250px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadedCount]);

  if (totalCount === 0 && !loadingMore) return null;

  return (
    <div
      ref={sentinelRef}
      className="px-6 py-4 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500"
    >
      <span className="font-medium">
        Showing <strong className="text-[#0B132B]">{loadedCount}</strong> of{' '}
        <strong className="text-[#0B132B]">{totalCount}</strong> {itemLabel}
      </span>

      <div className="flex items-center gap-2">
        {loadingMore ? (
          <span className="inline-flex items-center gap-2 font-bold text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading next 24 {itemLabel}...
          </span>
        ) : hasMore ? (
          <button
            type="button"
            onClick={onLoadMore}
            className="px-4 py-1.5 rounded-xl bg-[#ffffff] border border-slate-200 hover:bg-slate-100 text-[#0B132B] font-bold transition-colors cursor-pointer"
          >
            Load more {itemLabel}
          </button>
        ) : (
          <span className="text-[11px] font-semibold text-slate-400">
            All {totalCount} {itemLabel} loaded
          </span>
        )}
      </div>
    </div>
  );
}

