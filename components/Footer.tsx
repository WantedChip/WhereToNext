import React from "react";
import Link from "next/link";
import { Compass } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-ink-navy border-t border-atlas-blue/60 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand Info */}
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-brass" />
          <span className="font-serif font-bold text-sm tracking-wide uppercase text-chart-paper">
            Where To <span className="text-brass">Next</span>
          </span>
        </div>

        {/* Attribution & Copyright */}
        <div className="text-center md:text-left font-sans text-xs text-chart-paper/60 space-y-1">
          <p>
            &copy; {currentYear} Where To Next. Built as an explorer's ledger.
          </p>
          <p>
            Destinations curated from{" "}
            <a
              href="https://www.hudsonandemily.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brass hover:underline hover:text-brass/90 transition-colors"
            >
              hudsonandemily.com
            </a>.
          </p>
        </div>

        {/* Coordinates stamp */}
        <div className="font-mono text-[10px] text-brass uppercase tracking-widest bg-atlas-blue/40 border border-brass/20 px-3 py-1.5 rounded-sm">
          9.7489° N, 83.7534° W
        </div>

      </div>
    </footer>
  );
}
