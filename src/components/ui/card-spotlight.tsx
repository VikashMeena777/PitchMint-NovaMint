"use client";

import React, { useState } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends HTMLMotionProps<"div"> {
  children?: React.ReactNode;
  accentColor?: string; // e.g. "rgba(99, 102, 241, 0.15)"
  topAccent?: boolean;
}

export function SpotlightCard({
  children,
  className,
  accentColor = "rgba(99, 102, 241, 0.15)",
  topAccent = false,
  ...props
}: SpotlightCardProps) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[var(--pp-border-subtle)] bg-[var(--pp-bg-surface)] p-5 transition-colors duration-300 hover:border-[var(--pp-border-accent)]",
        topAccent && "card-top-accent",
        className
      )}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Radial Gradient */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${coords.x}px ${coords.y}px, ${accentColor}, transparent 65%)`,
        }}
      />

      {/* Decorative inner glass border reflection */}
      <div className="absolute inset-px rounded-[15px] border border-white/[0.03] pointer-events-none z-10" />

      {/* Card contents */}
      <div className="relative z-10 flex flex-col h-full">{children}</div>
    </motion.div>
  );
}
