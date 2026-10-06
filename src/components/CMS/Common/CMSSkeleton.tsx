import React from "react";

interface CMSSkeletonProps {
  className?: string;
}

// Placeholder block for loading states. Pulse is opacity-only and disabled under prefers-reduced-motion.
const CMSSkeleton: React.FC<CMSSkeletonProps> = ({ className = "" }) => (
  <div aria-hidden="true" className={`motion-safe:animate-pulse rounded-[6px] bg-ink/[0.06] ${className}`} />
);

export default CMSSkeleton;
