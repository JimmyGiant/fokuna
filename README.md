# Fokuna

Produktionscode für die Fokuna SaaS-Anwendung, Pattern Library und gemeinsame Domänenpakete.

## Workspace

- `apps/web`: Next.js Hauptanwendung, API (`/api/v1`), Auth und Pattern Library
- `apps/admin`: interne Admin-Oberfläche (Port 3001)
- `packages/tokens`: Design Tokens
- `packages/icons`: Icon Registry
- `packages/ui`: Pattern-Library-Komponenten
- `packages/db`: Drizzle Schema und Neon Client
- `packages/domain`: reine Domänenregeln
- `packages/api-contracts`: Zod HTTP-Verträge
- `context`: Design- und Produktübergabe

## Entwicklung

Voraussetzungen: Node.js `>=20.11` und Corepack. pnpm ist auf `9.15.4` gepinnt.

```bash
corepack pnpm install
cp .env.example .env
corepack pnpm dev
```

Standardmäßig läuft der **Memory-Driver** (ohne Neon), inkl. Demo-Login:

- E-Mail: `demo@fokuna.app`
- Passwort: `demo-password-123`

App: [http://localhost:3000/app/aufgaben](http://localhost:3000/app/aufgaben)  
Pattern Library: [http://localhost:3000/pattern-library](http://localhost:3000/pattern-library)  
Login: [http://localhost:3000/login](http://localhost:3000/login)

### Neon / Better Auth

```bash
# .env
DATABASE_URL="postgresql://..."
FOKUNA_DATA_DRIVER=neon
BETTER_AUTH_SECRET="mindestens-32-zeichen-geheimnis"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

corepack pnpm --filter @fokuna/db push
```

## Qualität

```bash
corepack pnpm check
corepack pnpm test:e2e
```

## Architektur

`Route Handler → Service → Repository/Drizzle → PostgreSQL`  
Server Components dürfen dieselbe Service-Schicht direkt nutzen. Siehe `docs/decisions/`.
