export interface PlannerItem {
  slug: string;
  addedAt: number;
  notes?: string;
}

const STORAGE_KEY = "wheretonext:planner";

export function getPlannerItems(): PlannerItem[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Error reading planner items from localStorage:", error);
    return [];
  }
}

export function savePlannerItems(items: PlannerItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    // Dispatch a custom event to notify other components of changes
    window.dispatchEvent(new Event("planner-updated"));
  } catch (error) {
    console.error("Error writing planner items to localStorage:", error);
  }
}

export function addPlannerItem(slug: string): void {
  const items = getPlannerItems();
  if (items.some((item) => item.slug === slug)) {
    return;
  }
  items.push({
    slug,
    addedAt: Date.now(),
    notes: "",
  });
  savePlannerItems(items);
}

export function removePlannerItem(slug: string): void {
  const items = getPlannerItems();
  const filtered = items.filter((item) => item.slug !== slug);
  savePlannerItems(filtered);
}

export function updatePlannerNotes(slug: string, notes: string): void {
  const items = getPlannerItems();
  const item = items.find((item) => item.slug === slug);
  if (item) {
    item.notes = notes;
    savePlannerItems(items);
  }
}

export function isItemInPlanner(slug: string): boolean {
  const items = getPlannerItems();
  return items.some((item) => item.slug === slug);
}
