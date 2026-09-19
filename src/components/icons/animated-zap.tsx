"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { AnimatedIconProps } from "./types";

export function AnimatedZap({
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
          ? {
              scale: [1, 1.15, 0.95, 1.05, 1],
              rotate: [0, -6, 6, -3, 0],
            }
          : { scale: 1, rotate: 0 }
      }
      transition={{
        duration: 0.5,
        ease: "easeInOut",
      }}
      {...props}
    >
      <defs>
        <linearGradient id="pp-zap-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--pp-accent3, #00f0ff)" />
          <stop offset="100%" stopColor="var(--pp-accent1, #5d5cff)" />
        </linearGradient>
      </defs>
      <motion.polygon
        points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
        animate={
          shouldReduceMotion
            ? {}
            : isActive
            ? {
                fill: ["rgba(93, 92, 255, 0)", "rgba(0, 240, 255, 0.35)", "rgba(93, 92, 255, 0)"],
                stroke: ["currentColor", "var(--pp-accent3, #00f0ff)", "currentColor"],
              }
            : { fill: "rgba(93, 92, 255, 0)", stroke: "currentColor" }
        }
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </motion.svg>
  );
}
