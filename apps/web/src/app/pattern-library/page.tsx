import { FokunaIcon } from "@fokuna/icons";
import Link from "next/link";

import { patternCategories, patternEntries } from "./pattern-library-data";
import styles from "./pattern-library.module.css";

export default function PatternLibraryPage() {
  return (
    <div className={styles.overviewPage}>
      <header className={styles.overviewHero}>
        <div>
          <p className={styles.eyebrow}>Design system · implementation reference</p>
          <h1>Fokuna Pattern Library</h1>
          <p className={styles.heroCopy}>
            Verbindliche Dokumentation der produktiven Komponenten, ihrer Figma-Quelle, Zustände,
            Maße und technischen Verträge.
          </p>
        </div>
        <dl className={styles.overviewStats}>
          <div>
            <dt>Patterns</dt>
            <dd>{patternEntries.length}</dd>
          </div>
          <div>
            <dt>Control sizes</dt>
            <dd>4</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>Figma</dd>
          </div>
        </dl>
      </header>

      <section className={styles.principles} aria-labelledby="principles-title">
        <header>
          <p className={styles.sectionLabel}>Arbeitsgrundlage</p>
          <h2 id="principles-title">Ein Vertrag zwischen Design und Code</h2>
        </header>
        <div className={styles.principleGrid}>
          <div>
            <FokunaIcon name="diamond" size={24} />
            <strong>Figma ist die visuelle Quelle</strong>
            <p>Node, Varianten und Maße sind auf jeder Detailseite direkt referenziert.</p>
          </div>
          <div>
            <FokunaIcon name="code-brackets" size={24} />
            <strong>Code ist der funktionale Vertrag</strong>
            <p>Live-States zeigen tatsächliches Verhalten statt statischer Nachzeichnungen.</p>
          </div>
          <div>
            <FokunaIcon name="checklist" size={24} />
            <strong>Abweichungen werden sichtbar</strong>
            <p>Maße, Tokens und Zustände stehen neben dem gerenderten Pattern.</p>
          </div>
        </div>
      </section>

      <section className={styles.patternIndex} aria-labelledby="pattern-index-title">
        <header className={styles.indexHeader}>
          <div>
            <p className={styles.sectionLabel}>Komponentenindex</p>
            <h2 id="pattern-index-title">Alle dokumentierten Patterns</h2>
          </div>
          <Link className={styles.foundationLink} href="/pattern-library/foundations">
            Foundations prüfen
            <FokunaIcon name="chevron-right-small" size={16} />
          </Link>
        </header>

        {patternCategories.map((category) => (
          <div className={styles.indexGroup} key={category}>
            <h3>{category}</h3>
            <div className={styles.indexRows}>
              {patternEntries
                .filter((entry) => entry.category === category)
                .map((entry) => (
                  <Link href={`/pattern-library/${entry.slug}`} key={entry.slug}>
                    <span className={styles.indexNumber}>
                      {String(entry.number).padStart(2, "0")}
                    </span>
                    <span className={styles.indexName}>
                      <strong>{entry.title}</strong>
                      <small>{entry.figmaName}</small>
                    </span>
                    <span className={styles.indexVariants}>{entry.variantSummary}</span>
                    <span className={styles.indexStatus}>Figma mapped</span>
                    <FokunaIcon name="chevron-right-small" size={16} />
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
