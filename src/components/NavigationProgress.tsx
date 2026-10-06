'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPathRef = useRef(pathname + searchParams.toString());

  useEffect(() => {
    const current = pathname + searchParams.toString();

    if (current !== prevPathRef.current) {
      prevPathRef.current = current;

      // Navigation complete — jump to 100% and hide
      setProgress(100);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);

      timerRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400);
    }
  }, [pathname, searchParams]);

  // Simulate progress on link click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;
      
      const href = target.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto')) return;
      if (target.getAttribute('target') === '_blank') return;

      const isSamePage = target.pathname === window.location.pathname && target.search === window.location.search;

      // External link check
      if (target.href.startsWith('http') && target.origin !== window.location.origin) {
        return;
      }

      // Internal navigation detected
      setVisible(true);
      setProgress(15);

      if (intervalRef.current) clearInterval(intervalRef.current);

      if (isSamePage) {
        // Scroll to top for same-page navigation
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Simulate a quick successful load for same-page clicks
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setProgress(100);
          timerRef.current = setTimeout(() => {
            setVisible(false);
            setProgress(0);
          }, 400);
        }, 200);
        return;
      }

      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            clearInterval(intervalRef.current!);
            return 85;
          }
          return prev + Math.random() * 12;
        });
      }, 200);
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[3px] transition-all duration-300 ease-out"
      style={{
        width: `${progress}%`,
        opacity: visible ? 1 : 0,
        background: 'linear-gradient(90deg, #2563eb, #6366f1, #8b5cf6)',
        boxShadow: '0 0 10px rgba(99, 102, 241, 0.7)',
        transitionProperty: 'width, opacity',
      }}
    />
  );
}

export default function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressInner />
    </Suspense>
  );
}
