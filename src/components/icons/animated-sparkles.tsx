"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { AnimatedIconProps } from "./types";

export function AnimatedSparkles({
  size = 24,
  className = "",
  animated,
  strokeWidth = 2,
  ...props
}: AnimatedIconProps) {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const isActive = animated !== undefined ? animated : isHovered;

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Primary central sparkle */}
      <motion.path
        d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"
        animate={
          shouldReduceMotion
            ? {}
            : isActive
            ? {
                rotate: [0, 90, 180],
                scale: [1, 1.15, 0.95, 1],
                stroke: ["currentColor", "var(--pp-accent4, #d946ef)", "var(--pp-accent3, #00f0ff)"],
              }
            : { rotate: 0, scale: 1, stroke: "currentColor" }
        }
        transition={{ duration: 0.8, ease: "easeInOut" }}
        style={{ originX: "12px", originY: "12px" }}
      />
      {/* Small top-right star */}
      <motion.path
        d="M20 3v4"
        animate={
          shouldReduceMotion
            ? {}
            : isActive
            ? { opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }
            : { opacity: 0.7, scale: 1 }
        }
        transition={{ duration: 0.5, delay: 0.1 }}
      />
      <motion.path
        d="M22 5h-4"
        animate={
          shouldReduceMotion
            ? {}
            : isActive
            ? { opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }
            : { opacity: 0.7, scale: 1 }
        }
        transition={{ duration: 0.5, delay: 0.1 }}
      />
      {/* Small bottom-left star */}
      <motion.path
        d="M4 17v2"
        animate={
          shouldReduceMotion
            ? {}
            : isActive
            ? { opacity: [0.4, 1, 0.4] }
            : { opacity: 0.7 }
        }
        transition={{ duration: 0.5, delay: 0.2 }}
      />
      <motion.path
        d="M5 18H3"
        animate={
          shouldReduceMotion
            ? {}
            : isActive
            ? { opacity: [0.4, 1, 0.4] }
            : { opacity: 0.7 }
        }
        transition={{ duration: 0.5, delay: 0.2 }}
      />
    </motion.svg>
  );
}
