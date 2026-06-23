import React from "react";

interface PriceTagProps {
  price: number;
  listPrice?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function PriceTag({ price, listPrice, className = "", size = "md" }: PriceTagProps) {
  const discountPercent =
    listPrice && listPrice > price
      ? Math.round(((listPrice - price) / listPrice) * 100)
      : 0;

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base font-semibold",
    lg: "text-price" // uses custom 20px font-size from globals.css
  };

  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      {/* Current Price */}
      <span className={`${sizeClasses[size]} text-secondary font-bold`}>
        ₹{price.toLocaleString("en-IN")}
      </span>

      {/* List Price & Discount Badge */}
      {discountPercent > 0 && listPrice && (
        <>
          <span className="text-xs text-on-surface-variant line-through font-medium">
            ₹{listPrice.toLocaleString("en-IN")}
          </span>
          <span className="inline-flex items-center rounded-full bg-tertiary/10 px-2 py-0.5 text-[10px] font-bold text-tertiary uppercase">
            {discountPercent}% OFF
          </span>
        </>
      )}
    </div>
  );
}
