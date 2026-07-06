"use client";

import React, { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { addPlannerItem, removePlannerItem, isItemInPlanner } from "@/lib/planner-storage";

interface AddToPlannerButtonProps {
  slug: string;
  variant?: "sidebar" | "card";
}

export default function AddToPlannerButton({ slug, variant = "sidebar" }: AddToPlannerButtonProps) {
  const [inPlanner, setInPlanner] = useState(false);

  useEffect(() => {
    // Initial check on mount
    setInPlanner(isItemInPlanner(slug));

    // Listen for storage changes in other components
    const handleUpdate = () => {
      setInPlanner(isItemInPlanner(slug));
    };

    window.addEventListener("planner-updated", handleUpdate);
    return () => {
      window.removeEventListener("planner-updated", handleUpdate);
    };
  }, [slug]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inPlanner) {
      removePlannerItem(slug);
    } else {
      addPlannerItem(slug);
    }
  };

  if (variant === "card") {
    return (
      <button
        onClick={handleToggle}
        className={`
          absolute top-3.5 right-3.5 z-20 p-1.5 rounded-full
          bg-ink-navy/5 hover:bg-ink-navy/10 text-ink-navy/40 hover:text-brass
          transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-brass
        `}
        title={inPlanner ? "Remove from Planner" : "Add to Planner"}
        aria-label={inPlanner ? "Remove from Planner" : "Add to Planner"}
      >
        {inPlanner ? (
          <BookmarkCheck className="h-4 w-4 text-brass fill-brass" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`
        w-full py-2 px-4 border text-center font-mono text-[10px] uppercase tracking-widest rounded-sm transition-all duration-300
        ${
          inPlanner
            ? "border-oxide-red/40 text-oxide-red bg-oxide-red/5 hover:bg-oxide-red/10"
            : "border-brass/40 text-brass bg-transparent hover:bg-brass hover:text-ink-navy"
        }
        focus:outline-none focus:ring-1 focus:ring-brass
      `}
    >
      {inPlanner ? "✓ In Planner — remove" : "+ Add to Planner"}
    </button>
  );
}
