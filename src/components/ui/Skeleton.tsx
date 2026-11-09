import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-[#F1F5F9] rounded-xl animate-pulse ${className}`}
      aria-hidden="true"
    />
  );
}
