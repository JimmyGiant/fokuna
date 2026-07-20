"use client";

import { FokunaIcon } from "@fokuna/icons";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { patternCategories, patternEntries } from "./pattern-library-data";
import styles from "./pattern-library.module.css";

export function PatternLibraryNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className={styles.navigation}>
      <div className={styles.navigationHeader}>
        <Link className={styles.brand} href="/pattern-library">
          <Image
            alt=""
            aria-hidden="true"
            className={styles.brandMark}
            height={32}
            priority
            src="/branding/fokuna_logo_no-text.svg"
            width={34}
          />
          <span>
            <strong>Fokuna</strong>
            <small>Pattern Library</small>
          </span>
        </Link>
      </div>

      <label className={styles.mobileNavigation}>
        <span>Pattern auswählen</span>
        <select
          onChange={(event) => {
            const next = event.currentTarget.value;
            if (next !== pathname) router.push(next);
          }}
          value={pathname}
        >
          <option value="/pattern-library">Übersicht</option>
          <option value="/pattern-library/foundations">Foundations</option>
          <option value="/pattern-library/icons">Icons</option>
          {patternCategories.map((category) => (
            <optgroup key={category} label={category}>
              {patternEntries
                .filter((entry) => entry.category === category)
                .map((entry) => (
                  <option key={entry.slug} value={`/pattern-library/${entry.slug}`}>
                    {String(entry.number).padStart(2, "0")} · {entry.title}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>

      <nav aria-label="Pattern Library">
        <Link
          aria-current={pathname === "/pattern-library" ? "page" : undefined}
          className={styles.navigationOverview}
          href="/pattern-library"
        >
          <FokunaIcon name="layers" size={16} />
          Übersicht
        </Link>
        <Link
          aria-current={pathname === "/pattern-library/foundations" ? "page" : undefined}
          className={styles.navigationOverview}
          href="/pattern-library/foundations"
        >
          <FokunaIcon name="diamond" size={16} />
          Foundations
        </Link>
        <Link
          aria-current={pathname === "/pattern-library/icons" ? "page" : undefined}
          className={styles.navigationOverview}
          href="/pattern-library/icons"
        >
          <FokunaIcon name="images" size={16} />
          Icons
        </Link>

        {patternCategories.map((category) => {
          const entries = patternEntries.filter((entry) => entry.category === category);
          return (
            <div className={styles.navigationGroup} key={category}>
              <p>{category}</p>
              {entries.map((entry) => {
                const href = `/pattern-library/${entry.slug}`;
                return (
                  <Link
                    aria-current={pathname === href ? "page" : undefined}
                    href={href}
                    key={entry.slug}
                  >
                    <span>{String(entry.number).padStart(2, "0")}</span>
                    {entry.title}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
