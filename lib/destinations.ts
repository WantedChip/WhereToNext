import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Destination } from "./types";
import { computeTier } from "./tierSchema";

const DATA_DIR = path.join(process.cwd(), "data");
const SNAPSHOT_PATH = path.join(process.cwd(), ".agents", "destinations-snapshot.json");

export function getAllDestinations(): Destination[] {
  if (!fs.existsSync(DATA_DIR)) {
    throw new Error(`Data directory not found at: ${DATA_DIR}`);
  }

  const files = fs.readdirSync(DATA_DIR).filter((file) => file.endsWith(".md"));
  const destinations: Destination[] = [];

  for (const filename of files) {
    const filePath = path.join(DATA_DIR, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    // Sanitize double double-quotes in YAML in-memory to prevent parsing issues
    const sanitizedContent = fileContent.replace(/(:\s*".*?")\s*"/g, "$1");
    const { data, content } = matter(sanitizedContent);
    const slug = filename.replace(/\.md$/, "");

    // Validate required fields
    const requiredFields = ["title", "destination", "country", "region", "source_url", "tags"];
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        throw new Error(
          `Validation failed for ${filename}: Missing required frontmatter field "${field}"`
        );
      }
    }

    if (!Array.isArray(data.tags)) {
      throw new Error(`Validation failed for ${filename}: "tags" must be an array`);
    }

    // Process and validate score if present
    let scoreObj: Destination["score"] = null;
    let computedTier: Destination["tier"] = null;

    if (data.score !== undefined && data.score !== null) {
      const { cost_value, uniqueness, transit_ease, family_friendliness } = data.score;
      const axes = { cost_value, uniqueness, transit_ease, family_friendliness };

      for (const [axisName, val] of Object.entries(axes)) {
        if (val === undefined || typeof val !== "number" || val < 1 || val > 10) {
          console.warn(
            `Warning: Destination "${filename}" has a score but individual axis "${axisName}" has an invalid value: ${val}. Must be a number between 1 and 10.`
          );
        }
      }

      scoreObj = {
        cost_value: Number(cost_value || 0),
        uniqueness: Number(uniqueness || 0),
        transit_ease: Number(transit_ease || 0),
        family_friendliness: Number(family_friendliness || 0),
      };

      computedTier = computeTier(scoreObj);
    }

    // Map and typecheck optional fields to preserve nulls
    const destination: Destination = {
      slug,
      title: String(data.title),
      destination: String(data.destination),
      country: String(data.country),
      region: String(data.region),
      source_url: String(data.source_url),
      tags: data.tags.map(String),
      tier: computedTier,
      best_months: Array.isArray(data.best_months) ? data.best_months.map(String) : null,
      budget_tier: data.budget_tier ? {
        backpacker: String(data.budget_tier.backpacker || ""),
        luxury: String(data.budget_tier.luxury || ""),
      } : null,
      transit_notes: data.transit_notes ? String(data.transit_notes) : null,
      score: scoreObj,
      content,
    };

    destinations.push(destination);
  }

  // Write snapshot for debugging
  try {
    const agentsDir = path.dirname(SNAPSHOT_PATH);
    if (!fs.existsSync(agentsDir)) {
      fs.mkdirSync(agentsDir, { recursive: true });
    }
    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(destinations, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write destinations snapshot:", error);
  }

  return destinations;
}

export function getDestinationBySlug(slug: string): Destination | null {
  const destinations = getAllDestinations();
  return destinations.find((d) => d.slug === slug) || null;
}
