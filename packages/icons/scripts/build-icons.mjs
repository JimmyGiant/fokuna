import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { format } from "prettier";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(packageRoot, "../..");
const sourceRoot = resolve(repositoryRoot, "src/icons");
const outputFile = resolve(packageRoot, "src/registry.generated.ts");
const filePattern =
  /^foku_icon_(16|24)_stroke-(1|1-5|2)_radius-(0|1|2)_fill-(off|on)_join-(round|square)_(.+)\.svg$/;

const files = (await readdir(sourceRoot)).filter((file) => file.endsWith(".svg")).sort();
const records = [];

for (const file of files) {
  const match = file.match(filePattern);
  if (!match) {
    throw new Error(`Unexpected icon filename: ${file}`);
  }

  const [, size, rawStroke, radius, fill, join, name] = match;
  const source = await readFile(resolve(sourceRoot, file), "utf8");
  const viewBox = source.match(/viewBox="([^"]+)"/)?.[1];
  const body = source.match(/<svg[^>]*>([\s\S]*)<\/svg>/)?.[1]?.trim();

  if (!viewBox || !body) {
    throw new Error(`Invalid SVG structure: ${file}`);
  }

  if (/(?:stroke|fill)="(?!currentColor|none)/.test(source)) {
    throw new Error(`Icon contains a fixed color: ${file}`);
  }

  const stroke = rawStroke === "1-5" ? "1.5" : rawStroke;
  records.push({
    key: `${name}|${size}|${stroke}|${radius}|${fill}|${join}`,
    name,
    size: Number(size),
    stroke,
    radius: Number(radius),
    fill,
    join,
    viewBox,
    body,
  });
}

const names = [...new Set(records.map((record) => record.name))].sort();
const source = `// Generated from src/icons. Do not edit manually.
export const iconRecords = ${JSON.stringify(records, null, 2)} as const;

export const iconNames = ${JSON.stringify(names, null, 2)} as const;

export type IconName = (typeof iconNames)[number];
export type IconRecord = (typeof iconRecords)[number];
`;

await mkdir(dirname(outputFile), { recursive: true });
await writeFile(outputFile, await format(source, { parser: "typescript", printWidth: 100 }));
