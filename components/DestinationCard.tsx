import React from "react";
import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";
import { Destination } from "@/lib/types";
import { getCoordinatesForCountry } from "@/lib/coordinates";
import TierBadge from "./TierBadge";

interface DestinationCardProps {
  destination: Destination;
}

export default function DestinationCard({ destination }: DestinationCardProps) {
  const coords = getCoordinatesForCountry(destination.country);
  const latStr = `${Math.abs(coords.lat).toFixed(4)}° ${coords.lat >= 0 ? "N" : "S"}`;
  const lngStr = `${Math.abs(coords.lng).toFixed(4)}° ${coords.lng >= 0 ? "E" : "W"}`;

  return (
    <div
      className={`
        relative group flex flex-col justify-between
        bg-chart-paper text-ink-navy border border-ink-navy/15
        p-5 w-full h-64 shadow-md rounded-xs
        hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out
        motion-reduce:hover:translate-y-0 motion-reduce:transition-none
      `}
    >
      {/* Notebook/Postcard layout lines (subtle grid background) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#12213A_1px,transparent_1px),linear-gradient(to_bottom,#12213A_1px,transparent_1px)] bg-[size:12px_12px] rounded-xs"></div>

      <div className="space-y-3 relative z-10">
        {/* Top: Coordinates Eyebrow & Tier Badge */}
        <div className="flex items-start justify-between gap-4">
          <span className="font-mono text-[10px] text-brass uppercase tracking-widest font-semibold">
            {latStr}, {lngStr}
          </span>
          {destination.tier && (
            <div className="scale-75 origin-top-right">
              <TierBadge tier={destination.tier} size="md" />
            </div>
          )}
        </div>

        {/* Title & Country */}
        <div>
          <h3 className="font-serif font-bold text-xl leading-tight group-hover:text-brass transition-colors line-clamp-1">
            {destination.destination}
          </h3>
          <p className="font-mono text-[10px] text-ink-navy/60 uppercase tracking-widest flex items-center gap-1 mt-0.5">
            <Compass className="h-3 w-3 text-brass/70" />
            {destination.country}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {destination.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 bg-ink-navy/5 border border-ink-navy/10 text-ink-navy/70 rounded-xs text-[10px] uppercase font-sans font-medium"
            >
              {tag}
            </span>
          ))}
          {destination.tags.length > 3 && (
            <span className="text-[10px] text-ink-navy/50 font-mono font-medium self-center pl-0.5">
              +{destination.tags.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Detail Link */}
      <div className="relative z-10 pt-3 border-t border-ink-navy/10 flex items-center justify-between">
        <span className="font-mono text-[10px] text-ink-navy/50 uppercase">
          {destination.region}
        </span>
        <Link
          href={`/destination/${destination.slug}`}
          className="inline-flex items-center gap-1 font-sans font-bold text-xs uppercase tracking-wider text-sea-teal hover:text-brass transition-colors focus:outline-none focus:ring-1 focus:ring-brass rounded px-0.5"
          aria-label={`Read journal entry for ${destination.destination}`}
        >
          View Log
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
        </Link>
      </div>
    </div>
  );
}
