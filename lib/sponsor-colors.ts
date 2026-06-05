export const TIER_COLORS = [
  {
    id: "gold",
    label: "Gold",
    badge: "text-solstice-gold border-solstice-gold/40 bg-solstice-gold/10",
    swatch: "bg-solstice-gold",
  },
  {
    id: "silver",
    label: "Silver",
    badge: "text-slate-300 border-slate-400/40 bg-slate-400/10",
    swatch: "bg-slate-300",
  },
  {
    id: "bronze",
    label: "Bronze",
    badge: "text-amber-600 border-amber-700/40 bg-amber-700/10",
    swatch: "bg-amber-600",
  },
  {
    id: "orange",
    label: "Orange",
    badge: "text-solstice-orange border-solstice-orange/40 bg-solstice-orange/10",
    swatch: "bg-solstice-orange",
  },
  {
    id: "sky",
    label: "Sky",
    badge: "text-sky-400 border-sky-400/40 bg-sky-400/10",
    swatch: "bg-sky-400",
  },
  {
    id: "rose",
    label: "Rose",
    badge: "text-rose-400 border-rose-400/40 bg-rose-400/10",
    swatch: "bg-rose-400",
  },
  {
    id: "violet",
    label: "Violet",
    badge: "text-violet-400 border-violet-400/40 bg-violet-400/10",
    swatch: "bg-violet-400",
  },
  {
    id: "cyan",
    label: "Cyan",
    badge: "text-cyan-400 border-cyan-400/40 bg-cyan-400/10",
    swatch: "bg-cyan-400",
  },
] as const;

export type TierColorId = (typeof TIER_COLORS)[number]["id"];

export const DEFAULT_TIER_COLOR: TierColorId = "silver";

export function getTierBadgeClass(color: string): string {
  return (
    TIER_COLORS.find((c) => c.id === color)?.badge ??
    "text-slate-300 border-slate-400/40 bg-slate-400/10"
  );
}
