'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isReducedMotion } from './scroll-trigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface PinnedRevealOptions {
  container: gsap.DOMTarget;
  items: gsap.DOMTarget[];
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pinSpacing?: boolean;
  anticipatePin?: number;
}

/**
 * Creates a pinned section reveal timeline for interactive bento grids or multi-step showcases.
 * Pins the outer container while sequentially unveiling child items on scroll.
 */
export function createPinnedReveal({
  container,
  items,
  start = 'top top',
  end = '+=200%',
  scrub = 1,
  pinSpacing = true,
  anticipatePin = 1,
}: PinnedRevealOptions): gsap.core.Timeline | null {
  if (typeof window === 'undefined') return null;

  if (isReducedMotion()) {
    // Reveal all items immediately without motion
    items.forEach((item) => {
      gsap.set(item, { opacity: 1, y: 0, scale: 1 });
    });
    return null;
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: container,
      pin: true,
      start,
      end,
      scrub,
      pinSpacing,
      anticipatePin,
      invalidateOnRefresh: true,
    },
  });

  items.forEach((item, index) => {
    // Initial hidden state for items (except the first if desired)
    if (index > 0) {
      gsap.set(item, { opacity: 0, y: 40, scale: 0.95 });
      tl.to(item, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: 'power2.out',
      });
    } else {
      // First item is active initially, may pulse or settle
      tl.fromTo(
        item,
        { opacity: 0.6, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
      );
    }
  });

  return tl;
}

export interface ScrubbedTextRevealOptions {
  trigger: gsap.DOMTarget;
  words: gsap.DOMTarget;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  initialOpacity?: number;
  activeOpacity?: number;
  stagger?: number;
}

/**
 * Creates an Awwwards/Linear-grade scrubbed headline text unveiling.
 * Words or characters start at a muted opacity (e.g. 0.15) and illuminate to 1.0 as the user scrolls.
 */
export function createScrubbedTextReveal({
  trigger,
  words,
  start = 'top 80%',
  end = 'bottom 40%',
  scrub = 1,
  initialOpacity = 0.15,
  activeOpacity = 1.0,
  stagger = 0.1,
}: ScrubbedTextRevealOptions): gsap.core.Timeline | null {
  if (typeof window === 'undefined') return null;

  if (isReducedMotion()) {
    gsap.set(words, { opacity: activeOpacity });
    return null;
  }

  gsap.set(words, { opacity: initialOpacity });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger,
      start,
      end,
      scrub,
      invalidateOnRefresh: true,
    },
  });

  tl.to(words, {
    opacity: activeOpacity,
    stagger,
    ease: 'none',
  });

  return tl;
}

export interface StaggeredEntranceOptions {
  trigger: gsap.DOMTarget;
  targets: gsap.DOMTarget;
  start?: string;
  stagger?: number;
  duration?: number;
  yOffset?: number;
  once?: boolean;
}

/**
 * Triggered entrance for cards, grids, and metrics when entering the viewport.
 */
export function createStaggeredEntrance({
  trigger,
  targets,
  start = 'top 85%',
  stagger = 0.12,
  duration = 0.8,
  yOffset = 30,
  once = true,
}: StaggeredEntranceOptions): gsap.core.Tween | null {
  if (typeof window === 'undefined') return null;

  if (isReducedMotion()) {
    gsap.set(targets, { opacity: 1, y: 0 });
    return null;
  }

  gsap.set(targets, { opacity: 0, y: yOffset });

  return gsap.to(targets, {
    opacity: 1,
    y: 0,
    duration,
    stagger,
    ease: 'power3.out',
    scrollTrigger: {
      trigger,
      start,
      once,
      invalidateOnRefresh: true,
    },
  });
}

export interface SectionMorphOptions {
  trigger: gsap.DOMTarget;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  scaleFrom?: number;
  scaleTo?: number;
  borderRadiusFrom?: string;
  borderRadiusTo?: string;
}

/**
 * Creates smooth section boundary morphs (scaling, border-radius rounding, depth shift) on scroll.
 */
export function createSectionMorph({
  trigger,
  start = 'top bottom',
  end = 'bottom top',
  scrub = 1,
  scaleFrom = 0.96,
  scaleTo = 1.0,
  borderRadiusFrom = '24px',
  borderRadiusTo = '0px',
}: SectionMorphOptions): gsap.core.Tween | null {
  if (typeof window === 'undefined' || isReducedMotion()) {
    return null;
  }

  return gsap.fromTo(
    trigger,
    {
      scale: scaleFrom,
      borderRadius: borderRadiusFrom,
    },
    {
      scale: scaleTo,
      borderRadius: borderRadiusTo,
      ease: 'none',
      scrollTrigger: {
        trigger,
        start,
        end,
        scrub,
        invalidateOnRefresh: true,
      },
    }
  );
}
