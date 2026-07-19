import { Card } from "@fokuna/ui";

import styles from "../pattern-library.module.css";

const semanticColors = [
  ["Brand primary", "--fk-color-brand-primary", "#FD766B"],
  ["Brand secondary", "--fk-color-brand-secondary", "#2CB1AF"],
  ["Brand secondary pressed", "--fk-color-brand-secondary-pressed", "#1C6665"],
  ["Text primary", "--fk-color-text-primary", "#252629"],
  ["Text secondary", "--fk-color-text-secondary", "#4E4F52"],
  ["Text tertiary", "--fk-color-text-tertiary", "#646568"],
  ["Surface base", "--fk-color-surface-base", "#FFFFFF"],
  ["Surface subtle", "--fk-color-surface-subtle", "#FAFAFA"],
  ["Surface soft", "--fk-color-surface-soft", "#F5F5F5"],
  ["Surface muted", "--fk-color-surface-muted", "#EDEDED"],
  ["Border default", "--fk-color-border-default", "#EDEDED"],
  ["Border strong", "--fk-color-border-strong", "#D0D0D3"],
];

const categoryColors = ["coral", "teal", "blue", "purple", "pink", "gold"] as const;
const priorityColors = ["low", "medium", "high", "urgent"] as const;

const typeStyles = [
  ["Headline MD", "fk-headline-md", "24 / 32", "Geist Bold"],
  ["Headline SM", "fk-headline-sm", "16 / 24", "Geist Bold"],
  ["Body LG", "fk-body-lg", "16 / 22", "Geist Regular"],
  ["Body MD", "fk-body-md", "14 / 20", "Geist Regular"],
  ["Body SM", "fk-body-sm", "12 / 16", "Geist Regular"],
  ["Label LG", "fk-label-lg", "16 / 22", "Geist SemiBold"],
  ["Label MD", "fk-label-md", "14 / 20", "Geist SemiBold"],
  ["Label SM", "fk-label-sm", "12 / 16", "Geist SemiBold"],
  ["Schmuckzeile XL", "fk-schmuckzeile-xl", "20 / 24", "Roboto Serif Medium Italic"],
];

export default function FoundationsPage() {
  return (
    <article className={styles.detailPage}>
      <header className={styles.detailHeader}>
        <div>
          <p className={styles.eyebrow}>Foundations</p>
          <h1>Visuelle Systembasis</h1>
          <p>
            Die hier gezeigten Werte stammen aus den vier Figma-Variablensammlungen und den lokalen
            Text- und Effect-Styles. Komponenten konsumieren ausschließlich semantische Tokens.
          </p>
        </div>
        <div className={styles.sourceBadge}>315 variables · 30 text styles · 4 shadows</div>
      </header>

      <section className={styles.detailSection}>
        <header>
          <p className={styles.sectionLabel}>Color</p>
          <h2>Semantische Farben</h2>
          <p>Light Mode ist aktuell produktiv. Primitive Werte bleiben Implementierungsdetail.</p>
        </header>
        <div className={styles.colorTable}>
          {semanticColors.map(([label, token, value]) => (
            <div key={token}>
              <i style={{ background: `var(${token})` }} />
              <strong>{label}</strong>
              <code>{token}</code>
              <span>{value}</span>
            </div>
          ))}
        </div>
        <div className={styles.paletteSection}>
          <h3>Kategorie-Farben</h3>
          <p>
            Jede Nutzerfarbe besitzt feste 10-, 25- und 50-Prozent-Flächen sowie einen
            kontraststärkeren Textwert.
          </p>
          <div className={styles.paletteGrid}>
            {categoryColors.map((color) => (
              <div key={color}>
                <strong>{color}</strong>
                <span style={{ background: `var(--fk-color-category-${color}-10)` }} />
                <span style={{ background: `var(--fk-color-category-${color}-25)` }} />
                <span style={{ background: `var(--fk-color-category-${color}-50)` }} />
                <span style={{ background: `var(--fk-color-category-${color})` }} />
                <code>{`category/${color}`}</code>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.paletteSection}>
          <h3>Aufgabenpriorität</h3>
          <div className={styles.priorityGrid}>
            {priorityColors.map((priority) => (
              <div key={priority}>
                <i style={{ background: `var(--fk-color-task-priority-${priority})` }} />
                <strong>{priority}</strong>
                <code>{`task-priority/${priority}`}</code>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.detailSection}>
        <header>
          <p className={styles.sectionLabel}>Typography</p>
          <h2>Produktive Typostufen</h2>
          <p>Minimum sind 12 px; Größe und Zeilenhöhe entsprechen den aktuellen Figma-Styles.</p>
        </header>
        <div className={styles.typeTable}>
          {typeStyles.map(([label, className, metrics, family]) => (
            <div key={label}>
              <span className={className}>Fokuna plant den Tag mit Ruhe.</span>
              <strong>{label}</strong>
              <code>{metrics}</code>
              <small>{family}</small>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.detailSection}>
        <header>
          <p className={styles.sectionLabel}>Control scale</p>
          <h2>Gemeinsame Höhen und Radien</h2>
          <p>Controls in derselben Reihe verwenden dieselbe Größenstufe.</p>
        </header>
        <div className={styles.controlScale}>
          {[
            ["SM", "28 px", "9 px", "12 / 16"],
            ["MD", "32 px", "10 px", "14 / 20"],
            ["LG", "40 px", "12 px", "16 / 22"],
            ["XL", "48 px", "12 px", "16 / 22"],
          ].map(([size, height, radius, type]) => (
            <div key={size}>
              <span style={{ height }} />
              <strong>{size}</strong>
              <dl>
                <div>
                  <dt>Höhe</dt>
                  <dd>{height}</dd>
                </div>
                <div>
                  <dt>Radius</dt>
                  <dd>{radius}</dd>
                </div>
                <div>
                  <dt>Typo</dt>
                  <dd>{type}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.detailSection}>
        <header>
          <p className={styles.sectionLabel}>Elevation</p>
          <h2>Mehrlagige Schatten</h2>
          <p>
            Von kleinen Controls bis zu hervorgehobenen Karten steigt die räumliche Distanz
            graduell.
          </p>
        </header>
        <div className={styles.shadowScale}>
          {(["micro", "subtle", "medium", "highlight"] as const).map((shadow) => (
            <Card elevated={shadow} key={shadow}>
              <strong>{shadow}</strong>
              <code>
                {shadow === "micro" || shadow === "subtle"
                  ? `--fk-shadow-${shadow}-element`
                  : `--fk-shadow-${shadow}-card`}
              </code>
            </Card>
          ))}
        </div>
      </section>
    </article>
  );
}
