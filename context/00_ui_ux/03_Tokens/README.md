# Fokuna Design Token Export

Exportiert aus **UI Design | Fokuna** am 2026-07-19T05:26:59.465Z. Das Paket ist fuer die spaetere Umsetzung mit Next.js, Tailwind und TypeScript gedacht.

## Dateien

- `tokens/fokuna.tokens.json`: kompakter Export aller lokalen Figma-Variablen inklusive Primitives, semantischer Tokens und Modi sowie Text-, Effekt- und Paint-Styles.
- `tokens/fokuna.tokens.ts`: kleiner TypeScript-Einstiegspunkt fuer den JSON-Export.
- `tokens/fokuna.tokens.css`: Runtime-CSS-Variablen mit `--fk-*` Praefix und `[data-theme]` Unterstuetzung.
- `tokens/fokuna.tailwind-theme.css`: Tailwind-v4-Bridge ueber `@theme static`.
- `tokens/fokuna.typography.css`: optionale Utility-Klassen fuer die Figma-Schriftstile.
- `tokens/fokuna.styles.json`: schnelle Referenz fuer Typography, Dropshadows und Paint Styles.
- `tailwind/fokuna.tailwind.preset.ts`: Tailwind TypeScript Preset als Fallback/Referenz.
- `tailwind/tailwind.config.example.ts`: minimales Beispiel.

## Empfohlene Integration

```css
@import "tailwindcss";
@import "../design-system/tokens/fokuna.tokens.css";
@import "../design-system/tokens/fokuna.tailwind-theme.css";
```

Im Produktcode bitte semantische Tokens bevorzugen, etwa `surface/*`, `text/*`, `icon/*`, `border/*`, `brand/*`, `category/*` und `priority-scale/*`. Primitive Tokens bleiben enthalten, damit Skalen und Ableitungen nachvollziehbar sind, sollten aber nur in Ausnahmefaellen direkt in Komponenten verwendet werden.

## Fonts

Figma nutzt `Geist` fuer Headline, Body, Label und Link sowie `Roboto Serif` fuer Schmuckzeilen. In Next.js muessen diese Fonts separat geladen werden, z.B. ueber `next/font/google` oder `next/font/local`.

## Shadows

Die Dropshadows sind als mehrlagige CSS `box-shadow` Werte exportiert. Bitte nicht auf simple Einzelschatten reduzieren: `micro-element` fuer kleine Controls, `subtle-element` fuer kompakte UI-Elemente, `medium-card` fuer normale Cards, `highlight-card` fuer hervorgehobene Karten.

## Referenzen

- Tailwind CSS Theme Variables: https://tailwindcss.com/docs/theme
- Tailwind CSS Font Family: https://tailwindcss.com/docs/font-family
- Figma Variables REST API: https://developers.figma.com/docs/rest-api/variables/
- Figma Plugin Variables API: https://developers.figma.com/docs/plugins/working-with-variables/
