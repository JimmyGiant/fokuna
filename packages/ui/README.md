# @fokuna/ui

Gemeinsame React-Komponenten für Fokuna. Alle öffentlichen Komponenten werden über `src/index.ts`
exportiert und nutzen ausschließlich `@fokuna/tokens` sowie `@fokuna/icons` als visuelle Basis.

## Konventionen

- Control-Größen: `sm` 28px, `md` 32px, `lg` 40px, `xl` 48px.
- Variantenwerte und `data-*`-States bleiben kleingeschrieben.
- Browser-Fokus wird ausschließlich über `:focus-visible` und `--fk-focus-ring` dargestellt.
- Filled Actions verwenden inverse Inhalte und Micro Shadow; Outline Actions bleiben transparent.
- Komposition vor Duplikation: Input Group nutzt Input Field, Task Modal Slot nutzt Header und Menu,
  UI Shell nutzt Sidebar und unabhängigen Content.
- Zustände mit fachlicher Bedeutung sind Props oder Varianten. Hover, Active und Focus bleiben
  technische Interaktionszustände in CSS.

## Entwicklung

```bash
corepack pnpm --filter @fokuna/ui test
corepack pnpm --filter @fokuna/ui lint
corepack pnpm --filter @fokuna/ui typecheck
```

Jede neue oder geänderte Komponente muss außerdem auf `/pattern-library` in ihren relevanten Größen
und Zuständen sichtbar sein.
