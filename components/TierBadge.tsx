import React from "react";

interface TierBadgeProps {
  tier: "S" | "A" | "B" | "C" | "D" | "E" | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function TierBadge({ tier, size = "md", className = "" }: TierBadgeProps) {
  if (!tier) return null;

  // Map tiers to custom theme colors
  const colorMap = {
    S: "text-brass border-brass/90 bg-brass/5 hover:bg-brass/10",
    A: "text-sea-teal border-sea-teal/90 bg-sea-teal/5 hover:bg-sea-teal/10",
    B: "text-[#5C8AB3] border-[#5C8AB3]/90 bg-[#5C8AB3]/5 hover:bg-[#5C8AB3]/10",
    C: "text-[#7A8F8B] border-[#7A8F8B]/90 bg-[#7A8F8B]/5 hover:bg-[#7A8F8B]/10",
    D: "text-[#C27E6A] border-[#C27E6A]/90 bg-[#C27E6A]/5 hover:bg-[#C27E6A]/10",
    E: "text-oxide-red border-oxide-red/90 bg-oxide-red/5 hover:bg-oxide-red/10",
  };

  // Map tiers to deterministic rotations for hand-stamped passport look
  const rotationMap = {
    S: "rotate-2",
    A: "-rotate-2",
    B: "rotate-1",
    C: "-rotate-3",
    D: "rotate-3",
    E: "-rotate-1",
  };

  // Size configurations
  const sizeMap = {
    sm: "w-8 h-8 text-sm border-[1.5px] border-t-[2px] border-r-[1.5px] border-b-[2px] border-l-[1.8px]",
    md: "w-12 h-12 text-lg border-[2px] border-t-[2.5px] border-r-[2px] border-b-[2.5px] border-l-[2.2px]",
    lg: "w-16 h-16 text-2xl border-[2.5px] border-t-[3px] border-r-[2.2px] border-b-[3px] border-l-[2.8px]",
    xl: "w-24 h-24 text-4xl border-[3.5px] border-t-[4px] border-r-[3.2px] border-b-[4.5px] border-l-[3.8px]",
  };

  const colorClasses = colorMap[tier] || "text-chart-paper border-chart-paper/80 bg-chart-paper/5";
  const rotationClass = rotationMap[tier] || "rotate-0";
  const sizeClass = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`
        inline-flex items-center justify-center
        rounded-full font-serif font-bold uppercase tracking-wider
        shadow-[inset_0_0_8px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.1)]
        transition-all duration-300 select-none
        motion-reduce:transform-none motion-reduce:rotate-0
        ${colorClasses}
        ${rotationClass}
        ${sizeClass}
        ${className}
      `}
      title={`${tier} Tier`}
    >
      <span className="relative top-[0.5px]">{tier}</span>
    </div>
  );
}
