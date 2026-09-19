'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register plugins safely in client-side environment
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/**
 * Checks if user prefers reduced motion for accessibility compliance
 */
export function isReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export interface ParallaxOptions {
  trigger: gsap.DOMTarget;
  target?: gsap.DOMTarget;
  yPercent?: number;
  y?: number | string;
  speed?: number;
  scrub?: boolean | number;
  start?: string;
  end?: string;
  ease?: string;
  markers?: boolean;
}

/**
 * Creates a high-performance scroll-scrubbed parallax layer animation.
 * Respects prefers-reduced-motion by bypassing motion when enabled.
 */
export function createParallaxEffect({
  trigger,
  target,
  yPercent = 25,
  y,
  scrub = true,
  start = 'top bottom',
  end = 'bottom top',
  ease = 'none',
  markers = false,
}: ParallaxOptions): gsap.core.Tween | null {
  if (typeof window === 'undefined' || isReducedMotion()) {
    return null;
  }

  const animTarget = target || trigger;
  const vars: gsap.TweenVars = {
    ease,
    scrollTrigger: {
      trigger,
      start,
      end,
      scrub: typeof scrub === 'boolean' ? (scrub ? 1 : false) : scrub,
      markers,
      invalidateOnRefresh: true,
    },
  };

  if (yPercent !== undefined) {
    vars.yPercent = yPercent;
  }
  if (y !== undefined) {
    vars.y = y;
  }

  return gsap.to(animTarget, vars);
}

export interface ScrollTriggerConfig {
  trigger: gsap.DOMTarget;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean | gsap.DOMTarget;
  pinSpacing?: boolean | string;
  anticipatePin?: number;
  markers?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
  onUpdate?: (self: ScrollTrigger) => void;
}

/**
 * Safe helper to instantiate a ScrollTrigger instance with clean defaults.
 */
export function createScrollTrigger(config: ScrollTriggerConfig): ScrollTrigger | null {
  if (typeof window === 'undefined') return null;

  return ScrollTrigger.create({
    ...config,
    scrub: typeof config.scrub === 'boolean' ? (config.scrub ? 1 : false) : config.scrub,
  });
}

/**
 * Refreshes all active ScrollTrigger instances across the document.
 * Crucial after dynamic route transitions or DOM layout updates.
 */
export function refreshScrollTriggers(): void {
  if (typeof window !== 'undefined') {
    ScrollTrigger.refresh();
  }
}

/**
 * Cleans up all active ScrollTrigger instances to prevent memory leaks.
 */
export function killAllScrollTriggers(): void {
  if (typeof window !== 'undefined') {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }
}

export { gsap, ScrollTrigger, useGSAP };
