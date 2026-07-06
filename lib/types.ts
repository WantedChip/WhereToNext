export interface BudgetTier {
  backpacker: string;
  luxury: string;
}

export interface Destination {
  slug: string;
  title: string;
  destination: string;
  country: string;
  region: string;
  source_url: string;
  tags: string[];
  tier: "S" | "A" | "B" | "C" | "D" | "E" | null;
  best_months: string[] | null;
  budget_tier: BudgetTier | null;
  transit_notes: string | null;
  score: {
    cost_value: number;
    uniqueness: number;
    transit_ease: number;
    family_friendliness: number;
  } | null;
  coordinates: {
    lat: number;
    lng: number;
  };
  content: string; // Markdown body content
}
