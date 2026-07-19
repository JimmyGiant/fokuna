import type { ReactNode } from "react";

import { PatternLibraryNavigation } from "./pattern-library-navigation";
import styles from "./pattern-library.module.css";

export default function PatternLibraryLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.libraryShell}>
      <PatternLibraryNavigation />
      <main className={styles.libraryMain}>{children}</main>
    </div>
  );
}
