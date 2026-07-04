"use client";

import React, { useState, useMemo } from "react";
import { Compass, Search, Filter, RefreshCw, Star, Info, HelpCircle } from "lucide-react";
import { Destination } from "@/lib/types";
import {
  MatchSpan,
  MatchResult,
  matchBroad,
  matchStrict,
  matchWholeWord,
  matchSubstring,
  matchFuzzy,
} from "@/lib/search";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DestinationCard from "@/components/DestinationCard";
import HighlightedText from "@/components/HighlightedText";

type SearchMode = "Broad" | "Strict" | "Whole Word" | "Substring" | "Fuzzy";

interface SearchClientProps {
  initialDestinations: Destination[];
}

interface SearchResult {
  destination: Destination;
  titleMatches: MatchSpan[];
  destMatches: MatchSpan[];
  countryMatches: MatchSpan[];
  contentMatches: MatchSpan[];
  snippet: string;
  score?: number;
}

export default function SearchClient({ initialDestinations }: SearchClientProps) {
  const [query, setQuery] = useState("");
  const [activeMode, setActiveMode] = useState<SearchMode>("Broad");
  const [ignoreSpacing, setIgnoreSpacing] = useState(false);

  // Filters
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  // Unique regions and tiers in dataset
  const allRegions = useMemo(() => {
    const regions = new Set<string>();
    initialDestinations.forEach((d) => {
      if (d.region) regions.add(d.region);
    });
    return Array.from(regions);
  }, [initialDestinations]);

  const allTiers = ["S", "A", "B", "C", "D", "E", "Untiered"];

  // Tooltip descriptions and computed example matches
  const tooltipConfigs = useMemo(() => {
    const configs: Record<SearchMode, { label: string; desc: string; query: string; text: string; matches: MatchSpan[] }> = {
      Broad: {
        label: "Broad",
        desc: "Matches if all query words are present in any order/position.",
        query: "red apple",
        text: "the apple that is bright red",
        matches: matchBroad("red apple", "the apple that is bright red", false).matches,
      },
      Strict: {
        label: "Strict",
        desc: "Matches the exact normalized phrase sequence.",
        query: "wet paint",
        text: "wet paint sign",
        matches: matchStrict("wet paint", "wet paint sign", false).matches,
      },
      "Whole Word": {
        label: "Whole Word",
        desc: "Matches complete words only, avoiding substring matches.",
        query: "cat",
        text: "the cat sat on scatter",
        matches: matchWholeWord("cat", "the cat sat on scatter", false).matches,
      },
      Substring: {
        label: "Substring",
        desc: "Matches the search term anywhere, including inside other words.",
        query: "cat",
        text: "the category of scatter",
        matches: matchSubstring("cat", "the category of scatter", false).matches,
      },
      Fuzzy: {
        label: "Fuzzy",
        desc: "Typo-tolerant matching using Levenshtein distance (min query length: 3).",
        query: "javascrit",
        text: "learning javascript",
        matches: matchFuzzy("javascrit", "learning javascript").matches,
      },
    };
    return configs;
  }, []);

  // Filter chips selection helper
  const toggleFilter = (val: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(val)) {
      setter(list.filter((x) => x !== val));
    } else {
      setter([...list, val]);
    }
  };

  const clearAllFilters = () => {
    setQuery("");
    setSelectedTiers([]);
    setSelectedRegions([]);
  };

  // Perform multi-mode search and highlighting
  const searchResults = useMemo(() => {
    // If no query and no filters, return empty as per spec: "Empty query -> return no results"
    const hasQuery = query.trim().length > 0;
    const hasFilters = selectedTiers.length > 0 || selectedRegions.length > 0;

    if (!hasQuery && !hasFilters) {
      return [];
    }

    let results: SearchResult[] = [];

    for (const dest of initialDestinations) {
      // 1. Check Filters first
      const destTierStr = dest.tier || "Untiered";
      if (selectedTiers.length > 0 && !selectedTiers.includes(destTierStr)) {
        continue;
      }
      if (selectedRegions.length > 0 && !selectedRegions.includes(dest.region)) {
        continue;
      }

      // If query is empty but filters match, add it immediately with empty matches
      if (!hasQuery) {
        results.push({
          destination: dest,
          titleMatches: [],
          destMatches: [],
          countryMatches: [],
          contentMatches: [],
          snippet: "",
        });
        continue;
      }

      // 2. Perform query search on fields using selected search mode
      let titleRes: MatchResult = { text: dest.title, matches: [] };
      let destRes: MatchResult = { text: dest.destination, matches: [] };
      let countryRes: MatchResult = { text: dest.country, matches: [] };
      let contentRes: MatchResult = { text: dest.content, matches: [] };
      let score: number | undefined;

      const runMatch = (text: string) => {
        switch (activeMode) {
          case "Broad":
            return matchBroad(query, text, ignoreSpacing);
          case "Strict":
            return matchStrict(query, text, ignoreSpacing);
          case "Whole Word":
            return matchWholeWord(query, text, ignoreSpacing);
          case "Substring":
            return matchSubstring(query, text, ignoreSpacing);
          case "Fuzzy":
            return matchFuzzy(query, text);
          default:
            return { text, matches: [] };
        }
      };

      titleRes = runMatch(dest.title);
      destRes = runMatch(dest.destination);
      countryRes = runMatch(dest.country);
      contentRes = runMatch(dest.content);

      if (activeMode === "Fuzzy") {
        score = titleRes.score ?? destRes.score ?? countryRes.score ?? contentRes.score;
      }

      const isMatch =
        titleRes.matches.length > 0 ||
        destRes.matches.length > 0 ||
        countryRes.matches.length > 0 ||
        contentRes.matches.length > 0;

      if (isMatch) {
        // Create match snippet for body text
        let snippet = "";
        if (contentRes.matches.length > 0) {
          const firstMatch = contentRes.matches[0];
          const start = Math.max(0, firstMatch.start - 60);
          const end = Math.min(dest.content.length, firstMatch.end + 90);
          const rawSnippet = dest.content.slice(start, end);
          
          // Re-evaluate offsets relative to the snippet viewport
          const offsetShift = start;
          const snippetMatches = contentRes.matches
            .filter((m) => m.start >= start && m.end <= end)
            .map((m) => ({
              start: m.start - offsetShift,
              end: m.end - offsetShift,
            }));

          snippet = rawSnippet;
          // Temporarily attach offset shifted match result to draw highlights on snippet
          contentRes.matches = snippetMatches;
        } else {
          // Fallback to start of description
          snippet = dest.content.slice(0, 150) + "...";
          contentRes.matches = [];
        }

        results.push({
          destination: dest,
          titleMatches: titleRes.matches,
          destMatches: destRes.matches,
          countryMatches: countryRes.matches,
          contentMatches: contentRes.matches,
          snippet,
          score,
        });
      }
    }

    // Sort results by score if fuzzy, or keep default
    if (activeMode === "Fuzzy") {
      results.sort((a, b) => (a.score ?? 1) - (b.score ?? 1));
    }

    return results;
  }, [query, activeMode, ignoreSpacing, selectedTiers, selectedRegions, initialDestinations]);

  return (
    <div className="flex flex-col min-h-screen bg-ink-navy text-chart-paper font-sans">
      <Nav floating={false} />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Intro */}
        <div className="mb-8">
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-chart-paper tracking-wide uppercase flex items-center gap-2">
            <Search className="h-8 w-8 text-brass" />
            Field Log Ledger Search
          </h1>
          <p className="font-sans text-sm text-chart-paper/70 mt-1 max-w-2xl">
            Query the archives using standard index matches, fuzzy edit distances, or strict phrase mappings. Use filters to narrow down tiers and coordinates.
          </p>
        </div>

        {/* Search controls card */}
        <div className="bg-atlas-blue/40 border border-atlas-blue p-6 rounded-sm space-y-6 mb-10 shadow-lg relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-brass"></div>

          {/* Search bar input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brass/70" />
            <input
              type="text"
              placeholder='Type search query here... (e.g. "glacier", "waterfalls", "costa rica")'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-ink-navy/80 border border-atlas-blue/80 hover:border-brass/50 focus:border-brass rounded-sm pl-12 pr-4 py-3.5 text-chart-paper placeholder-chart-paper/40 font-sans text-sm transition-all outline-none focus:ring-1 focus:ring-brass"
            />
          </div>

          {/* Search modes selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-brass uppercase tracking-wider">
                Matching Algorithm Mode:
              </span>
              {activeMode === "Fuzzy" && query.length > 0 && query.length < 3 && (
                <span className="text-[10px] text-oxide-red font-mono animate-pulse">
                  Fuzzy requires min 3 characters
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {(["Broad", "Strict", "Whole Word", "Substring", "Fuzzy"] as SearchMode[]).map((mode) => {
                const conf = tooltipConfigs[mode];
                const isActive = activeMode === mode;
                return (
                  <div key={mode} className="relative group flex items-center">
                    <button
                      onClick={() => setActiveMode(mode)}
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-mono text-xs uppercase tracking-wider transition-all select-none
                        ${
                          isActive
                            ? "bg-brass text-ink-navy font-bold shadow-md"
                            : "bg-atlas-blue/70 hover:bg-atlas-blue hover:text-brass text-chart-paper/70"
                        }
                      `}
                    >
                      {mode}
                    </button>

                    {/* Tooltip trigger ⓘ */}
                    <div className="relative inline-block ml-1">
                      <span className="text-chart-paper/40 hover:text-brass cursor-help p-1">
                        <HelpCircle className="h-3.5 w-3.5" />
                      </span>

                      {/* Tooltip Hover Overlay */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 bg-atlas-blue border border-brass/40 p-4 rounded-sm shadow-2xl z-30 pointer-events-none transition-opacity duration-200">
                        <div className="font-serif font-bold text-sm text-brass border-b border-atlas-blue/60 pb-1 mb-2 uppercase tracking-wide">
                          {mode} Match
                        </div>
                        <p className="font-sans text-[11px] text-chart-paper/85 mb-3 leading-relaxed">
                          {conf.desc}
                        </p>
                        <div className="bg-ink-navy/70 p-2 rounded-xs border border-atlas-blue/40 font-mono text-[10px] space-y-1 text-chart-paper/80">
                          <div>
                            <span className="text-brass">Query:</span> &ldquo;{conf.query}&rdquo;
                          </div>
                          <div>
                            <span className="text-brass">Match:</span>{" "}
                            <HighlightedText text={conf.text} matches={conf.matches} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ignore spacing checkbox & Clear Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-atlas-blue/50">
            <label className="flex items-center gap-2 cursor-pointer font-sans text-xs text-chart-paper/80 select-none">
              <input
                type="checkbox"
                checked={ignoreSpacing}
                onChange={(e) => setIgnoreSpacing(e.target.checked)}
                disabled={activeMode === "Fuzzy" || activeMode === "Whole Word"}
                className="w-4 h-4 accent-brass rounded bg-ink-navy border border-atlas-blue focus:ring-0 cursor-pointer disabled:opacity-50"
              />
              <span className={activeMode === "Fuzzy" || activeMode === "Whole Word" ? "opacity-50" : ""}>
                Ignore spacing & common separators (e.g. spaces, hyphens, periods)
              </span>
            </label>

            {(query || selectedTiers.length > 0 || selectedRegions.length > 0) && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-mono uppercase text-brass hover:text-brass/80 flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-brass rounded px-1 self-start sm:self-center"
              >
                <RefreshCw className="h-3 w-3" />
                Clear archives query
              </button>
            )}
          </div>
        </div>

        {/* Filter Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Side Filters column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-atlas-blue/20 border border-atlas-blue/60 p-5 rounded-sm space-y-6">
              <h3 className="font-mono text-xs text-brass uppercase tracking-wider border-b border-atlas-blue/60 pb-2 flex items-center gap-2">
                <Filter className="h-3.5 w-3.5" />
                Refine Log Sheets
              </h3>

              {/* Tiers Filter */}
              <div className="space-y-2">
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-chart-paper/80">
                  By Tier Rating
                </h4>
                <div className="flex flex-col gap-1.5">
                  {allTiers.map((tier) => {
                    const isSelected = selectedTiers.includes(tier);
                    return (
                      <button
                        key={tier}
                        onClick={() => toggleFilter(tier, selectedTiers, setSelectedTiers)}
                        className={`
                          flex items-center justify-between text-left px-3 py-1.5 rounded-sm font-sans text-xs transition-colors
                          ${
                            isSelected
                              ? "bg-brass/10 text-brass border border-brass/40"
                              : "bg-ink-navy/40 hover:bg-ink-navy/70 text-chart-paper/70 border border-transparent"
                          }
                        `}
                      >
                        <span className="font-semibold">{tier === "Untiered" ? "Untiered" : `${tier} Tier`}</span>
                        <Star className={`h-3 w-3 ${isSelected ? "fill-brass text-brass" : "text-chart-paper/20"}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Regions Filter */}
              <div className="space-y-2">
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-chart-paper/80">
                  By Continent / Region
                </h4>
                <div className="flex flex-col gap-1.5">
                  {allRegions.map((region) => {
                    const isSelected = selectedRegions.includes(region);
                    return (
                      <button
                        key={region}
                        onClick={() => toggleFilter(region, selectedRegions, setSelectedRegions)}
                        className={`
                          block text-left px-3 py-1.5 rounded-sm font-sans text-xs transition-colors
                          ${
                            isSelected
                              ? "bg-brass/10 text-brass border border-brass/40 font-semibold"
                              : "bg-ink-navy/40 hover:bg-ink-navy/70 text-chart-paper/70 border border-transparent"
                          }
                        `}
                      >
                        {region}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Results Grid column */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between font-mono text-xs text-brass uppercase tracking-widest border-b border-atlas-blue pb-2">
              <span>Matching Journal Logs</span>
              <span>Count: {searchResults.length.toString().padStart(2, "0")}</span>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResults.map(({ destination, titleMatches, destMatches, snippet, contentMatches }) => (
                  <div key={destination.slug} className="flex flex-col space-y-2 group">
                    <DestinationCard
                      destination={{
                        ...destination,
                        // Inject highlighted versions of text fields if they have matches
                        title: titleMatches.length > 0 ? destination.title : destination.title,
                      }}
                    />
                    
                    {/* Snippet matched body overlay */}
                    {snippet && (
                      <div className="bg-atlas-blue/20 border border-atlas-blue/40 px-4 py-3 rounded-xs font-sans text-[11px] leading-relaxed text-chart-paper/70 group-hover:border-brass/30 transition-colors">
                        <span className="font-mono text-[9px] text-brass uppercase block mb-1">
                          Matched Excerpt:
                        </span>
                        <HighlightedText text={snippet} matches={contentMatches} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-atlas-blue/60 rounded-sm p-16 flex flex-col items-center justify-center text-center text-chart-paper/40">
                <Compass className="h-10 w-10 text-chart-paper/20 mb-3 animate-pulse" />
                {query.trim().length === 0 && selectedTiers.length === 0 && selectedRegions.length === 0 ? (
                  <>
                    <p className="font-serif font-bold text-lg text-chart-paper/70 mb-1">
                      Ledger Awaiting Coordinates
                    </p>
                    <p className="font-sans text-xs max-w-sm">
                      Type search keywords above or select filters to query the archives.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-serif font-bold text-lg text-chart-paper/70 mb-1">
                      No Records Discovered
                    </p>
                    <p className="font-sans text-xs max-w-sm">
                      No coordinates match your queries. Refine spelling or reset matching filters to retry.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
