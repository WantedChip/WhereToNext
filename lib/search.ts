import Fuse from "fuse.js";

export interface MatchSpan {
  start: number;
  end: number;
}

export interface MatchResult {
  text: string;
  matches: MatchSpan[];
  score?: number;
}

// Escapes regex characters
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Merge overlapping or adjacent highlight spans
export function mergeSpans(spans: MatchSpan[]): MatchSpan[] {
  if (spans.length <= 1) return spans;

  // Sort by start position, then by end position descending
  const sorted = [...spans].sort((a, b) => a.start - b.start || b.end - a.end);
  const merged: MatchSpan[] = [];

  let current = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    if (next.start <= current.end) {
      // Overlap or adjacency: merge them
      current = {
        start: current.start,
        end: Math.max(current.end, next.end),
      };
    } else {
      merged.push(current);
      current = next;
    }
  }
  merged.push(current);
  return merged;
}

// Normalizer
export function normalizeText(text: string, ignoreSpacing: boolean = false): string {
  let normalized = text.normalize("NFKC").toLowerCase();
  
  if (ignoreSpacing) {
    // Strip space and common separators: - _ . , / \
    normalized = normalized.replace(/[\s\-_.,/\\\\]/g, "");
  } else {
    // Collapse repeated whitespace
    normalized = normalized.replace(/\s+/g, " ");
  }
  return normalized;
}

/**
 * 1. BROAD MODE: All query words must be present in any order.
 */
export function matchBroad(query: string, text: string, ignoreSpacing: boolean = false): MatchResult {
  const normText = normalizeText(text, ignoreSpacing);
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  
  if (tokens.length === 0) return { text, matches: [] };

  const matches: MatchSpan[] = [];
  
  // Check if ALL tokens are present
  for (const token of tokens) {
    const normToken = normalizeText(token, ignoreSpacing);
    if (!normToken) continue;

    // Search in normalized text, map back to original indices if ignoreSpacing is false.
    // (If ignoreSpacing is true, index mapping is direct since we strip things, but to keep it simple,
    // we find matches in the original text by matching lowercase tokens).
    const regexToken = escapeRegExp(token.toLowerCase());
    const regex = new RegExp(regexToken, "gi");
    let match;
    let tokenMatched = false;

    while ((match = regex.exec(text)) !== null) {
      tokenMatched = true;
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    // If even one token is not found, the whole text fails to match (ALL must be present)
    if (!tokenMatched) {
      return { text, matches: [] };
    }
  }

  return { text, matches: mergeSpans(matches) };
}

/**
 * 2. STRICT MODE: Exact phrase matching
 */
export function matchStrict(query: string, text: string, ignoreSpacing: boolean = false): MatchResult {
  if (ignoreSpacing) {
    const normText = normalizeText(text, true);
    const normQuery = normalizeText(query, true);

    if (!normQuery || !normText.includes(normQuery)) {
      return { text, matches: [] };
    }

    // If separators are ignored, we find the best fuzzy-matching substring in the original text
    // to highlight, or highlight the closest matching range. Let's do a simple mapping.
    // For simplicity, we can search character-by-character to find the span in original text
    // that normalizes to the query.
    let startIdx = -1;
    let endIdx = -1;

    for (let i = 0; i < text.length; i++) {
      for (let j = i + 1; j <= text.length; j++) {
        const sub = text.slice(i, j);
        if (normalizeText(sub, true) === normQuery) {
          startIdx = i;
          endIdx = j;
          break;
        }
      }
      if (startIdx !== -1) break;
    }

    if (startIdx !== -1) {
      return { text, matches: [{ start: startIdx, end: endIdx }] };
    }
  }

  // Standard case-insensitive exact substring
  const matches: MatchSpan[] = [];
  const regex = new RegExp(escapeRegExp(query), "gi");
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  return { text, matches };
}

/**
 * 3. WHOLE WORD MODE: Word boundaries (\b)
 */
export function matchWholeWord(query: string, text: string, ignoreSpacing: boolean = false): MatchResult {
  const matches: MatchSpan[] = [];
  const normQuery = query.trim();
  if (!normQuery) return { text, matches };

  // Match whole word only (case insensitive)
  const regex = new RegExp(`\\b${escapeRegExp(normQuery)}\\b`, "gi");
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  return { text, matches };
}

/**
 * 4. SUBSTRING MODE: Query found anywhere, including inside words
 */
export function matchSubstring(query: string, text: string, ignoreSpacing: boolean = false): MatchResult {
  const matches: MatchSpan[] = [];
  const normQuery = query.toLowerCase();
  if (!normQuery) return { text, matches };

  const regex = new RegExp(escapeRegExp(normQuery), "gi");
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  return { text, matches };
}

/**
 * 5. FUZZY MODE: Levenshtein distance typo tolerance.
 * Utilizes Fuse.js on single string level.
 */
export function matchFuzzy(query: string, text: string): MatchResult {
  const normQuery = query.trim();
  if (normQuery.length < 3) {
    // Requirements: "Fuzzy with very short queries (1-2 chars) -> recommend disabling Fuzzy or requiring min query length of 3."
    return { text, matches: [] };
  }

  // Create temporary item list for Fuse
  const fuse = new Fuse([{ val: text }], {
    keys: ["val"],
    includeMatches: true,
    threshold: 0.4,
  });

  const res = fuse.search(normQuery);
  if (res.length === 0 || !res[0].matches) {
    return { text, matches: [] };
  }

  const fuseMatches = res[0].matches[0].indices.map(([start, end]) => ({
    start,
    end: end + 1, // Fuse indices are inclusive, convert to exclusive
  }));

  return {
    text,
    matches: mergeSpans(fuseMatches),
    score: res[0].score,
  };
}
