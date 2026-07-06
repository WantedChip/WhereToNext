"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Menu, X, Star, Search, Info } from "lucide-react";

interface NavProps {
  floating?: boolean;
}

export default function Nav({ floating = false }: NavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { href: "/tiers", label: "Tiers", icon: Star },
    { href: "/search", label: "Search", icon: Search },
    { href: "/planner", label: "Planner", icon: Compass },
    { href: "/about", label: "About", icon: Info },
  ];

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <header
      className={`
        w-full z-50 transition-all duration-300
        ${
          floating
            ? "absolute top-0 left-0 bg-gradient-to-b from-ink-navy/80 to-transparent"
            : "sticky top-0 bg-ink-navy/95 border-b border-atlas-blue/60 backdrop-blur-md"
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 group transition-colors text-chart-paper focus:outline-none focus:ring-2 focus:ring-brass focus:ring-offset-2 focus:ring-offset-ink-navy rounded px-2 py-1"
          >
            <Compass className="h-7 w-7 text-brass group-hover:rotate-45 transition-transform duration-500 ease-out" />
            <span className="font-serif font-bold text-xl sm:text-2xl tracking-wide uppercase">
              Where To <span className="text-brass">Next</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const LinkIcon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-sans font-medium text-sm uppercase tracking-wider
                    transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brass
                    ${
                      isActive
                        ? "text-brass border-b-2 border-brass bg-brass/5"
                        : "text-chart-paper/85 hover:text-brass hover:bg-atlas-blue/30"
                    }
                  `}
                >
                  <LinkIcon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/random"
              className="px-4 py-2 border border-brass text-brass rounded-sm font-sans font-bold text-xs uppercase tracking-wider transition-all duration-300 bg-transparent hover:bg-brass hover:text-ink-navy focus:outline-none focus:ring-2 focus:ring-brass focus:ring-offset-2 focus:ring-offset-ink-navy"
            >
              Random Destination
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              type="button"
              className="text-chart-paper hover:text-brass focus:outline-none focus:ring-2 focus:ring-brass rounded p-1.5"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-ink-navy/98 border-b border-atlas-blue/60 backdrop-blur-lg animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="px-2 pt-2 pb-6 space-y-2 sm:px-3 text-center">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    block px-4 py-3 rounded-md font-sans font-semibold text-base uppercase tracking-wider transition-colors
                    ${
                      isActive
                        ? "text-brass bg-brass/10"
                        : "text-chart-paper hover:text-brass hover:bg-atlas-blue/40"
                    }
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-4">
              <Link
                href="/random"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-block w-full max-w-[200px] px-4 py-3 border border-brass text-brass rounded font-sans font-bold text-sm uppercase tracking-wider transition-all bg-transparent hover:bg-brass hover:text-ink-navy"
              >
                Random Destination
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
