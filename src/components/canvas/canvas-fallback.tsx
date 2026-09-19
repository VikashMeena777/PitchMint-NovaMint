'use client';

import React, { useEffect, useRef } from 'react';

export interface CanvasFallbackProps {
  className?: string;
  particleCount?: number;
  interactive?: boolean;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

const COLORS = ['#5d5cff', '#00f0ff', '#8c3dfc', '#a855f7'];

export function CanvasFallback({
  className = 'w-full h-full min-h-[300px]',
  particleCount = 40,
  interactive = true,
}: CanvasFallbackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isRunning = true;
    let width = container.clientWidth || 300;
    let height = container.clientHeight || 300;

    // Viewport IntersectionObserver to pause offscreen
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const intersecting = entry ? entry.isIntersecting : false;
        if (intersecting && !isRunning) {
          isRunning = true;
          loop();
        } else if (!intersecting) {
          isRunning = false;
          cancelAnimationFrame(animationFrameId);
        }
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    // DPR Clamping for 60fps sustained rendering
    const dpr = Math.min(window.devicePixelRatio || 1, 2.0);

    const resize = () => {
      if (!container || !canvas) return;
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(container);

    // Initialize procedural particles
    const nodes: Node[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 2 + 1.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.5 + 0.3,
    }));

    let mouseX = -1000;
    let mouseY = -1000;

    const handlePointerMove = (e: MouseEvent) => {
      if (!interactive || !container) return;
      const rect = container.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handlePointerLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('mouseleave', handlePointerLeave);

    const maxDist = 120;

    // 2D procedural rendering loop
    const loop = () => {
      if (!isRunning) return;

      ctx.clearRect(0, 0, width, height);

      // Draw connection lattice
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];

        // Particle position integration
        n1.x += n1.vx;
        n1.y += n1.vy;

        // Bounce boundaries
        if (n1.x < 0 || n1.x > width) n1.vx *= -1;
        if (n1.y < 0 || n1.y > height) n1.vy *= -1;

        // Connect nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.25;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = `rgba(93, 92, 255, ${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Pointer proximity attraction / highlight
        if (mouseX > 0 && mouseY > 0) {
          const mdx = n1.x - mouseX;
          const mdy = n1.y - mouseY;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 140) {
            const pulse = (1 - mdist / 140) * 0.4;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(mouseX, mouseY);
            ctx.strokeStyle = `rgba(0, 240, 255, ${pulse})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }

        // Draw particle node
        ctx.beginPath();
        ctx.arc(n1.x, n1.y, n1.radius, 0, Math.PI * 2);
        ctx.fillStyle = n1.color;
        ctx.globalAlpha = n1.alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, [particleCount, interactive]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full pointer-events-none"
      />
    </div>
  );
}

export default CanvasFallback;
