import React from "react";
import { Metadata } from "next";
import { Compass, BookOpen } from "lucide-react";
import { getAllDestinations } from "@/lib/destinations";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import TierBadge from "@/components/TierBadge";
import DestinationCard from "@/components/DestinationCard";

export const metadata: Metadata = {
  title: "Tier Rankings — Where To Next",
  description: "Travel destinations categorized into S to E tiers based on experience quality, budget, and exploration values.",
};

const TIER_ORDER = ["S", "A", "B", "C", "D", "E"] as const;
type TierType = (typeof TIER_ORDER)[number];

interface TierBandConfig {
  tier: TierType;
  title: string;
  desc: string;
  bgStyles: string;
  textStyles: string;
  borderStyles: string;
}

const TIER_CONFIGS: Record<TierType, TierBandConfig> = {
  S: {
    tier: "S",
    title: "Supreme Exploration",
    desc: "Unrivaled, bucket-list destinations that offer transcendent travel experiences.",
    bgStyles: "bg-brass/5",
    textStyles: "text-brass",
    borderStyles: "border-brass/25",
  },
  A: {
    tier: "A",
    title: "Elite Adventures",
    desc: "Exceptional cultural and nature hubs with high rewards and solid infrastructure.",
    bgStyles: "bg-sea-teal/5",
    textStyles: "text-sea-teal",
    borderStyles: "border-sea-teal/25",
  },
  B: {
    tier: "B",
    title: "Highly Recommend",
    desc: "Great experiences overall; worth compiling routes and scheduling visits.",
    bgStyles: "bg-[#5C8AB3]/5",
    textStyles: "text-[#5C8AB3]",
    borderStyles: "border-[#5C8AB3]/25",
  },
  C: {
    tier: "C",
    title: "Worthwhile Journeys",
    desc: "Enjoyable spots that require specific travel preferences or budget considerations.",
    bgStyles: "bg-[#7A8F8B]/5",
    textStyles: "text-[#7A8F8B]",
    borderStyles: "border-[#7A8F8B]/25",
  },
  D: {
    tier: "D",
    title: "Niche Interest",
    desc: "Destinations with high cost, complexity, or limited seasonal access.",
    bgStyles: "bg-[#C27E6A]/5",
    textStyles: "text-[#C27E6A]",
    borderStyles: "border-[#C27E6A]/25",
  },
  E: {
    tier: "E",
    title: "Difficult Log",
    desc: "Low returns or massive travel friction. Proceed with caution.",
    bgStyles: "bg-oxide-red/5",
    textStyles: "text-oxide-red",
    borderStyles: "border-oxide-red/25",
  },
};

export default function TiersPage() {
  const allDestinations = getAllDestinations();

  // Group destinations by tier (excluding nulls)
  const groupedDestinations = allDestinations.reduce<Record<TierType, typeof allDestinations>>(
    (acc, dest) => {
      if (dest.tier && TIER_ORDER.includes(dest.tier as TierType)) {
        acc[dest.tier as TierType].push(dest);
      }
      return acc;
    },
    { S: [], A: [], B: [], C: [], D: [], E: [] }
  );

  return (
    <div className="flex flex-col min-h-screen bg-ink-navy text-chart-paper font-sans">
      <Nav floating={false} />

      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          {/* Page Intro Header */}
          <div className="max-w-3xl">
            <div className="font-mono text-xs text-brass uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <Compass className="h-4 w-4" />
              <span>Classification index</span>
            </div>
            <h1 className="font-serif font-bold text-4xl sm:text-5xl text-chart-paper tracking-wide uppercase mb-3">
              Destination Tiers
            </h1>
            <p className="font-sans text-sm sm:text-base text-chart-paper/80 leading-relaxed">
              Our travel entries rated against a rigorous ledger. Tiers range from Supreme (S) down to Difficult Log (E) based on cultural richness, natural wonder, transit options, and cost-benefit ratios.
            </p>
          </div>
        </div>

        {/* Tier Bands List */}
        <div className="space-y-12">
          {TIER_ORDER.map((tierKey) => {
            const config = TIER_CONFIGS[tierKey];
            const destinations = groupedDestinations[tierKey];

            return (
              <section
                key={tierKey}
                className={`
                  w-full border-y border-t-2 border-b border-dashed py-8
                  ${config.bgStyles} ${config.borderStyles}
                `}
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  {/* Tier Label Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      {/* Stamp badge representing this tier */}
                      <TierBadge tier={tierKey} size="md" />
                      <div>
                        <h2 className={`font-serif font-bold text-xl sm:text-2xl uppercase tracking-wider ${config.textStyles}`}>
                          {config.title}
                        </h2>
                        <p className="font-sans text-xs text-chart-paper/60 max-w-xl">
                          {config.desc}
                        </p>
                      </div>
                    </div>
                    {/* Count in Mono */}
                    <div className="font-mono text-xs text-brass uppercase tracking-widest">
                      Entries: {destinations.length.toString().padStart(2, "0")}
                    </div>
                  </div>

                  {/* Horizontal scrolling card deck */}
                  {destinations.length > 0 ? (
                    <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin">
                      {destinations.map((dest) => (
                        <div
                          key={dest.slug}
                          className="flex-shrink-0 w-80 snap-start"
                        >
                          <DestinationCard destination={dest} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-chart-paper/10 rounded-sm p-10 flex flex-col items-center justify-center text-center">
                      <BookOpen className="h-8 w-8 text-chart-paper/20 mb-2" />
                      <p className="font-sans text-xs text-chart-paper/50 italic">
                        No destinations filed under this tier yet.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
