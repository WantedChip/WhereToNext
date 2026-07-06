"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Compass, Calendar, Trash2 } from "lucide-react";
import { Destination } from "@/lib/types";
import { getPlannerItems, removePlannerItem, updatePlannerNotes, PlannerItem } from "@/lib/planner-storage";
import DestinationCard from "@/components/DestinationCard";

interface PlannerClientProps {
  destinations: Destination[];
}

export default function PlannerClient({ destinations }: PlannerClientProps) {
  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPlannerItems(getPlannerItems());
    setMounted(true);

    const handleUpdate = () => {
      setPlannerItems(getPlannerItems());
    };

    window.addEventListener("planner-updated", handleUpdate);
    return () => {
      window.removeEventListener("planner-updated", handleUpdate);
    };
  }, []);

  const handleNotesChange = (slug: string, val: string) => {
    updatePlannerNotes(slug, val);
    // update local state
    setPlannerItems(prev =>
      prev.map(item => (item.slug === slug ? { ...item, notes: val } : item))
    );
  };

  const handleRemove = (slug: string) => {
    removePlannerItem(slug);
  };

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-chart-paper/50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brass border-t-transparent mb-4"></div>
        <p className="font-mono text-xs uppercase tracking-widest animate-pulse">Loading Journal...</p>
      </div>
    );
  }

  // Filter destinations to only active items
  const activeItems = plannerItems.map(pItem => {
    const dest = destinations.find(d => d.slug === pItem.slug);
    return dest ? { dest, pItem } : null;
  }).filter((x): x is { dest: Destination; pItem: PlannerItem } => x !== null);

  // Sort by addedAt descending (newest first)
  activeItems.sort((a, b) => b.pItem.addedAt - a.pItem.addedAt);

  if (activeItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 px-6 border border-dashed border-brass/20 bg-atlas-blue/10 rounded-sm shadow-xl">
        <Compass className="h-12 w-12 text-brass/40 mx-auto mb-4" />
        <h2 className="font-serif font-bold text-2xl text-chart-paper uppercase tracking-wider mb-2">
          Planner is Empty
        </h2>
        <p className="font-sans text-sm text-chart-paper/75 leading-relaxed mb-6">
          No destinations pinned to your explorer's ledger yet. Rotate the globe, search the catalog, or inspect categories to begin drafting your custom travel route.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/search"
            className="px-6 py-2 bg-brass text-ink-navy font-sans font-bold text-xs uppercase tracking-widest rounded-xs hover:bg-brass/90 transition-colors shadow-md"
          >
            Search Catalog
          </Link>
          <Link
            href="/tiers"
            className="px-6 py-2 border border-chart-paper/30 hover:border-brass text-chart-paper hover:text-brass font-sans font-bold text-xs uppercase tracking-widest rounded-xs transition-all"
          >
            Explore Tiers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div>
        <div className="font-mono text-xs text-brass uppercase tracking-widest flex items-center gap-1.5 mb-2">
          <Calendar className="h-4 w-4" />
          <span>Explorer's Itinerary</span>
        </div>
        <h1 className="font-serif font-bold text-4xl sm:text-5xl text-chart-paper tracking-wide uppercase mb-3">
          Custom Trip Planner
        </h1>
        <p className="font-sans text-sm sm:text-base text-chart-paper/80 leading-relaxed max-w-3xl">
          Your personal travel bucket list, stored locally on this device. Draft custom route notes, track seasonal logs, and organize your next supreme expedition.
        </p>
      </div>

      {/* Planner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activeItems.map(({ dest, pItem }) => (
          <div
            key={dest.slug}
            className="flex flex-col bg-atlas-blue/15 border border-atlas-blue/40 rounded-sm overflow-hidden hover:border-brass/30 transition-all duration-300 shadow-md group"
          >
            {/* Embedded Destination Card */}
            <div className="border-b border-atlas-blue/30 relative flex-grow-0">
              <DestinationCard destination={dest} />
            </div>

            {/* Note Input & Action Block */}
            <div className="p-5 flex-grow flex flex-col justify-between gap-4 bg-atlas-blue/10">
              <div className="space-y-1.5">
                <label className="block font-mono text-[9px] text-brass uppercase tracking-wider">
                  Field Notes & Details
                </label>
                <textarea
                  value={pItem.notes || ""}
                  onChange={(e) => handleNotesChange(dest.slug, e.target.value)}
                  placeholder="Record optimal flights, visa dates, or personal budget details..."
                  className="w-full h-24 bg-ink-navy/60 border border-brass/20 focus:border-brass rounded-xs p-2.5 text-xs font-sans text-chart-paper focus:outline-none resize-none transition-all duration-200"
                />
              </div>

              <div className="flex items-center justify-between border-t border-atlas-blue/30 pt-3 mt-1">
                <span className="font-mono text-[9px] text-chart-paper/40 uppercase">
                  Pinned: {new Date(pItem.addedAt).toLocaleDateString(undefined, { dateStyle: "short" })}
                </span>
                <button
                  onClick={() => handleRemove(dest.slug)}
                  className="inline-flex items-center gap-1 font-mono text-[10px] text-oxide-red/80 hover:text-oxide-red hover:underline uppercase tracking-wider transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
