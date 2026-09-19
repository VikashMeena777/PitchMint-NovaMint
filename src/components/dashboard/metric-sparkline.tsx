"use client";

import React, { useId } from "react";

export function buildSparklinePath(
  points: number[],
  width = 100,
  height = 30
): string {
  if (!points || points.length === 0) return "";
  if (points.length === 1) return `M 0,${height / 2} L ${width},${height / 2}`;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  return points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * height;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function MetricSparkline({
  data,
  color = "var(--pp-accent1)",
  width = 100,
  height = 28,
  className = "",
}: SparklineProps) {
  const rawId = useId();
  const path = buildSparklinePath(data, width, height);

  if (!path) return null;

  // Build area fill path
  const areaPath = `${path} L ${width},${height} L 0,${height} Z`;
  const gradientId = `sparkline-grad-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
