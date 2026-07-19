# @fokuna/tokens

Produktionsfähige Ableitung des freigegebenen Figma-Tokenexports.

## Regeln

- Komponenten verwenden semantische `--fk-color-*`-Tokens.
- Primitive Farbskalen dienen der Ableitung und Dokumentation, nicht dem normalen Komponentenbau.
- Alle Längenwerte werden als gültige CSS-Dimensionen mit `px` ausgegeben.
- Der verworfene Warm-Wert `#FCF9F3` wird nicht in die Produktionsartefakte übernommen.
- Light ist der aktive Produktmodus. Dark bleibt als vorbereiteter Modus enthalten und wird erst nach
  einer eigenen visuellen Abnahme produktiv genutzt.

## Generierung

```bash
pnpm --filter @fokuna/tokens build
```

Die Quelle bleibt der Export unter `context/00_ui_ux/03_Tokens`; die generierten Dateien in `src`
werden eingecheckt, damit nachfolgende Arbeitsschritte keine Figma-Verbindung benötigen.
