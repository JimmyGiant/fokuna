import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Fokuna Admin",
  description: "Interne Betriebsoberfläche für Nutzer, Rollen und Sessions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
