"use client";

import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--pp-bg-deepest)] text-[var(--pp-text-primary)] relative overflow-x-hidden font-sans selection:bg-[var(--pp-accent1)] selection:text-white">
      {children}
    </div>
  );
}
