import React from "react";
import { getAllDestinations } from "@/lib/destinations";
import SearchClient from "./SearchClient";

export default function SearchPage() {
  const destinations = getAllDestinations();
  return <SearchClient initialDestinations={destinations} />;
}
