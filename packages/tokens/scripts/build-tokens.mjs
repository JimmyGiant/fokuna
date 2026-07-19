import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { format } from "prettier";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(packageRoot, "../..");
const sourceRoot = resolve(repositoryRoot, "context/00_ui_ux/03_Tokens/tokens");
const outputRoot = resolve(packageRoot, "src");

const dimensionPrefixes = [
  "--fk-control-",
  "--fk-radius-",
  "--fk-space-",
  "--fk-spacing-",
  "--fk-stroke-",
  "--fk-type-font-font-size-",
  "--fk-type-font-letter-spacing-",
  "--fk-type-font-line-height-",
  "--fk-type-font-paragraph-spacing-",
  "--fk-type-section-spacer-",
];

const fontWeights = new Map([
  ["Regular", "400"],
  ["Medium", "500"],
  ["SemiBold", "600"],
  ["Bold", "700"],
  ['"Medium Italic"', "500"],
]);

function normalizeCss(source) {
  return source
    .split("\n")
    .filter((line) => !line.includes("primitive-sand-100"))
    .map((line) => {
      let normalized = line.replaceAll("#FCF9F3", "#FFFFFF");
      const weightMatch = normalized.match(/^(\s*--fk-type-font-font-weight-[^:]+):\s*(.+);$/);

      if (weightMatch) {
        const [, property, value] = weightMatch;
        return `${property}: ${fontWeights.get(value) ?? value};`;
      }

      const dimensionMatch = normalized.match(/^(\s*)(--fk-[^:]+):\s*(-?\d+(?:\.\d+)?);$/);
      if (dimensionMatch) {
        const [, indent, property, value] = dimensionMatch;
        if (dimensionPrefixes.some((prefix) => property.startsWith(prefix))) {
          normalized = `${indent}${property}: ${value}px;`;
        }
      }

      return normalized;
    })
    .join("\n");
}

function normalizeJsonValue(value) {
  if (Array.isArray(value)) {
    return value
      .filter((item) => !(item && typeof item === "object" && item.name === "sand/100"))
      .map(normalizeJsonValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, normalizeJsonValue(child)]),
    );
  }

  return value === "#FCF9F3" ? "#FFFFFF" : value;
}

await mkdir(outputRoot, { recursive: true });

const [rawCss, rawTailwind, typography, rawTokens] = await Promise.all([
  readFile(resolve(sourceRoot, "fokuna.tokens.css"), "utf8"),
  readFile(resolve(sourceRoot, "fokuna.tailwind-theme.css"), "utf8"),
  readFile(resolve(sourceRoot, "fokuna.typography.css"), "utf8"),
  readFile(resolve(sourceRoot, "fokuna.tokens.json"), "utf8"),
]);

const foundationExtensions = `

:root {
  --fk-type-font-font-size-label-sm: var(--fk-type-font-font-size-body-sm);
  --fk-type-font-font-size-label-md: var(--fk-type-font-font-size-body-md);
  --fk-type-font-font-size-label-lg: var(--fk-type-font-font-size-body-lg);
  --fk-type-font-font-size-label-xl: var(--fk-type-font-font-size-body-xl);
  --fk-type-font-line-height-label-sm: var(--fk-type-font-line-height-body-sm);
  --fk-type-font-line-height-label-md: var(--fk-type-font-line-height-body-md);
  --fk-type-font-line-height-label-lg: var(--fk-type-font-line-height-body-lg);
  --fk-type-font-line-height-label-xl: var(--fk-type-font-line-height-body-xl);
  --fk-type-font-font-weight-label-primary: 600;
  --fk-shadow-highlight-card: 0px 2px 4px -2px rgb(9 25 49 / 6%), 0px 10px 24px -8px rgb(9 25 49 / 8%), 0px 24px 56px -18px rgb(9 25 49 / 10%), 0px 40px 96px -32px rgb(9 25 49 / 6%);
  --fk-shadow-medium-card: 0px 1px 2px -1px rgb(9 25 49 / 5%), 0px 6px 16px -6px rgb(9 25 49 / 7%), 0px 16px 32px -14px rgb(9 25 49 / 8%);
  --fk-shadow-subtle-element: 0px 1px 2px -1px rgb(9 25 49 / 4%), 0px 3px 8px -4px rgb(9 25 49 / 5%), 0px 8px 16px -10px rgb(9 25 49 / 4%);
  --fk-shadow-micro-element: 0px 1px 1px 0px rgb(9 25 49 / 4%), 0px 2px 6px -3px rgb(9 25 49 / 3.5%);
  --fk-focus-ring: 0 0 0 2px var(--fk-color-surface-base), 0 0 0 4px var(--fk-color-border-focus);
  --fk-motion-duration-fast: 120ms;
  --fk-motion-duration-default: 180ms;
  --fk-motion-duration-slow: 240ms;
  --fk-motion-ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --fk-motion-ease-enter: cubic-bezier(0, 0, 0, 1);
  --fk-motion-ease-exit: cubic-bezier(0.3, 0, 1, 1);
}
`;

const tailwindExtensions = `
  --shadow-highlight-card: var(--fk-shadow-highlight-card);
  --shadow-medium-card: var(--fk-shadow-medium-card);
  --shadow-subtle-element: var(--fk-shadow-subtle-element);
  --shadow-micro-element: var(--fk-shadow-micro-element);
`;

const normalizedTailwind = normalizeCss(rawTailwind).replace(/}\s*$/, `${tailwindExtensions}}\n`);
const normalizedTokens = normalizeJsonValue(JSON.parse(rawTokens));

const [themeOutput, tailwindOutput, typographyOutput, tokensOutput] = await Promise.all([
  format(`${normalizeCss(rawCss)}${foundationExtensions}`, { parser: "css", printWidth: 100 }),
  format(normalizedTailwind, { parser: "css", printWidth: 100 }),
  format(typography, { parser: "css", printWidth: 100 }),
  format(`${JSON.stringify(normalizedTokens, null, 2)}\n`, { parser: "json", printWidth: 100 }),
]);

await Promise.all([
  writeFile(resolve(outputRoot, "theme.css"), themeOutput),
  writeFile(resolve(outputRoot, "tailwind.css"), tailwindOutput),
  writeFile(resolve(outputRoot, "typography.css"), typographyOutput),
  writeFile(resolve(outputRoot, "tokens.json"), tokensOutput),
]);
