"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { AnimatedIconProps } from "./types";

export function AnimatedChart({
  size = 24,
  className = "",
  animated,
  strokeWidth = 2,
  ...props
}: AnimatedIconProps) {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const isActive = animated !== undefined ? animated : isHovered;

  const barVariants = {
    initial: { scaleY: 1, originY: 1 },
    hover: (custom: number) => ({
      scaleY: [1, 1.35, 0.85, 1.15, 1],
      transition: {
        duration: 0.6,
        delay: custom * 0.1,
        ease: "easeInOut" as const,
      },
    }),
  };

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
      <path d="M3 3v18h18" />
      <motion.path
        d="m19 9-5 5-4-4-3 3"
        animate={
          shouldReduceMotion
            ? {}
            : isActive
            ? {
                pathLength: [0.6, 1],
                stroke: ["currentColor", "var(--pp-accent3, #00f0ff)", "currentColor"],
              }
            : { pathLength: 1, stroke: "currentColor" }
        }
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      {/* Bars */}
      <motion.line
        x1="7"
        y1="17"
        x2="7"
        y2="13"
        variants={barVariants}
        animate={shouldReduceMotion || !isActive ? "initial" : "hover"}
        custom={0}
      />
      <motion.line
        x1="12"
        y1="17"
        x2="12"
        y2="10"
        variants={barVariants}
        animate={shouldReduceMotion || !isActive ? "initial" : "hover"}
        custom={1}
      />
      <motion.line
        x1="17"
        y1="17"
        x2="17"
        y2="6"
        variants={barVariants}
        animate={shouldReduceMotion || !isActive ? "initial" : "hover"}
        custom={2}
      />
    </motion.svg>
  );
}
