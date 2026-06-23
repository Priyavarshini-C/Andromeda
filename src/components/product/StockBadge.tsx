import React from "react";

interface StockBadgeProps {
  stock: number;
  className?: string;
}

export default function StockBadge({ stock, className = "" }: StockBadgeProps) {
  let badgeStyles = "bg-success/10 text-success border-success/20";
  let label = "In Stock";

  if (stock === 0) {
    badgeStyles = "bg-error/10 text-error border-error/20";
    label = "Out of Stock";
  } else if (stock <= 5) {
    badgeStyles = "bg-tertiary/10 text-tertiary border-tertiary/20";
    label = `Only ${stock} Left`;
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${badgeStyles} ${className}`}
    >
      {label}
    </span>
  );
}
