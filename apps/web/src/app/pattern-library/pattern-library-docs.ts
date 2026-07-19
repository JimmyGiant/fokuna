import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import type { PatternEntry } from "./pattern-library-data";

export interface HandoffGroup {
  title: string;
  items: string[];
}

export interface HandoffSection {
  paragraphs: string[];
  groups: HandoffGroup[];
}

function documentationPath() {
  const relative = "context/00_ui_ux/01_Pattern-Library/00_Fokuna_Pattern_Library_Uebersicht.md";
  const candidates = [resolve(process.cwd(), relative), resolve(process.cwd(), "../..", relative)];
  const match = candidates.find(existsSync);

  if (!match) throw new Error(`Pattern-Library-Dokumentation nicht gefunden: ${relative}`);
  return match;
}

function cleanInlineMarkdown(value: string) {
  return value
    .replaceAll(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replaceAll(/`([^`]+)`/g, "$1")
    .replaceAll(/\*\*([^*]+)\*\*/g, "$1")
    .trim();
}

export function getHandoffSection(entry: PatternEntry): HandoffSection {
  const source = readFileSync(documentationPath(), "utf8");
  const marker = `### ${String(entry.number).padStart(2, "0")} `;
  const start = source.indexOf(marker);
  if (start < 0) return { paragraphs: [], groups: [] };

  const nextComponent = source.indexOf("\n### ", start + marker.length);
  const nextMajor = source.indexOf("\n## ", start + marker.length);
  const possibleEnds = [nextComponent, nextMajor].filter((value) => value >= 0);
  const end = possibleEnds.length ? Math.min(...possibleEnds) : source.length;
  const lines = source
    .slice(start, end)
    .split("\n")
    .slice(1)
    .map((line) => line.trim());

  const paragraphs: string[] = [];
  const groups: HandoffGroup[] = [];
  let currentGroup: HandoffGroup | undefined;

  for (const line of lines) {
    if (!line || line.startsWith("Screenshot:")) continue;
    if (line.endsWith(":")) {
      currentGroup = { title: line.slice(0, -1), items: [] };
      groups.push(currentGroup);
      continue;
    }
    if (line.startsWith("- ")) {
      currentGroup?.items.push(cleanInlineMarkdown(line.slice(2)));
      continue;
    }
    paragraphs.push(cleanInlineMarkdown(line));
  }

  return { paragraphs, groups: groups.filter((group) => group.items.length) };
}
