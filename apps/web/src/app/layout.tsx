import { Geist, Roboto_Serif } from "next/font/google";
import type { Metadata } from "next";

import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const robotoSerif = Roboto_Serif({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-roboto-serif",
});

export const metadata: Metadata = {
  title: "Fokuna Pattern Library",
  description: "Interne Prüfoberfläche für das Fokuna Designsystem.",
  icons: {
    icon: [{ url: "/branding/fokuna_logo_no-text.svg", type: "image/svg+xml" }],
    apple: [{ url: "/branding/fokuna_logo_no-text.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={`${geist.variable} ${robotoSerif.variable}`} lang="de">
      <body>{children}</body>
    </html>
  );
}
