import React from "react";
import { Metadata } from "next";
import { Compass, ShieldAlert, Award, FileText } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About — Where To Next",
  description: "Learn about the travel tier list methodology, artificial intelligence grading rubric, and data attributions.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-ink-navy text-chart-paper font-sans">
      <Nav floating={false} />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Intro */}
        <section className="space-y-4">
          <div className="font-mono text-xs text-brass uppercase tracking-widest flex items-center gap-1.5">
            <Compass className="h-4 w-4" />
            <span>Project Ledger Archives</span>
          </div>
          <h1 className="font-serif font-bold text-4xl sm:text-5xl text-chart-paper tracking-wide uppercase">
            About Where To Next
          </h1>
          <p className="font-sans text-base sm:text-lg text-chart-paper/85 leading-relaxed">
            Where To Next is a personal travel mapping project. It catalogs, normalizes, and grades various global travel destinations, organizing them into a structured index designed for explorers.
          </p>
        </section>

        {/* The Methodology / AI-Assisted */}
        <section className="bg-atlas-blue/30 border border-atlas-blue p-6 sm:p-8 rounded-sm space-y-4 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-brass"></div>
          
          <h2 className="font-serif font-bold text-xl sm:text-2xl text-brass uppercase tracking-wider flex items-center gap-2">
            <Award className="h-5 w-5 text-brass" />
            Methodology & Rating Rubric
          </h2>
          <p className="font-sans text-sm sm:text-base text-chart-paper/80 leading-relaxed">
            Tiers from <strong>S</strong> (Supreme Exploration) down to <strong>E</strong> (Difficult Log) are assigned based on a rigorous multi-factor grading rubric. These scores evaluate historical interest, biodiversity, transit options, and overall budget value.
          </p>
          
          <div className="bg-ink-navy/40 border border-atlas-blue/60 p-4 rounded-xs flex gap-3 items-start">
            <ShieldAlert className="h-5 w-5 text-brass flex-shrink-0 mt-0.5" />
            <div className="font-sans text-xs text-chart-paper/70 space-y-1.5">
              <span className="font-bold text-brass uppercase block">AI-Assisted Editorial Statement</span>
              <p>
                Ratings and log sheets on this platform are generated with AI-assistance against explicit, structured criteria. We make no claims of ultimate editorial authority; these rankings reflect a personal database designed to benchmark travel ROI.
              </p>
            </div>
          </div>
        </section>

        {/* Source Attribution */}
        <section className="space-y-4">
          <h2 className="font-serif font-bold text-xl sm:text-2xl text-brass uppercase tracking-wider flex items-center gap-2">
            <FileText className="h-5 w-5 text-brass" />
            Intellectual Property & Attribution
          </h2>
          <p className="font-sans text-sm sm:text-base text-chart-paper/85 leading-relaxed">
            All primary travel itineraries, adventure logs, and guides hosted on this site are sourced and synthesized from the editorial content compiled by <strong>Hudson & Emily</strong>, professional travel bloggers.
          </p>
          <p className="font-sans text-sm sm:text-base text-chart-paper/85 leading-relaxed">
            We highly recommend exploring their original, unaltered journals for firsthand accounts, photos, and fully-fleshed travel diaries:
          </p>
          <div className="pt-2">
            <a
              href="https://www.hudsonandemily.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-brass text-brass rounded-sm font-sans font-bold text-xs uppercase tracking-wider transition-colors hover:bg-brass hover:text-ink-navy focus:outline-none focus:ring-2 focus:ring-brass"
            >
              Visit hudsonandemily.com
            </a>
          </div>
        </section>

        {/* Stamp / Coordinate ornament */}
        <div className="pt-8 border-t border-atlas-blue/60 flex items-center justify-between font-mono text-[10px] text-brass/60 uppercase tracking-widest">
          <span>Ledger Index: WTN-001</span>
          <span>Verified: 2026-07-04</span>
        </div>

      </main>

      <Footer />
    </div>
  );
}
