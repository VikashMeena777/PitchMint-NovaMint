"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { AnimatedIconProps } from "./types";

export function AnimatedShield({
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
          ? { scale: [1, 1.08, 1] }
          : { scale: 1 }
      }
      transition={{ duration: 0.4, ease: "easeOut" }}
      {...props}
    >
      <motion.path
        d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
        animate={
          shouldReduceMotion
            ? {}
            : isActive
            ? {
                stroke: ["currentColor", "var(--pp-accent2, #8c3dfc)", "currentColor"],
                fill: ["rgba(140, 61, 252, 0)", "rgba(140, 61, 252, 0.15)", "rgba(140, 61, 252, 0)"],
              }
            : { fill: "rgba(140, 61, 252, 0)", stroke: "currentColor" }
        }
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
      <motion.path
        d="m9 12 2 2 4-4"
        animate={
          shouldReduceMotion
            ? {}
            : isActive
            ? {
                pathLength: [0, 1],
                stroke: ["var(--pp-accent3, #00f0ff)", "var(--pp-accent3, #00f0ff)"],
              }
            : { pathLength: 1, stroke: "currentColor" }
        }
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      />
    </motion.svg>
  );
}
