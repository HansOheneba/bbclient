// ──────────────────────────────────────────────
// Discrete sugar & spice level definitions
// ──────────────────────────────────────────────

export type DiscreteLevel = 0 | 1 | 2 | 3 | 4;

export type LevelDef = {
  value: DiscreteLevel;
  label: string;
  sublabel: string;
};

export const sugarLevels: LevelDef[] = [
  { value: 0, label: "No sugar", sublabel: "Pure vibes" },
  { value: 1, label: "Light", sublabel: "Just a hint" },
  { value: 2, label: "Regular", sublabel: "The usual" },
  { value: 3, label: "Sweet", sublabel: "Treat mode" },
  { value: 4, label: "Sugar rush", sublabel: "Hold tight" },
];

export const spiceLevels: LevelDef[] = [
  { value: 0, label: "No spice", sublabel: "Soft life" },
  { value: 1, label: "Mild", sublabel: "Small small" },
  { value: 2, label: "Medium", sublabel: "You dey try" },
  { value: 3, label: "Hot", sublabel: "Respectfully hot" },
  { value: 4, label: "Fire", sublabel: "No refunds" },
];

export function levelByValue(
  levels: LevelDef[],
  v: number | null,
): LevelDef | null {
  if (v === null) return null;
  return levels.find((x) => x.value === v) ?? null;
}
