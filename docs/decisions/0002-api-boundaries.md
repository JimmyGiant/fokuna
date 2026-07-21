# ADR 0002: API Boundaries

## Status

Accepted

## Context

Fokuna muss zuerst als Web-App liefern und später native Clients über dieselbe Geschäftslogik
anbinden. Domänenlogik darf deshalb nicht in React-Komponenten oder ausschließlich in Server
Actions leben.

## Decision

- Externe HTTP-API: `apps/web/src/app/api/v1/**` mit Zod-Verträgen aus `@fokuna/api-contracts`.
- Interner Pfad: `Route Handler → Service → Repository/Drizzle → PostgreSQL`.
- Server Components dürfen dieselbe Service-Schicht direkt aufrufen, ohne internen HTTP-Hop.
- `@fokuna/domain` enthält nur reine Regeln und Typen ohne I/O.
- `@fokuna/db` besitzt Schema, Client und Migrationsartefakte.
- Autorisierung erfolgt in der Service-Schicht pro Objekt (`userId`), nicht nur in der UI.

## Consequences

Native Clients können dieselben `/api/v1` Endpunkte nutzen. Feature-UI bleibt austauschbar.
Repository-Zugriff aus Client Components ist unzulässig.
