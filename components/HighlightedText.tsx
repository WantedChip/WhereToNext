import React from "react";
import { MatchSpan } from "@/lib/search";

interface HighlightedTextProps {
  text: string;
  matches: MatchSpan[];
  className?: string;
}

export default function HighlightedText({ text, matches, className = "" }: HighlightedTextProps) {
  if (!matches || matches.length === 0) {
    return <span className={className}>{text}</span>;
  }

  const segments: React.ReactNode[] = [];
  let lastIndex = 0;

  matches.forEach((span, index) => {
    // Add plain text before match
    if (span.start > lastIndex) {
      segments.push(
        <span key={`text-${lastIndex}-${span.start}`}>
          {text.slice(lastIndex, span.start)}
        </span>
      );
    }
    // Add highlighted match wrapped in mark
    segments.push(
      <mark
        key={`highlight-${span.start}-${span.end}-${index}`}
        className="bg-brass/35 text-inherit font-semibold px-0.5 rounded-xs"
      >
        {text.slice(span.start, span.end)}
      </mark>
    );
    lastIndex = span.end;
  });

  // Add remaining plain text
  if (lastIndex < text.length) {
    segments.push(
      <span key={`text-end-${lastIndex}`}>
        {text.slice(lastIndex)}
      </span>
    );
  }

  return <span className={className}>{segments}</span>;
}
