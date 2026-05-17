export type Measurement = {
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  chest_cm?: number;
  waist_cm?: number;
  hips_cm?: number;
  preferred_fit?: string;
  size?: string;
};

// Quick heuristic size recommender. Returns size label + confidence 0-100.
export function recommendSize(m: Measurement, category: string): { size: string; asian: string; confidence: number; note: string } {
  const chest = m.chest_cm ?? estimateChest(m);
  const fitBias = m.preferred_fit === "oversized" ? 1 : m.preferred_fit === "slim" ? -1 : 0;

  if (category === "jeans" && (m.waist_cm || m.weight_kg)) {
    const waistIn = Math.round(((m.waist_cm ?? 80) / 2.54));
    return { size: `${waistIn}`, asian: `${waistIn - 1}`, confidence: m.waist_cm ? 88 : 70, note: "Based on your waist measurement." };
  }

  const intl = chestToSize(chest + fitBias * 3);
  const asian = chestToSize(chest + fitBias * 3 + 2); // asian sizing runs ~1 size smaller
  const conf = m.chest_cm ? 90 : m.height_cm && m.weight_kg ? 78 : 62;
  return {
    size: intl,
    asian,
    confidence: conf,
    note: m.chest_cm
      ? "Based on your chest measurement and preferred fit."
      : "Estimated from height, weight, and fit preference.",
  };
}

function estimateChest(m: Measurement): number {
  const h = m.height_cm ?? 170;
  const w = m.weight_kg ?? 70;
  return Math.round(70 + (w - 50) * 0.6 + (h - 165) * 0.1);
}

function chestToSize(chest: number): string {
  if (chest < 86) return "XS";
  if (chest < 94) return "S";
  if (chest < 102) return "M";
  if (chest < 110) return "L";
  if (chest < 118) return "XL";
  return "XXL";
}
