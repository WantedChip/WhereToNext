import React from "react";
import { getAllDestinations } from "@/lib/destinations";
import HomeClient from "./HomeClient";

export default function HomePage() {
  const destinations = getAllDestinations();

  return <HomeClient destinations={destinations} />;
}
