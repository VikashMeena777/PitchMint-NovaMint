'use client';

import dynamic from 'next/dynamic';
import type { HeroSceneProps } from './hero-scene';
import type { SphereSceneProps } from './sphere-scene';
import type { CardTiltProps } from './card-tilt';
import type { CanvasFallbackProps } from './canvas-fallback';

// Direct synchronous exports
export { CanvasFallback } from './canvas-fallback';
export { CardTilt } from './card-tilt';
export { HeroScene as HeroSceneDirect } from './hero-scene';
export { SphereScene as SphereSceneDirect } from './sphere-scene';

// Safe dynamic exports with { ssr: false } to guarantee server-side rendering never touches WebGL
export const HeroScene = dynamic<HeroSceneProps>(
  () => import('./hero-scene').then((mod) => mod.HeroScene),
  {
    ssr: false,
  }
);

export const SphereScene = dynamic<SphereSceneProps>(
  () => import('./sphere-scene').then((mod) => mod.SphereScene),
  {
    ssr: false,
  }
);

export type { HeroSceneProps, SphereSceneProps, CardTiltProps, CanvasFallbackProps };
