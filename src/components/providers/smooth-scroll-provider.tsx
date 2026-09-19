'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from 'react';
import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export type LenisScrollTarget = number | string | HTMLElement;

export interface LenisScrollToOptions {
  offset?: number;
  immediate?: boolean;
  lock?: boolean;
  duration?: number;
  easing?: (t: number) => number;
  lerp?: number;
  onStart?: () => void;
  onComplete?: () => void;
  force?: boolean;
  programmatic?: boolean;
  userData?: Record<string, unknown>;
}

export interface SmoothScrollContextValue {
  lenis: Lenis | null;
  scrollTo: (target: LenisScrollTarget, options?: LenisScrollToOptions) => void;
  stop: () => void;
  start: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
  scrollTo: () => {},
  stop: () => {},
  start: () => {},
});

export function useSmoothScroll(): SmoothScrollContextValue {
  return useContext(SmoothScrollContext);
}

// External store for Lenis instance to satisfy React 19 compiler purity & avoid cascading renders
let activeLenis: Lenis | null = null;
const subscribers = new Set<() => void>();

function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

function getSnapshot() {
  return activeLenis;
}

function getServerSnapshot() {
  return null;
}

function updateLenisInstance(instance: Lenis | null) {
  activeLenis = instance;
  subscribers.forEach((cb) => cb());
}

export interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenis = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check prefers-reduced-motion: if enabled, disable virtual smooth scrolling
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      return;
    }

    const instance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
      infinite: false,
      autoRaf: false, // Explicitly driven via GSAP ticker
    });

    lenisRef.current = instance;
    updateLenisInstance(instance);

    // Synchronize Lenis virtual scroll with GSAP ticker & ScrollTrigger
    instance.on('scroll', ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      instance.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      instance.off('scroll', ScrollTrigger.update);
      instance.destroy();
      lenisRef.current = null;
      updateLenisInstance(null);
    };
  }, []);

  // Reset scroll and refresh ScrollTrigger on route changes
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
      ScrollTrigger.refresh();
    }
  }, [pathname]);

  const scrollTo = useCallback(
    (target: LenisScrollTarget, options?: LenisScrollToOptions) => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, options);
      } else if (typeof window !== 'undefined') {
        if (typeof target === 'number') {
          window.scrollTo({
            top: target,
            behavior: options?.immediate ? 'auto' : 'smooth',
          });
        } else if (typeof target === 'string') {
          const el = document.querySelector(target);
          el?.scrollIntoView({
            behavior: options?.immediate ? 'auto' : 'smooth',
          });
        } else if (target instanceof HTMLElement) {
          target.scrollIntoView({
            behavior: options?.immediate ? 'auto' : 'smooth',
          });
        }
      }
    },
    []
  );

  const stop = useCallback(() => {
    lenisRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    lenisRef.current?.start();
  }, []);

  const value = useMemo(
    () => ({
      lenis,
      scrollTo,
      stop,
      start,
    }),
    [lenis, scrollTo, stop, start]
  );

  return (
    <SmoothScrollContext.Provider value={value}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export default SmoothScrollProvider;
