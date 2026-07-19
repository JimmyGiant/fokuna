## Technologiestack

### Zielsetzung

Der Stack soll die schnelle Entwicklung einer professionellen Task-, Kalender- und Produktivitätsplattform ermöglichen. Die Web-App bildet die erste Produktversion. Native Apps für iOS, macOS und Android sollen später auf derselben Backend- und API-Infrastruktur aufbauen.

Die Architektur soll:

- eine schnelle und reaktionsfähige Benutzeroberfläche ermöglichen,
- langfristig wartbar und skalierbar bleiben,
- Offline-Synchronisation für spätere native Apps unterstützen,
- unnötige Infrastrukturkomplexität vermeiden,
- eine weitgehend eigene Gestaltung und geringe Anbieterabhängigkeit ermöglichen,
- eine datenschutzfreundliche Verarbeitung in europäischen Regionen erlauben.

---

## Kerntechnologien

### Web-Plattform

**[Next.js](https://nextjs.org/), [React](https://react.dev/) und [TypeScript](https://www.typescriptlang.org/)**

Next.js dient als Grundlage für die Web-App, das interne Admin-Backend und zunächst auch für die HTTP-API. TypeScript wird durchgängig für Frontend, Backend und gemeinsame API-Verträge verwendet.

[Next.js Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route) ermöglichen reguläre API-Endpunkte für `GET`, `POST`, `PATCH`, `DELETE` und weitere HTTP-Methoden. Dadurch kann dieselbe API später von Web-, iOS-, macOS- und Android-Apps verwendet werden.

**Hosting: [Vercel](https://vercel.com/)**

Vercel übernimmt Deployment, Skalierung und die globale Auslieferung der Web-Anwendung über das integrierte [CDN](https://vercel.com/docs/cdn). Die serverseitige Ausführung wird möglichst in derselben europäischen Region wie die Datenbank betrieben.

---

### Datenbank

**[Neon Managed PostgreSQL](https://neon.com/)**

Neon stellt eine vollständig verwaltete PostgreSQL-Datenbank bereit. Gewählt wird eine EU-Region mit [Connection Pooling](https://neon.com/docs/connect/connection-pooling) für serverlose Zugriffe.

Die Entscheidung für PostgreSQL bietet:

- ein starkes relationales Datenmodell,
- gute Unterstützung komplexer Kalender- und Task-Beziehungen,
- Standard-SQL statt proprietärer Datenbanklogik,
- spätere Wechselmöglichkeiten zu anderen PostgreSQL-Anbietern,
- professionelle Backup- und Wiederherstellungsoptionen.

Connection Pooling ermöglicht Neon, viele parallele Verbindungen serverloser Anwendungen effizient zu bedienen.

**Datenbankzugriff: [Drizzle ORM](https://orm.drizzle.team/docs/get-started/neon-new)**

Drizzle bietet eine schlanke, typsichere Verbindung zwischen TypeScript und PostgreSQL. Für komplexe Abfragen kann ergänzend direktes SQL verwendet werden.

---

### Authentifizierung

**[Better Auth](https://better-auth.com/)**

Better Auth übernimmt:

- Registrierung und Anmeldung,
- Sessions,
- Passwort-Reset,
- E-Mail-Verifizierung,
- Magic Links,
- Social Login,
- später optional Passkeys und Zwei-Faktor-Authentifizierung.

Nutzer- und Sessiondaten bleiben in der eigenen Neon-Datenbank. Dadurch behalten wir Kontrolle über Datenhaltung, Benutzeroberfläche und spätere Migrationen. Better Auth unterstützt [Next.js](https://better-auth.com/docs/integrations/next) und [Drizzle](https://better-auth.com/docs/adapters/drizzle) direkt.

**[Resend](https://resend.com/docs/introduction)**

Resend übernimmt den Versand von Authentifizierungs-, Einladungs-, Erinnerungs- und System-E-Mails. Die E-Mail-Vorlagen werden im eigenen Design erstellt.

---

## Benutzeroberfläche

- **[Tailwind CSS](https://tailwindcss.com/)** für das grundlegende Styling
- **[shadcn/ui](https://ui.shadcn.com/) und [Radix UI](https://www.radix-ui.com/)** als zugängliche, anpassbare Komponentenbasis
- **eigene SVG-Icons** als internes Icon-System
- **[Motion](https://motion.dev/)** für gezielte Animationen und Übergänge
- **[dnd-kit](https://dndkit.com/)** für Drag-and-drop außerhalb des Kalenders

Die Komponentenbibliotheken bilden lediglich die technische Grundlage. Das visuelle Erscheinungsbild wird vollständig als eigenes Fokuna-Design-System umgesetzt.

---

## State, Formulare und Validierung

- **[Zod](https://zod.dev/)** für die Validierung von Formulardaten, API-Anfragen und externen Webhooks
- **[React Hook Form](https://react-hook-form.com/)** für Formulare
- **[TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview)** für Serverdaten, Caching, Retries und optimistische Updates
- **[Zustand](https://zustand-demo.pmnd.rs/)** ausschließlich bei Bedarf für globalen UI-Zustand
- **URL Search Params** für teilbare Filter, Ansichten und Kalenderzeiträume

Die Web-App bleibt zunächst online-first. Durch Caching und optimistische Updates reagiert sie trotzdem unmittelbar auf Nutzeraktionen.

---

## Kalender

**[FullCalendar Standard](https://fullcalendar.io/)**

FullCalendar bildet die Kalenderoberfläche der Web-App und unterstützt:

- Monats-, Wochen-, Tages- und Listenansichten,
- Drag-and-drop und Größenänderungen,
- eigene Event- und Task-Komponenten,
- Time Blocking,
- wiederkehrende Termine,
- vollständiges visuelles Customizing.

Die Standard-Version und der offizielle [React-Adapter](https://fullcalendar.io/docs/react) stehen unter der [MIT-Lizenz](https://fullcalendar.io/license). Premium wird erst für spezielle Ressourcenansichten benötigt, beispielsweise Mitarbeiter oder Räume als separate Zeilen und Spalten.

Ergänzend werden **[date-fns](https://date-fns.org/)**, **[Luxon](https://moment.github.io/luxon/)** und **[rrule](https://github.com/jkbrzt/rrule)** für Datumslogik, Zeitzonen und Wiederholungsregeln verwendet.

---

## Externe Integrationen

- **[Google Calendar API](https://developers.google.com/workspace/calendar/api/guides/overview)** für vollständige Zwei-Wege-Synchronisation
- **[Microsoft Graph](https://learn.microsoft.com/en-us/graph/api/resources/calendar?view=graph-rest-1.0)** für Outlook- und Microsoft-365-Kalender
- **[AccuWeather API](https://developer.accuweather.com/apis)** für aktuelle Wetterdaten und Vorhersagen
- Apple-/iCloud-Kalender werden zunächst nicht direkt integriert

Kalender-Synchronisation, Webhooks und Konfliktbehandlung werden als eigene Backend-Funktionalität umgesetzt und nicht FullCalendar überlassen.

---

## Zahlungen

**[Stripe Billing](https://docs.stripe.com/billing)**

Stripe übernimmt:

- SaaS-Abonnements,
- Checkout,
- Rechnungen,
- Tarifwechsel,
- Customer Portal,
- Zahlungs-Webhooks.

Stripe wird direkt angebunden und nicht mit der Authentifizierung gekoppelt. Dadurch können Better Auth oder andere Komponenten später ausgetauscht werden, ohne gleichzeitig das Abrechnungssystem zu migrieren.

---

## Dateien und Medien

**[Amazon S3](https://aws.amazon.com/s3/) in einer EU-Region**

S3 speichert Anhänge und Dateien. Uploads und Downloads erfolgen über zeitlich begrenzte [signierte URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html), damit Dateien nicht unnötig über den Anwendungsserver übertragen werden.

Bei wachsendem internationalem Dateiverkehr kann später [CloudFront](https://aws.amazon.com/cloudfront/) vor S3 ergänzt werden.

---

## Betrieb und Qualitätssicherung

- **[Sentry](https://docs.sentry.io/platforms/javascript/guides/nextjs/)** für Fehler-, Performance- und Release-Monitoring
- **[PostHog](https://posthog.com/docs)** für Produktanalyse und Feature-Auswertung
- **[Vercel Cron](https://vercel.com/docs/cron-jobs)** für einfache geplante Aufgaben
- **[Upstash Redis](https://upstash.com/docs/redis/overall/getstarted) und [QStash](https://upstash.com/docs/qstash/overall/getstarted)** erst bei Bedarf für Rate Limits, Queues und komplexere Hintergrundjobs
- **[Vitest](https://vitest.dev/guide/)** für Unit- und Integrationstests
- **[Playwright](https://playwright.dev/docs/intro)** für End-to-End-Tests
- **[pnpm](https://pnpm.io/)** Monorepo für Web-App, Admin-App, Worker und gemeinsame Pakete

Zusätzlich werden regelmäßige PostgreSQL-Backups unabhängig von Neon in einem separaten S3-Bucket gespeichert.

---

## Admin-Backend

Das interne Admin-Backend wird als separate Next.js-Anwendung innerhalb desselben Monorepos aufgebaut.

Es verwendet dieselben Backend-Services, Authentifizierungsregeln und UI-Grundlagen wie die Hauptanwendung. Das Better-Auth-Admin-Plugin liefert grundlegende Funktionen für Nutzer, Rollen und Sessions.

---

## API-first und spätere native Apps

Next.js wird zunächst als Web-App und API-Host verwendet. Zentrale Produktfunktionen werden jedoch über eine stabile HTTP-API bereitgestellt.

```text
Next.js Web ─────┐
iOS/macOS ───────┼── gemeinsame API ── Neon PostgreSQL
Android ─────────┘
```

Geschäftslogik wird nicht direkt in React-Komponenten oder ausschließlich in Server Actions abgelegt. Stattdessen gilt:

```text
API-Endpunkt → Service-Schicht → Drizzle → PostgreSQL
```

Dadurch kann später frei entschieden werden zwischen:

- **React Native/Expo** für eine gemeinsame iOS- und Android-Codebasis oder
- **SwiftUI und Jetpack Compose** für vollständig native Anwendungen.

Native Apps verwenden eine lokale SQLite-Datenbank und synchronisieren ihre Daten über dieselbe API mit Neon. Sie greifen niemals direkt auf PostgreSQL zu.

---

## Finaler Stack

**Next.js + React + TypeScript**  
**Vercel**  
**Neon PostgreSQL + Drizzle ORM**  
**Better Auth + Resend**  
**Tailwind CSS + shadcn/ui + Radix UI + eigene Icons**  
**Zod + React Hook Form + TanStack Query**  
**FullCalendar Standard**  
**Google Calendar API + Microsoft Graph + AccuWeather**  
**Stripe Billing**  
**Amazon S3**  
**Sentry + PostHog**  
**Vitest + Playwright**

Dieser Stack optimiert auf einen schnellen Produktstart, eine professionelle Web-Erfahrung und eine klare Weiterentwicklung zu nativen, offlinefähigen Anwendungen.
