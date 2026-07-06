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


    </main>
  );
}
