"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { AnimatedIconProps } from "./types";

export function AnimatedNodes({
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
      {/* Connecting lines */}
      <motion.path
        d="M6 9v6M18 9v6M9 6h6M9 18h6"
        animate={
          shouldReduceMotion
            ? {}
            : isActive
            ? {
                stroke: ["currentColor", "var(--pp-accent1, #5d5cff)", "currentColor"],
              }
            : { stroke: "currentColor" }
        }
        transition={{ duration: 0.5 }}
      />
      {/* 4 Nodes */}
      <motion.circle
        cx="6"
        cy="6"
        r="3"
        animate={
          shouldReduceMotion
            ? {}
            : isActive
            ? {
                scale: [1, 1.25, 1],
                fill: ["rgba(93,92,255,0)", "rgba(93,92,255,0.4)", "rgba(93,92,255,0)"],
              }
            : { scale: 1, fill: "rgba(93,92,255,0)" }
        }
        transition={{ duration: 0.5, delay: 0 }}
      />
      <motion.circle
        cx="18"
        cy="6"
        r="3"
        animate={
          shouldReduceMotion
            ? {}
            : isActive
            ? {
                scale: [1, 1.25, 1],
                fill: ["rgba(0,240,255,0)", "rgba(0,240,255,0.4)", "rgba(0,240,255,0)"],
              }
            : { scale: 1, fill: "rgba(0,240,255,0)" }
        }
        transition={{ duration: 0.5, delay: 0.1 }}
      />
      <motion.circle
        cx="6"
        cy="18"
        r="3"
        animate={
          shouldReduceMotion
            ? {}
            : isActive
            ? {
                scale: [1, 1.25, 1],
                fill: ["rgba(140,61,252,0)", "rgba(140,61,252,0.4)", "rgba(140,61,252,0)"],
              }
            : { scale: 1, fill: "rgba(140,61,252,0)" }
        }
        transition={{ duration: 0.5, delay: 0.2 }}
      />
      <motion.circle
        cx="18"
        cy="18"
        r="3"
        animate={
          shouldReduceMotion
            ? {}
            : isActive
            ? {
                scale: [1, 1.25, 1],
                fill: ["rgba(217,70,239,0)", "rgba(217,70,239,0.4)", "rgba(217,70,239,0)"],
              }
            : { scale: 1, fill: "rgba(217,70,239,0)" }
        }
        transition={{ duration: 0.5, delay: 0.3 }}
      />
    </motion.svg>
  );
}
