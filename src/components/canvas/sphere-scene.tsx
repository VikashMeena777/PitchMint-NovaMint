'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CanvasFallback } from './canvas-fallback';

export interface SphereSceneProps {
  className?: string;
  speed?: number;
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

export function SphereScene({
  className = 'w-full h-full min-h-[400px]',
  speed = 1.0,
}: SphereSceneProps) {
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

    const disposables: { dispose: () => void }[] = [];

    try {
      const width = container.clientWidth || 500;
      const height = container.clientHeight || 450;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0, 7.0);

      // DPR Clamping
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });

      const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);

      const handleContextLost = (e: Event) => {
        e.preventDefault();
        isRunning = false;
        cancelAnimationFrame(animationFrameId);
        setContextLost(true);
      };
      renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

      // Pipeline sphere group
      const pipelineGroup = new THREE.Group();
      scene.add(pipelineGroup);

      // 1. Holographic wireframe inner globe
      const innerGlobeGeo = new THREE.SphereGeometry(1.85, 20, 20);
      disposables.push(innerGlobeGeo);

      const innerGlobeMat = new THREE.MeshBasicMaterial({
        color: 0x5d5cff,
        wireframe: true,
        transparent: true,
        opacity: 0.18,
      });
      disposables.push(innerGlobeMat);

      const innerGlobeMesh = new THREE.Mesh(innerGlobeGeo, innerGlobeMat);
      pipelineGroup.add(innerGlobeMesh);

      // 2. Surface Node Constellation (500 prospect nodes on sphere surface)
      const nodeCount = 500;
      const nodePositions = new Float32Array(nodeCount * 3);
      for (let i = 0; i < nodeCount; i++) {
        const phi = Math.acos(2 * Math.random() - 1);
        const theta = Math.random() * Math.PI * 2;
        const r = 2.0;

        nodePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        nodePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        nodePositions[i * 3 + 2] = r * Math.cos(phi);
      }

      const nodeGeo = new THREE.BufferGeometry();
      nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
      disposables.push(nodeGeo);

      const nodeMat = new THREE.PointsMaterial({
        color: 0x00f0ff,
        size: 0.05,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      });
      disposables.push(nodeMat);

      const nodePoints = new THREE.Points(nodeGeo, nodeMat);
      pipelineGroup.add(nodePoints);

      // 3. Outreach Pipeline Orbital Rings
      const ringConfigs = [
        { radius: 2.5, tube: 0.018, color: 0x5d5cff, rotX: Math.PI / 4, rotY: 0 },
        { radius: 2.7, tube: 0.015, color: 0x00f0ff, rotX: -Math.PI / 3, rotY: Math.PI / 6 },
        { radius: 2.9, tube: 0.018, color: 0x8c3dfc, rotX: Math.PI / 6, rotY: -Math.PI / 4 },
      ];

      const orbitMeshes: THREE.Mesh[] = [];
      const dataPackets: THREE.Mesh[] = [];

      ringConfigs.forEach((cfg) => {
        const orbitGeo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 100);
        disposables.push(orbitGeo);

        const orbitMat = new THREE.MeshBasicMaterial({
          color: cfg.color,
          transparent: true,
          opacity: 0.45,
        });
        disposables.push(orbitMat);

        const orbitMesh = new THREE.Mesh(orbitGeo, orbitMat);
        orbitMesh.rotation.x = cfg.rotX;
        orbitMesh.rotation.y = cfg.rotY;
        pipelineGroup.add(orbitMesh);
        orbitMeshes.push(orbitMesh);

        // Data packet pulsing along the orbit
        const packetGeo = new THREE.SphereGeometry(0.08, 8, 8);
        disposables.push(packetGeo);

        const packetMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          wireframe: false,
        });
        disposables.push(packetMat);

        const packet = new THREE.Mesh(packetGeo, packetMat);
        pipelineGroup.add(packet);
        dataPackets.push(packet);
      });

      // 4. Lighting
      const ambientLight = new THREE.AmbientLight(0x1e1b4b, 1.0);
      scene.add(ambientLight);

      const cyanPoint = new THREE.PointLight(0x00f0ff, 2.5, 15);
      cyanPoint.position.set(3, 4, 3);
      scene.add(cyanPoint);

      const violetPoint = new THREE.PointLight(0x8c3dfc, 2.5, 15);
      violetPoint.position.set(-3, -3, 3);
      scene.add(violetPoint);

      // 5. Interactivity
      let targetMouseX = 0;
      let targetMouseY = 0;
      let currentMouseX = 0;
      let currentMouseY = 0;
      let isHovered = false;

      const handlePointerMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        const rawX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const rawY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        targetMouseX = Math.max(-1, Math.min(1, rawX));
        targetMouseY = Math.max(-1, Math.min(1, rawY));
      };

      const handlePointerEnter = () => {
        isHovered = true;
      };

      const handlePointerLeave = () => {
        isHovered = false;
        targetMouseX = 0;
        targetMouseY = 0;
      };

      container.addEventListener('mousemove', handlePointerMove);
      container.addEventListener('mouseenter', handlePointerEnter);
      container.addEventListener('mouseleave', handlePointerLeave);

      // 6. Viewport RAF Pausing
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

      // 7. Resize Observer
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

      // 8. Render Loop
      const clock = new THREE.Clock();

      const loop = () => {
        if (!isRunning || !renderer || !scene || !camera) return;

        const elapsedTime = clock.getElapsedTime() * speed;
        const rotationMultiplier = isHovered ? 1.6 : 1.0;

        currentMouseX += (targetMouseX - currentMouseX) * 0.05;
        currentMouseY += (targetMouseY - currentMouseY) * 0.05;

        pipelineGroup.rotation.y = elapsedTime * 0.3 * rotationMultiplier + currentMouseX * 0.4;
        pipelineGroup.rotation.x = elapsedTime * 0.15 * rotationMultiplier + currentMouseY * 0.3;

        // Animate data packets along orbits
        ringConfigs.forEach((cfg, idx) => {
          const packet = dataPackets[idx];
          if (packet) {
            const angle = elapsedTime * (1.2 + idx * 0.4);
            const x = Math.cos(angle) * cfg.radius;
            const y = Math.sin(angle) * cfg.radius;

            // Compute packet position accounting for ring tilt
            const vec = new THREE.Vector3(x, y, 0);
            vec.applyAxisAngle(new THREE.Vector3(1, 0, 0), cfg.rotX);
            vec.applyAxisAngle(new THREE.Vector3(0, 1, 0), cfg.rotY);
            packet.position.copy(vec);
          }
        });

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(loop);
      };

      loop();

      return () => {
        isRunning = false;
        cancelAnimationFrame(animationFrameId);
        container.removeEventListener('mousemove', handlePointerMove);
        container.removeEventListener('mouseenter', handlePointerEnter);
        container.removeEventListener('mouseleave', handlePointerLeave);
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

        disposables.forEach((d) => d.dispose());
      };
    } catch (err) {
      console.warn('SphereScene WebGL initialization failed:', err);
      queueMicrotask(() => {
        setContextLost(true);
      });
    }
  }, [isSupported, speed]);

  if (!isSupported || contextLost) {
    return <CanvasFallback className={className} />;
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[350px] select-none ${className}`}
      aria-label="Interactive 3D Outreach Pipeline Sphere"
      role="img"
    />
  );
}

export default SphereScene;
