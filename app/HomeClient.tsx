"use client";

import React from "react";
import dynamic from "next/dynamic";
import Nav from "@/components/Nav";
import { Destination } from "@/lib/types";

// Dynamically import the Globe component to prevent SSR errors on the client-side
const GlobeView = dynamic(() => import("@/components/globe/GlobeView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-ink-navy flex flex-col items-center justify-center text-chart-paper font-sans">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-brass border-t-transparent mb-4"></div>
      <p className="font-mono text-xs text-brass tracking-widest uppercase animate-pulse">
        Unrolling the maps...
      </p>
    </div>
  ),
});

interface HomeClientProps {
  destinations: Destination[];
}

export default function HomeClient({ destinations }: HomeClientProps) {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-ink-navy">
      {/* Floating Header */}
      <Nav floating={true} />

      {/* 3D Interactive Globe */}
      <GlobeView destinations={destinations} />

      {/* Floating Instruction Panel */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-md bg-atlas-blue/90 border border-brass/35 text-chart-paper px-6 py-4 rounded-sm backdrop-blur-md shadow-2xl flex flex-col items-center text-center">
        <h2 className="font-serif font-bold text-lg tracking-wide uppercase mb-1">
          Explore The Ledger
        </h2>
        <p className="font-sans text-xs text-chart-paper/80 mb-3 max-w-sm leading-relaxed">
          Rotate the globe and hover over highlighted countries. Click a region to inspect its field journal and tier rating.
        </p>
        <div className="flex gap-4">
          <a
            href="/search"
            className="px-4 py-1.5 bg-brass text-ink-navy font-sans font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-brass/90 transition-colors shadow-md animate-pulse"
          >
            Search Catalog
          </a>
          <a
            href="/tiers"
            className="px-4 py-1.5 border border-chart-paper/30 hover:border-brass text-chart-paper/90 hover:text-brass font-sans font-semibold text-xs uppercase tracking-wider rounded-xs transition-colors"
          >
            Tier Rankings
          </a>
        </div>
      </div>
    </main>
  );
}
