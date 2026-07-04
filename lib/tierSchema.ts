import { Destination } from "./types";

export type Tier = "S" | "A" | "B" | "C" | "D" | "E";

export interface Score {
  cost_value: number;
  uniqueness: number;
  transit_ease: number;
  family_friendliness: number;
}

export function computeTier(score: Score): Tier {
  const { cost_value, uniqueness, transit_ease, family_friendliness } = score;
  
  const weighted_score = (
    cost_value * 1.5 + 
    uniqueness * 1.5 + 
    transit_ease * 1.0 + 
    family_friendliness * 1.0
  ) / 5.0;

  if (weighted_score >= 8.5) return "S";
  if (weighted_score >= 7.5) return "A";
  if (weighted_score >= 6.5) return "B";
  if (weighted_score >= 5.5) return "C";
  if (weighted_score >= 4.5) return "D";
  return "E";
}
