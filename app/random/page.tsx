import { redirect } from "next/navigation";
import { getAllDestinations } from "@/lib/destinations";

// Force dynamic behavior so it chooses a different random destination on each request
export const dynamic = "force-dynamic";

export default function RandomPage() {
  const destinations = getAllDestinations();
  
  if (destinations.length === 0) {
    redirect("/");
  }

  const randomIndex = Math.floor(Math.random() * destinations.length);
  const randomDest = destinations[randomIndex];

  redirect(`/destination/${randomDest.slug}`);
}
