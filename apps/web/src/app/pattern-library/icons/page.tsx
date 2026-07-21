import { FokunaIcon, iconNames } from "@fokuna/icons";
import Link from "next/link";

import styles from "../pattern-library.module.css";

export default function IconsPage() {
  return (
    <article className={styles.detailPage}>
      <header className={styles.detailHeader}>
        <div>
          <p className={styles.eyebrow}>Foundations · Icons</p>
          <h1>Icon-Übersicht</h1>
          <p>
            Alle kuratierten Icons aus <code>src/icons</code>, nutzbar über <code>FokunaIcon</code>{" "}
            in <code>@fokuna/icons</code>.
          </p>
        </div>
        <div className={styles.sourceBadge}>{iconNames.length} names · 16 / 24 px</div>
      </header>

      <section className={styles.detailSection}>
        <header>
          <p className={styles.sectionLabel}>Registry</p>
          <h2>Verfügbare Icons</h2>
          <p>
            Darstellung in 24px, Stroke 1.5. Name entspricht dem Prop <code>name</code>.
          </p>
        </header>

        <ul className={styles.iconGrid}>
          {iconNames.map((name) => (
            <li key={name}>
              <span aria-hidden="true" className={styles.iconGridGlyph}>
                <FokunaIcon name={name} size={24} stroke={1.5} />
              </span>
              <code>{name}</code>
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
