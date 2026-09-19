'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CanvasFallback } from './canvas-fallback';

export interface HeroSceneProps {
  className?: string;
  enableScrollScrub?: boolean;
}

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export function HeroScene({
  className = 'w-full h-full min-h-[450px]',
  enableScrollScrub = true,
}: HeroSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSupported] = useState(() => checkWebGLSupport());
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    if (!isSupported) return;

    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    let isRunning = true;
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;

    // Resource tracking for strict cleanup
    const disposables: { dispose: () => void }[] = [];

    try {
      const width = container.clientWidth || 600;
      const height = container.clientHeight || 500;

      // 1. Scene Setup
      scene = new THREE.Scene();

      // 2. Camera Setup
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0, 7.5);

      // 3. Renderer Setup with DPR Clamping (guarantees 60fps on Retina/4K displays)
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });

      const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      container.appendChild(renderer.domElement);

      // WebGL context lost handler (event callback)
      const handleContextLost = (event: Event) => {
        event.preventDefault();
        isRunning = false;
        cancelAnimationFrame(animationFrameId);
        setContextLost(true);
      };
      renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

      // 4. Main Crystal & Lattice Assembly
      const mainGroup = new THREE.Group();
      scene.add(mainGroup);

      // Obsidian crystal core geometry with flat-shaded facets
      const crystalGeo = new THREE.OctahedronGeometry(1.9, 0);
      disposables.push(crystalGeo);

      const crystalMat = new THREE.MeshPhysicalMaterial({
        color: 0x090d16,
        roughness: 0.12,
        metalness: 0.88,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        reflectivity: 0.9,
        flatShading: true,
      });
      disposables.push(crystalMat);

      const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
      mainGroup.add(crystalMesh);

      // Outer Wireframe Lattice Cage (Cyan/Indigo)
      const wireframeGeo = new THREE.IcosahedronGeometry(2.35, 1);
      disposables.push(wireframeGeo);

      const wireframeMat = new THREE.MeshBasicMaterial({
        color: 0x5d5cff,
        wireframe: true,
        transparent: true,
        opacity: 0.32,
      });
      disposables.push(wireframeMat);

      const wireframeMesh = new THREE.Mesh(wireframeGeo, wireframeMat);
      mainGroup.add(wireframeMesh);

      // Glowing Data Ring
      const ringGeo = new THREE.TorusGeometry(2.9, 0.02, 16, 100);
      disposables.push(ringGeo);

      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.5,
      });
      disposables.push(ringMat);

      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 3;
      mainGroup.add(ringMesh);

      // Second Orbital Ring (Violet)
      const ring2Geo = new THREE.TorusGeometry(3.3, 0.015, 16, 100);
      disposables.push(ring2Geo);

      const ring2Mat = new THREE.MeshBasicMaterial({
        color: 0x8c3dfc,
        transparent: true,
        opacity: 0.35,
      });
      disposables.push(ring2Mat);

      const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
      ring2Mesh.rotation.x = -Math.PI / 4;
      ring2Mesh.rotation.y = Math.PI / 6;
      mainGroup.add(ring2Mesh);

      // Ambient Floating Particle Cloud (380 nodes)
      const particleCount = 380;
      const particlePositions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        const radius = 2.5 + Math.random() * 4.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        particlePositions[i] = radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        particlePositions[i + 2] = radius * Math.cos(phi);
      }

      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      disposables.push(particleGeo);

      const particleMat = new THREE.PointsMaterial({
        color: 0x00f0ff,
        size: 0.045,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
      });
      disposables.push(particleMat);

      const particlePoints = new THREE.Points(particleGeo, particleMat);
      mainGroup.add(particlePoints);

      // 5. Lighting Rig
      const ambientLight = new THREE.AmbientLight(0x1e1b4b, 0.9);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
      dirLight.position.set(5, 7, 5);
      scene.add(dirLight);

      const indigoPoint = new THREE.PointLight(0x5d5cff, 3.2, 20);
      indigoPoint.position.set(-4, 3, 3);
      scene.add(indigoPoint);

      const cyanPoint = new THREE.PointLight(0x00f0ff, 2.8, 20);
      cyanPoint.position.set(4, -3, 3);
      scene.add(cyanPoint);

      // 6. Interactive State & Mouse Normalization
      let targetMouseX = 0;
      let targetMouseY = 0;
      let currentMouseX = 0;
      let currentMouseY = 0;
      let scrollY = 0;

      const handlePointerMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        // Bounded normalized range [-1.0, 1.0]
        const rawX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const rawY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        targetMouseX = Math.max(-1, Math.min(1, rawX));
        targetMouseY = Math.max(-1, Math.min(1, rawY));
      };

      const handlePointerLeave = () => {
        targetMouseX = 0;
        targetMouseY = 0;
      };

      const handleScroll = () => {
        if (enableScrollScrub) {
          scrollY = window.scrollY;
        }
      };

      window.addEventListener('mousemove', handlePointerMove);
      container.addEventListener('mouseleave', handlePointerLeave);
      window.addEventListener('scroll', handleScroll, { passive: true });

      // 7. Viewport RAF Pausing (IntersectionObserver)
      const intersectionObserver = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          const inView = entry ? entry.isIntersecting : false;
          if (inView && !isRunning) {
            isRunning = true;
            loop();
          } else if (!inView) {
            isRunning = false;
            cancelAnimationFrame(animationFrameId);
          }
        },
        { threshold: 0.05 }
      );
      intersectionObserver.observe(container);

      // 8. Responsive Resize Observer
      const resizeObserver = new ResizeObserver(() => {
        if (!container || !renderer || !camera) return;
        const newW = container.clientWidth;
        const newH = container.clientHeight;
        if (newW <= 0 || newH <= 0) return;

        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      });
      resizeObserver.observe(container);

      // 9. Animation Loop with Spring Lerp
      const clock = new THREE.Clock();

      const loop = () => {
        if (!isRunning || !renderer || !scene || !camera) return;

        const elapsedTime = clock.getElapsedTime();

        // Smooth mouse lerp
        currentMouseX += (targetMouseX - currentMouseX) * 0.06;
        currentMouseY += (targetMouseY - currentMouseY) * 0.06;

        // Ambient rotation + Pointer tilt + Scroll rotation
        const autoRotateY = elapsedTime * 0.35;
        const scrollRotation = scrollY * 0.0018;

        mainGroup.rotation.y = autoRotateY + currentMouseX * 0.65 + scrollRotation;
        mainGroup.rotation.x = currentMouseY * 0.45 + Math.sin(elapsedTime * 0.5) * 0.08;

        // Counter-rotate rings for multi-dimensional depth
        ringMesh.rotation.z = elapsedTime * 0.25;
        ring2Mesh.rotation.z = -elapsedTime * 0.2;

        // Gentle floating pulsation
        crystalMesh.position.y = Math.sin(elapsedTime * 1.2) * 0.12;
        wireframeMesh.position.y = Math.sin(elapsedTime * 1.2 + 0.4) * 0.12;

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(loop);
      };

      loop();

      // Return cleanup function
      return () => {
        isRunning = false;
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('mousemove', handlePointerMove);
        container.removeEventListener('mouseleave', handlePointerLeave);
        window.removeEventListener('scroll', handleScroll);
        intersectionObserver.disconnect();
        resizeObserver.disconnect();

        if (renderer) {
          renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
          renderer.dispose();
          renderer.forceContextLoss();
          if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
        }

        disposables.forEach((item) => item.dispose());
      };
    } catch (err) {
      console.warn('HeroScene WebGL initialization failed:', err);
      queueMicrotask(() => {
        setContextLost(true);
      });
    }
  }, [isSupported, enableScrollScrub]);

  if (!isSupported || contextLost) {
    return <CanvasFallback className={className} />;
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[400px] select-none ${className}`}
      aria-label="Interactive 3D Obsidian Crystal Lattice"
      role="img"
    />
  );
}

export default HeroScene;
