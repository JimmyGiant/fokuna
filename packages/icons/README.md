# @fokuna/icons

Typisierte React-Schnittstelle für die freigegebene Fokuna Icon Library.

```tsx
<FokunaIcon name="chevron-right-small" size={16} stroke={1.5} radius={2} />
```

## Varianten

- Größe: `16`, `24`
- Strichstärke: `1`, `1.5`, `2` (nur vorhandene Figma-Varianten)
- Radius: `0`, `1`, `2`
- Fill: `off`, `on`
- Join: `round`, `square`

Fehlt eine exakte Ausprägung, wählt die Registry die geometrisch nächste freigegebene Variante des
gleichen Icons. Neue Icons werden ausschließlich über die kuratierte Quelle unter `src/icons`
eingebracht und anschließend mit `pnpm --filter @fokuna/icons build` neu generiert.
