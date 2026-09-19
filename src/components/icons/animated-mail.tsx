"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { AnimatedIconProps } from "./types";

export function AnimatedMail({
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
      animate={
        shouldReduceMotion
          ? {}
          : isActive
          ? { y: [0, -2, 0] }
          : { y: 0 }
      }
      transition={{ duration: 0.35, ease: "easeOut" }}
      {...props}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <motion.path
        d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
        animate={
          shouldReduceMotion
            ? {}
            : isActive
            ? {
                pathLength: [1, 0.7, 1],
                stroke: ["currentColor", "var(--pp-accent1, #5d5cff)", "currentColor"],
              }
            : { pathLength: 1, stroke: "currentColor" }
        }
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
      {isActive && !shouldReduceMotion && (
        <motion.line
          x1="6"
          y1="15"
          x2="18"
          y2="15"
          stroke="var(--pp-accent3, #00f0ff)"
          strokeWidth="1.5"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: [0, 1, 0], scaleX: [0.3, 1, 0.8] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.8 }}
        />
      )}
    </motion.svg>
  );
}
