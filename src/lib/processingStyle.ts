export type ProcessingStyle = "informational" | "normative" | "diffuse-avoidant";

const KEY = "groundwork_style";

export function getProcessingStyle(): ProcessingStyle | null {
  if (typeof window === "undefined") return null;
  const val = localStorage.getItem(KEY);
  if (val === "informational" || val === "normative" || val === "diffuse-avoidant") {
    return val;
  }
  return null;
}

export function setProcessingStyle(style: ProcessingStyle): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, style);
}

/**
 * Tally an array of style votes and return the majority.
 * Ties are broken: informational > normative > diffuse-avoidant
 * (most engaged style wins ties, reducing false diffuse-avoidant classification).
 */
export function tallyStyle(votes: ProcessingStyle[]): ProcessingStyle {
  const counts: Record<ProcessingStyle, number> = {
    informational: 0,
    normative: 0,
    "diffuse-avoidant": 0,
  };
  for (const v of votes) counts[v]++;
  if (counts.informational >= counts.normative && counts.informational >= counts["diffuse-avoidant"]) {
    return "informational";
  }
  if (counts.normative >= counts["diffuse-avoidant"]) {
    return "normative";
  }
  return "diffuse-avoidant";
}

/**
 * Human-facing names for each style. The framework terms (informational,
 * normative, diffuse-avoidant) belong in the curriculum doc, not on screen —
 * these are what users actually see.
 */
export const STYLE_LABELS: Record<ProcessingStyle, { name: string; blurb: string }> = {
  informational: {
    name: "Dig deeper",
    blurb: "Extra context on why each activity works, and the research behind it.",
  },
  normative: {
    name: "Clear steps",
    blurb: "A defined path through each activity, one step at a time.",
  },
  "diffuse-avoidant": {
    name: "Gentle pace",
    blurb: "Smaller prompts, revealed one at a time, with no pressure to finish.",
  },
};

export const STYLE_ORDER: ProcessingStyle[] = [
  "informational",
  "normative",
  "diffuse-avoidant",
];
