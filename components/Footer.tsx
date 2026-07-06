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
        </div>

      </div>
    </footer>
  );
}
