import React from "react";
import { Metadata } from "next";
import { getAllDestinations } from "@/lib/destinations";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PlannerClient from "./PlannerClient";

export const metadata: Metadata = {
  title: "Trip Planner — Where To Next",
  description: "Map out your custom bucket list, route notes, and future expedition plans.",
};

export default function PlannerPage() {
  const allDestinations = getAllDestinations();

  return (
    <div className="flex flex-col min-h-screen bg-ink-navy text-chart-paper font-sans">
      <Nav floating={false} />

      <main className="flex-grow py-12 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <PlannerClient destinations={allDestinations} />
      </main>

      <Footer />
    </div>
  );
}
