"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Globe from "react-globe.gl";
import { feature } from "topojson-client";
import { Destination } from "@/lib/types";
import { getCoordinatesForCountry } from "@/lib/coordinates";

interface GlobeViewProps {
  destinations: Destination[];
}

export default function GlobeView({ destinations }: GlobeViewProps) {
  const router = useRouter();
  const globeRef = useRef<any>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [reducedMotion, setReducedMotion] = useState(false);

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

  // Configure auto-rotation and orbit control properties
  useEffect(() => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls();
    if (controls) {
      controls.autoRotate = !reducedMotion && !hoveredCountry;
      controls.autoRotateSpeed = 0.5;
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 200;
      controls.maxDistance = 500;
    }
  }, [reducedMotion, hoveredCountry]);

  // Check if a country has data in our dataset
  const getDestinationForCountry = (countryName: string): Destination | null => {
    return (
      destinations.find(
        (d) => d.country.toLowerCase() === countryName.toLowerCase()
      ) || null
    );
  };

  // Click handler to route to detail page
  const handlePolygonClick = (polygon: any) => {
    const countryName = polygon.properties.name;
    const dest = getDestinationForCountry(countryName);
    if (dest) {
      router.push(`/destination/${dest.slug}`);
    }
  };

  // Helper to color polygons
  const getPolygonColor = (polygon: any) => {
    const countryName = polygon.properties.name;
    const hasData = getDestinationForCountry(countryName) !== null;

    if (hasData) {
      if (hoveredCountry === countryName) {
        return "rgba(184, 145, 47, 0.7)"; // brass highlight
      }
      return "rgba(62, 124, 116, 0.4)"; // sea-teal semi-transparent for active countries
    }
    return "rgba(27, 47, 78, 0.2)"; // dim neutral fill for inactive
  };

  // Tooltip HTML formatter
  const getPolygonLabel = (polygon: any) => {
    const countryName = polygon.properties.name;
    const dest = getDestinationForCountry(countryName);
    if (!dest) return "";

    const coords = getCoordinatesForCountry(dest.country);
    const latStr = `${Math.abs(coords.lat).toFixed(4)}° ${coords.lat >= 0 ? "N" : "S"}`;
    const lngStr = `${Math.abs(coords.lng).toFixed(4)}° ${coords.lng >= 0 ? "E" : "W"}`;

    return `
      <div style="
        background: #1B2F4E;
        border: 1px solid rgba(184, 145, 47, 0.5);
        color: #E8DFC8;
        padding: 12px;
        border-radius: 4px;
        font-family: var(--font-public-sans), sans-serif;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        text-align: left;
        pointer-events: none;
      ">
        <div style="font-family: var(--font-ibm-plex-mono), monospace; font-size: 10px; color: #B8912F; letter-spacing: 0.1em; text-transform: uppercase;">
          ${latStr}, ${lngStr}
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 4px;">
          <span style="font-family: var(--font-fraunces), serif; font-weight: 600; font-size: 16px; color: #E8DFC8;">
            ${dest.destination}
          </span>
          ${
            dest.tier
              ? `<span style="
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  border-radius: 50%;
                  border: 1px solid #B8912F;
                  color: #B8912F;
                  background: rgba(184, 145, 47, 0.1);
                  font-family: var(--font-fraunces), serif;
                  font-weight: bold;
                  width: 24px;
                  height: 24px;
                  font-size: 12px;
                  transform: rotate(2deg);
                ">${dest.tier}</span>`
              : ""
          }
        </div>
        <div style="font-size: 12px; color: rgba(232, 223, 200, 0.7); margin-top: 2px;">
          ${dest.country}
        </div>
      </div>
    `;
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
        polygonSideColor={() => "rgba(18, 33, 58, 0.4)"}
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
        polygonAltitude={0.01}
      />
    </div>
  );
}
