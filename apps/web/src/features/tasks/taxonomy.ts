import type { CategoryColorToken } from "@fokuna/api-contracts";
import type { TagTone } from "@fokuna/ui";

export const TAXONOMY_COLOR_OPTIONS: Array<{
  token: CategoryColorToken;
  label: string;
  cssVar: string;
}> = [
  { token: "category.coral", label: "Coral", cssVar: "var(--fk-color-category-coral)" },
  { token: "category.teal", label: "Teal", cssVar: "var(--fk-color-category-teal)" },
  { token: "category.blue", label: "Blau", cssVar: "var(--fk-color-category-blue)" },
  { token: "category.purple", label: "Lila", cssVar: "var(--fk-color-category-purple)" },
  { token: "category.pink", label: "Pink", cssVar: "var(--fk-color-category-pink)" },
  { token: "category.gold", label: "Gold", cssVar: "var(--fk-color-category-gold)" },
];

export function colorTokenToCssVar(token: string): string {
  const found = TAXONOMY_COLOR_OPTIONS.find((option) => option.token === token);
  return found?.cssVar ?? "var(--fk-color-category-teal)";
}

export function colorTokenToTone(token: string): TagTone {
  const tone = token.replace("category.", "") as TagTone;
  if (
    tone === "coral" ||
    tone === "teal" ||
    tone === "blue" ||
    tone === "purple" ||
    tone === "pink" ||
    tone === "gold"
  ) {
    return tone;
  }
  return "neutral";
}

export const SIDEBAR_DROP = {
  favorites: "rail-favorites",
  today: "rail-today",
  inbox: "rail-eingang",
  category: (id: string) => `cat:${id}`,
  label: (id: string) => `label:${id}`,
} as const;

export function parseSidebarDropTarget(overId: string | null | undefined):
  | { type: "favorites" }
  | { type: "today" }
  | { type: "inbox" }
  | { type: "category"; categoryId: string }
  | { type: "label"; labelId: string }
  | null {
  if (!overId) return null;
  if (overId === SIDEBAR_DROP.favorites) return { type: "favorites" };
  if (overId === SIDEBAR_DROP.today) return { type: "today" };
  if (overId === SIDEBAR_DROP.inbox) return { type: "inbox" };
  if (overId.startsWith("cat:")) return { type: "category", categoryId: overId.slice(4) };
  if (overId.startsWith("label:")) return { type: "label", labelId: overId.slice(6) };
  return null;
}
