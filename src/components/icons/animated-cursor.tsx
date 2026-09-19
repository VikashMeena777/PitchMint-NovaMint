"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { AnimatedIconProps } from "./types";

export function AnimatedCursor({
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
      <motion.path
        d="M4 4l7.07 17 2.51-7.39L21 11.07 4 4z"
        animate={
          shouldReduceMotion
            ? {}
            : isActive
            ? {
                x: [0, 2, -1, 0],
                y: [0, 2, -1, 0],
                scale: [1, 0.95, 1.05, 1],
              }
            : { x: 0, y: 0, scale: 1 }
        }
        transition={{ duration: 0.45, ease: "easeInOut" }}
      />
      {isActive && !shouldReduceMotion && (
        <motion.circle
          cx="4"
          cy="4"
          r="4"
          stroke="var(--pp-accent3, #00f0ff)"
          strokeWidth="1.5"
          initial={{ opacity: 1, scale: 0.2 }}
          animate={{ opacity: [1, 0], scale: [0.5, 2] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.4 }}
        />
      )}
    </motion.svg>
  );
}
