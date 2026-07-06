"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Globe from "react-globe.gl";
import { feature } from "topojson-client";
import { Destination } from "@/lib/types";

interface GlobeViewProps {
  destinations: Destination[];
}

interface GlobeMarker {
  type: "country" | "pin";
  lat: number;
  lng: number;
  label: string;
  count?: number;
  slug?: string;
  tier?: string | null;
  region?: string;
  country?: string;
  tags?: string[];
}

export default function GlobeView({ destinations }: GlobeViewProps) {
  const router = useRouter();
  const globeRef = useRef<any>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [altitude, setAltitude] = useState(2.5); // Default zoomed out state
  const [hoveredPin, setHoveredPin] = useState<GlobeMarker | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Track prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Update globe dimensions dynamically to fit full screen
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Track mouse movements for custom pin tooltip positioning
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Fetch world-atlas topojson and convert to geojson features
  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((res) => res.json())
      .then((data) => {
        const geojson = feature(data, data.objects.countries) as any;
        setCountries(geojson.features);
      })
      .catch((err) => console.error("Error loading world topojson:", err));
  }, []);

  // Monitor camera altitude dynamically on interaction
  useEffect(() => {
    let animId: number;
    const checkAltitude = () => {
      if (globeRef.current) {
        const camera = globeRef.current.camera();
        if (camera) {
          const { x, y, z } = camera.position;
          const distance = Math.sqrt(x * x + y * y + z * z);
          // Globe radius is 100
          const alt = (distance - 100) / 100;
          setAltitude(alt);
        }
      }
      animId = requestAnimationFrame(checkAltitude);
    };
    checkAltitude();
    return () => cancelAnimationFrame(animId);
  }, []);

  // Configure auto-rotation and orbit control properties
  useEffect(() => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls();
    if (controls) {
      controls.autoRotate = !reducedMotion && !hoveredCountry;
      controls.autoRotateSpeed = 0.5;
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 140; // Allow closer zoom
      controls.maxDistance = 500;
    }
  }, [reducedMotion, hoveredCountry]);

  // Group active destinations by country dynamically
  const groupedCountries = useMemo(() => {
    const groups: Record<string, { country: string; lat: number; lng: number; count: number; destinations: Destination[] }> = {};
    
    destinations.forEach((d) => {
      const key = d.country;
      if (!groups[key]) {
        groups[key] = {
          country: d.country,
          lat: 0,
          lng: 0,
          count: 0,
          destinations: [],
        };
      }
      groups[key].destinations.push(d);
      groups[key].lat += d.coordinates.lat;
      groups[key].lng += d.coordinates.lng;
      groups[key].count += 1;
    });

    Object.values(groups).forEach((g) => {
      g.lat /= g.count;
      g.lng /= g.count;
    });

    return Object.values(groups);
  }, [destinations]);

  // Select htmlElementsData depending on current zoom/altitude
  const htmlElementsData = useMemo(() => {
    if (altitude > 1.8) {
      // Zoomed-out: Country centroids with count bubble
      return groupedCountries.map((g) => ({
        type: "country" as const,
        lat: g.lat,
        lng: g.lng,
        label: g.country,
        count: g.count,
      }));
    } else {
      // Zoomed-in: Individual custom destination pins
      return destinations.map((d) => ({
        type: "pin" as const,
        lat: d.coordinates.lat,
        lng: d.coordinates.lng,
        label: d.destination,
        slug: d.slug,
        tier: d.tier,
        region: d.region,
        country: d.country,
        tags: d.tags,
      }));
    }
  }, [altitude, groupedCountries, destinations]);

  // Check if a country has data in our dataset (for polygon highlights)
  const getDestinationForCountry = (countryName: string): Destination | null => {
    return (
      destinations.find(
        (d) => d.country.toLowerCase() === countryName.toLowerCase()
      ) || null
    );
  };

  // Click handler to route to detail page or zoom
  const handlePolygonClick = (polygon: any) => {
    const countryName = polygon.properties.name;
    const group = groupedCountries.find((g) => g.country.toLowerCase() === countryName.toLowerCase());
    if (group) {
      // If zoomed out, center and zoom in
      if (altitude > 1.8) {
        globeRef.current?.pointOfView({ lat: group.lat, lng: group.lng, altitude: 1.3 }, 1200);
      } else {
        // If zoomed in, go to the first destination's page in that country
        router.push(`/destination/${group.destinations[0].slug}`);
      }
    }
  };

  // Helper to color polygons
  const getPolygonColor = (polygon: any) => {
    const countryName = polygon.properties.name;
    const hasData = getDestinationForCountry(countryName) !== null;

    if (hasData) {
      if (hoveredCountry === countryName) {
        return "rgba(184, 145, 47, 0.5)"; // brass highlight
      }
      return "rgba(62, 124, 116, 0.35)"; // sea-teal semi-transparent for active countries
    }
    return "rgba(27, 47, 78, 0.15)"; // dim neutral fill for inactive
  };

  // Tooltip HTML formatter for active countries polygon hover
  const getPolygonLabel = (polygon: any) => {
    const countryName = polygon.properties.name;
    const group = groupedCountries.find((g) => g.country.toLowerCase() === countryName.toLowerCase());
    if (!group) return "";

    return `
      <div style="
        background: #1B2F4E;
        border: 1px solid rgba(184, 145, 47, 0.5);
        color: #E8DFC8;
        padding: 10px 14px;
        border-radius: 4px;
        font-family: var(--font-public-sans), sans-serif;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        pointer-events: none;
      ">
        <div style="font-family: var(--font-fraunces), serif; font-weight: bold; font-size: 15px;">
          ${group.country}
        </div>
        <div style="font-family: var(--font-ibm-plex-mono), monospace; font-size: 10px; color: #B8912F; text-transform: uppercase; margin-top: 4px;">
          ${group.count} Active Destination${group.count > 1 ? "s" : ""}
        </div>
      </div>
    `;
  };

  // Generate DOM element for HTML markers dynamically
  const createHtmlElement = (d: any) => {
    const el = document.createElement("div");

    if (d.type === "country") {
      // 3D Country grouping bubble
      el.innerHTML = `
        <div style="
          background: rgba(27, 47, 78, 0.95);
          border: 1px solid rgba(184, 145, 47, 0.7);
          color: #E8DFC8;
          padding: 5px 10px;
          border-radius: 15px;
          font-family: var(--font-ibm-plex-mono), monospace;
          font-size: 9px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          pointer-events: auto;
          transition: border-color 0.2s ease;
        " onmouseover="this.style.borderColor='#B8912F'" onmouseout="this.style.borderColor='rgba(184, 145, 47, 0.7)'">
          <span>${d.label}</span>
          <span style="
            background: #B8912F;
            color: #12213A;
            border-radius: 50%;
            width: 14px;
            height: 14px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            font-weight: 800;
          ">${d.count}</span>
        </div>
      `;

      el.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        globeRef.current?.pointOfView({ lat: d.lat, lng: d.lng, altitude: 1.3 }, 1200);
      };
    } else {
      // Individual Destination pin (pulsing visual indicator)
      el.innerHTML = `
        <div style="
          width: 10px;
          height: 10px;
          background: #B8912F;
          border: 2px solid #E8DFC8;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(184, 145, 47, 0.9);
          cursor: pointer;
          transform: translate(-50%, -50%);
          pointer-events: auto;
          transition: transform 0.15s ease, background-color 0.15s ease;
        " onmouseover="this.style.transform='translate(-50%, -50%) scale(1.3)'; this.style.backgroundColor='#E8DFC8';" onmouseout="this.style.transform='translate(-50%, -50%) scale(1)'; this.style.backgroundColor='#B8912F';">
        </div>
      `;

      el.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/destination/${d.slug}`);
      };

      el.onmouseenter = () => {
        setHoveredPin(d);
      };

      el.onmouseleave = () => {
        setHoveredPin(null);
      };
    }

    return el;
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-ink-navy">
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="https://cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
        polygonsData={countries}
        polygonCapColor={getPolygonColor}
        polygonSideColor={() => "rgba(18, 33, 58, 0.3)"}
        polygonStrokeColor={() => "#12213A"}
        polygonLabel={getPolygonLabel}
        onPolygonHover={(polygon: any) => {
          if (polygon) {
            const countryName = polygon.properties.name;
            if (getDestinationForCountry(countryName)) {
              setHoveredCountry(countryName);
            } else {
              setHoveredCountry(null);
            }
          } else {
            setHoveredCountry(null);
          }
        }}
        onPolygonClick={handlePolygonClick}
        polygonAltitude={0.005}
        htmlElementsData={htmlElementsData}
        htmlElement={createHtmlElement}
      />

      {/* Floating high-fidelity pin hover preview card (Phase E) */}
      {hoveredPin && (
        <div
          style={{
            position: "fixed",
            left: mousePos.x + 18,
            top: mousePos.y + 18,
            zIndex: 100,
            pointerEvents: "none",
          }}
          className="bg-ink-navy/95 border border-brass/50 text-chart-paper p-4 rounded-sm shadow-2xl max-w-xs font-sans space-y-2 backdrop-blur-md animate-fade-in"
        >
          <div className="font-mono text-[9px] text-brass uppercase tracking-widest">
            {hoveredPin.region} • {hoveredPin.country}
          </div>
          <div className="flex justify-between items-center gap-4">
            <h4 className="font-serif font-bold text-base leading-tight text-chart-paper">
              {hoveredPin.label}
            </h4>
            {hoveredPin.tier && (
              <span className="inline-flex items-center justify-center border border-brass text-brass bg-brass/10 font-serif font-bold rounded-full w-5 h-5 text-[10px] transform rotate-3">
                {hoveredPin.tier}
              </span>
            )}
          </div>
          {hoveredPin.tags && hoveredPin.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {hoveredPin.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 bg-chart-paper/10 border border-chart-paper/20 rounded-xs font-sans text-[8px] uppercase tracking-wider text-chart-paper/85"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
