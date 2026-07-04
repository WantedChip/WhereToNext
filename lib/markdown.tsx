import React from "react";

/**
 * A lightweight parser to convert the simple markdown files in /data into styled JSX.
 * Avoids extra library dependencies and ensures fast, clean compilation.
 */
export function renderMarkdown(markdown: string): React.ReactNode {
  const lines = markdown.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let keyCounter = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${keyCounter++}`} className="space-y-3 my-4 list-outside pl-5">
          {...currentList}
        </ul>
      );
      currentList = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      continue;
    }

    // Match Headings (e.g., ## Summary)
    if (line.startsWith("## ")) {
      flushList();
      const headingText = line.substring(3);
      elements.push(
        <h2
          key={`h2-${keyCounter++}`}
          className="font-serif font-bold text-xl sm:text-2xl text-brass border-b border-atlas-blue/60 pb-2 mt-8 mb-4 tracking-wide uppercase"
        >
          {headingText}
        </h2>
      );
    }
    // Match Bullet Lists (e.g., - Explore the falls)
    else if (line.startsWith("- ")) {
      const listItemText = line.substring(2);
      currentList.push(
        <li
          key={`li-${keyCounter++}`}
          className="font-sans text-sm sm:text-base text-chart-paper/90 leading-relaxed list-disc marker:text-brass/70 pl-1"
        >
          {listItemText}
        </li>
      );
    }
    // Match standard paragraphs
    else {
      flushList();
      elements.push(
        <p
          key={`p-${keyCounter++}`}
          className="font-sans text-sm sm:text-base text-chart-paper/85 leading-relaxed my-4 indent-0"
        >
          {line}
        </p>
      );
    }
  }

  flushList();
  return <div className="space-y-4">{elements}</div>;
}
