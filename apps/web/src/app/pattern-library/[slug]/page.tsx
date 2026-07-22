import { FokunaIcon } from "@fokuna/icons";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PatternSpecimen } from "../pattern-specimens";
import { getPatternEntry, patternEntries } from "../pattern-library-data";
import { getHandoffSection } from "../pattern-library-docs";
import styles from "../pattern-library.module.css";

export function generateStaticParams() {
  const aliases = ["card-modal", "confirmation-modal", "delete-confirm", "task-modal"];
  return [
    ...patternEntries.map((entry) => ({ slug: entry.slug })),
    ...aliases.map((slug) => ({ slug })),
  ];
}

export default async function PatternDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getPatternEntry(slug);
  if (!entry) notFound();

  const handoff = getHandoffSection(entry);
  const figmaUrl = `https://www.figma.com/design/ltQMlboZomvr70Z4m0aLQj/UI-Design-%7C-Fokuna?node-id=${entry.figmaNodeId.replace(":", "-")}`;

  return (
    <article className={styles.detailPage}>
      <header className={styles.detailHeader}>
        <div>
          <p className={styles.eyebrow}>
            {entry.category} · Pattern {String(entry.number).padStart(2, "0")}
          </p>
          <h1>{entry.title}</h1>
          <p>{handoff.paragraphs[0] ?? entry.variantSummary}</p>
        </div>
        <a className={styles.figmaLink} href={figmaUrl} rel="noreferrer" target="_blank">
          In Figma öffnen
          <FokunaIcon name="external-link" size={16} />
        </a>
      </header>

      <dl className={styles.contractBar}>
        <div>
          <dt>Figma node</dt>
          <dd>
            <code>{entry.figmaNodeId}</code>
          </dd>
        </div>
        <div>
          <dt>Implementation</dt>
          <dd>
            <code>{entry.implementation}</code>
          </dd>
        </div>
        <div>
          <dt>Dimensions</dt>
          <dd>{entry.dimensions.join(" · ")}</dd>
        </div>
        <div>
          <dt>Coverage</dt>
          <dd>
            <span className={styles.coverageDot} /> Figma mapped
          </dd>
        </div>
      </dl>

      <section className={styles.detailSection}>
        <header>
          <p className={styles.sectionLabel}>Live specimen</p>
          <h2>Produktive Komponente</h2>
          <p>Interaktiv gerendert und in den originalen Control-Maßen dargestellt.</p>
        </header>
        <div className={styles.specimenStage}>
          <PatternSpecimen slug={entry.slug} />
        </div>
      </section>

      <section className={styles.referenceSection}>
        <header>
          <p className={styles.sectionLabel}>Visual source</p>
          <h2>Figma-Referenz</h2>
          <p>{entry.figmaName}</p>
        </header>
        <figure className={styles.referenceFigure}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={`Figma-Referenz für ${entry.title}`}
            src={`/pattern-library/reference/${entry.screenshot}`}
          />
          <figcaption>Exportierter Komponentenbereich · UI Design | Fokuna</figcaption>
        </figure>
      </section>

      <section className={styles.detailSection}>
        <header>
          <p className={styles.sectionLabel}>Contract</p>
          <h2>Varianten, States und Umsetzung</h2>
          <p>{entry.variantSummary}</p>
        </header>
        <div className={styles.handoffGrid}>
          {handoff.groups.map((group) => (
            <section key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <footer className={styles.detailFooter}>
        <Link href="/pattern-library">
          <FokunaIcon name="chevron-left-small" size={16} />
          Zur Übersicht
        </Link>
        <span>Source of truth: Figma node {entry.figmaNodeId}</span>
      </footer>
    </article>
  );
}
