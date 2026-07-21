import { FokunaIcon, iconNames, iconRecords, type IconFill, type IconName } from "@fokuna/icons";
import Link from "next/link";

import styles from "../pattern-library.module.css";

const filledIconNames = new Set<IconName>(
  iconRecords.filter((record) => record.fill === "on").map((record) => record.name),
);

const iconCatalog: Array<{ name: IconName; fill: IconFill; label: string }> = iconNames.flatMap(
  (name) => {
    const entries: Array<{ name: IconName; fill: IconFill; label: string }> = [
      { name, fill: "off", label: name },
    ];
    if (filledIconNames.has(name)) {
      entries.push({ name, fill: "on", label: `${name} · fill` });
    }
    return entries;
  },
);

export default function IconsPage() {
  return (
    <article className={styles.detailPage}>
      <header className={styles.detailHeader}>
        <div>
          <p className={styles.eyebrow}>Foundations · Icons</p>
          <h1>Icon-Übersicht</h1>
          <p>
            Alle kuratierten Icons aus <code>src/icons</code>, nutzbar über <code>FokunaIcon</code>{" "}
            in <code>@fokuna/icons</code>. Fill-Varianten erscheinen als <code>name · fill</code> und
            werden mit <code>fill=&quot;on&quot;</code> angesprochen.
          </p>
        </div>
        <div className={styles.sourceBadge}>
          {iconNames.length} names · {iconCatalog.length} glyphs · 16 / 24 px
        </div>
      </header>

      <section className={styles.detailSection}>
        <header>
          <p className={styles.sectionLabel}>Registry</p>
          <h2>Verfügbare Icons</h2>
          <p>
            Darstellung in 24px, Stroke 1.5. Name entspricht dem Prop <code>name</code>; Fill-Tiles
            nutzen zusätzlich <code>fill=&quot;on&quot;</code>.
          </p>
        </header>

        <ul className={styles.iconGrid}>
          {iconCatalog.map((entry) => (
            <li key={`${entry.name}-${entry.fill}`}>
              <span aria-hidden="true" className={styles.iconGridGlyph}>
                <FokunaIcon fill={entry.fill} name={entry.name} size={24} stroke={1.5} />
              </span>
              <code>{entry.label}</code>
            </li>
          ))}
        </ul>
      </section>

      <footer className={styles.detailFooter}>
        <Link href="/pattern-library">
          <FokunaIcon name="chevron-left-small" size={16} />
          Zur Übersicht
        </Link>
        <span>Quelle: src/icons → packages/icons</span>
      </footer>
    </article>
  );
}
