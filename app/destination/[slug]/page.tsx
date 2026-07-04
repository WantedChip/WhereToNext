import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Compass, Calendar, Wallet, Navigation } from "lucide-react";
import { getAllDestinations, getDestinationBySlug } from "@/lib/destinations";
import { getCoordinatesForCountry } from "@/lib/coordinates";
import { renderMarkdown } from "@/lib/markdown";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import TierBadge from "@/components/TierBadge";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const destinations = getAllDestinations();
  return destinations.map((d) => ({
    slug: d.slug,
  }));
}

export default async function DestinationPage({ params }: PageProps) {
  const { slug } = await params;
  const destination = getDestinationBySlug(slug);

  if (!destination) {
    notFound();
  }

  const coords = getCoordinatesForCountry(destination.country);
  const latStr = `${Math.abs(coords.lat).toFixed(4)}° ${coords.lat >= 0 ? "N" : "S"}`;
  const lngStr = `${Math.abs(coords.lng).toFixed(4)}° ${coords.lng >= 0 ? "E" : "W"}`;

  return (
    <div className="flex flex-col min-h-screen bg-ink-navy text-chart-paper font-sans">
      <Nav floating={false} />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brass hover:text-brass/80 transition-colors focus:outline-none focus:ring-2 focus:ring-brass rounded px-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to search
          </Link>
        </div>

        {/* Header Block */}
        <header className="relative border border-atlas-blue bg-atlas-blue/30 p-6 sm:p-10 mb-10 rounded-sm shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
          {/* Subtle overlay lines for journal aesthetic */}
          <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,#E8DFC8_1px,transparent_1px),linear-gradient(to_bottom,#E8DFC8_1px,transparent_1px)] bg-[size:16px_16px]"></div>
          
          <div className="space-y-2 relative z-10">
            {/* Coordinate Eyebrow */}
            <div className="font-mono text-xs sm:text-sm text-brass font-semibold tracking-widest uppercase">
              {latStr}, {lngStr}
            </div>
            {/* Title */}
            <h1 className="font-serif font-bold text-3xl sm:text-5xl text-chart-paper leading-tight">
              {destination.title}
            </h1>
            {/* Location Subtitle */}
            <div className="font-mono text-xs text-chart-paper/60 uppercase tracking-widest flex items-center gap-1.5 mt-1">
              <Compass className="h-3.5 w-3.5 text-brass" />
              <span>
                {destination.destination}, {destination.country} ({destination.region})
              </span>
            </div>
          </div>

          {/* Signature Tier Badge */}
          {destination.tier && (
            <div className="flex-shrink-0 relative z-10 flex items-center gap-3">
              <span className="font-mono text-xs text-brass uppercase tracking-wider hidden sm:inline">
                Journal Rating:
              </span>
              <TierBadge tier={destination.tier} size="lg" />
            </div>
          )}
        </header>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Article Content */}
          <article className="lg:col-span-2 space-y-8 bg-atlas-blue/10 border border-atlas-blue/40 p-6 sm:p-8 rounded-sm">
            {renderMarkdown(destination.content)}
          </article>

          {/* Sidebar / Field Notes Metadata */}
          <aside className="space-y-8">
            <section className="bg-atlas-blue/40 border border-brass/25 p-6 rounded-sm shadow-md space-y-6 relative overflow-hidden">
              {/* Journal notebook page header style */}
              <div className="absolute top-0 left-0 w-full h-1 bg-brass"></div>
              
              <h3 className="font-serif font-bold text-lg text-brass uppercase tracking-wider border-b border-atlas-blue/60 pb-2">
                Field Log Metrics
              </h3>

              {/* Best Months */}
              <div className="space-y-1.5">
                <h4 className="font-mono text-xs text-brass uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Best Season
                </h4>
                <div className="font-sans text-sm text-chart-paper/95 pl-5">
                  {destination.best_months && destination.best_months.length > 0 ? (
                    <span className="capitalize">{destination.best_months.join(", ")}</span>
                  ) : (
                    <span className="italic text-chart-paper/50 font-mono text-xs">Not compiled yet</span>
                  )}
                </div>
              </div>

              {/* Budget Tier */}
              <div className="space-y-1.5">
                <h4 className="font-mono text-xs text-brass uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5" />
                  Budget Level
                </h4>
                <div className="font-sans text-sm text-chart-paper/95 pl-5 space-y-1">
                  {destination.budget_tier ? (
                    <>
                      <div>
                        <span className="font-semibold text-brass">Backpacker:</span>{" "}
                        {destination.budget_tier.backpacker || "N/A"}
                      </div>
                      <div>
                        <span className="font-semibold text-brass">Luxury:</span>{" "}
                        {destination.budget_tier.luxury || "N/A"}
                      </div>
                    </>
                  ) : (
                    <span className="italic text-chart-paper/50 font-mono text-xs">Not compiled yet</span>
                  )}
                </div>
              </div>

              {/* Transit Notes */}
              <div className="space-y-1.5">
                <h4 className="font-mono text-xs text-brass uppercase tracking-wider flex items-center gap-1.5">
                  <Navigation className="h-3.5 w-3.5" />
                  Transit Notes
                </h4>
                <div className="font-sans text-sm text-chart-paper/95 pl-5 leading-relaxed">
                  {destination.transit_notes ? (
                    destination.transit_notes
                  ) : (
                    <span className="italic text-chart-paper/50 font-mono text-xs">Not compiled yet</span>
                  )}
                </div>
              </div>

              {/* Explorer Scores */}
              {destination.score && (
                <div className="space-y-2 pt-2 border-t border-atlas-blue/60">
                  <h4 className="font-mono text-xs text-brass uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="h-3.5 w-3.5" />
                    Explorer Scores
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-5 text-xs font-mono text-chart-paper/95">
                    <div>
                      <span className="text-brass/80">Cost Value:</span>{" "}
                      {destination.score.cost_value}/10
                    </div>
                    <div>
                      <span className="text-brass/80">Uniqueness:</span>{" "}
                      {destination.score.uniqueness}/10
                    </div>
                    <div>
                      <span className="text-brass/80">Transit Ease:</span>{" "}
                      {destination.score.transit_ease}/10
                    </div>
                    <div>
                      <span className="text-brass/80">Family Friendly:</span>{" "}
                      {destination.score.family_friendliness}/10
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="space-y-1.5 pt-2">
                <h4 className="font-mono text-xs text-brass uppercase tracking-wider">Tags & Focus</h4>
                <div className="flex flex-wrap gap-2 pl-1 pt-1">
                  {destination.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-ink-navy/60 border border-atlas-blue text-chart-paper/80 rounded-sm font-sans text-xs uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Reference Attribution */}
              <div className="border-t border-atlas-blue/60 pt-4 mt-4 text-xs text-chart-paper/60 leading-relaxed">
                This entry compiles write-ups sourced from Hudson & Emily. View the original record at:
                <a
                  href={destination.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 text-brass underline hover:text-brass/90 break-words font-mono focus:outline-none focus:ring-1 focus:ring-brass"
                >
                  {destination.source_url}
                </a>
              </div>
            </section>
          </aside>

        </div>
      </main>

      <Footer />
    </div>
  );
}
