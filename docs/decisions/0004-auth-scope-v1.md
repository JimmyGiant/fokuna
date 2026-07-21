# ADR 0004: Auth Scope V1

## Status

Accepted

## Context

PRD §17 lässt Magic Link, Social Login, Passkeys und 2FA offen. Für den ersten produktiven
Web-Aufbau braucht die Auth-Schicht einen klaren Scope.

## Decision

V1 enthält:

- E-Mail/Passwort Registrierung und Login
- Sessionverwaltung über Better Auth
- E-Mail-Verifizierung und Passwort-Reset über Resend (wenn `RESEND_API_KEY` gesetzt)
- Serverseitig geschützte App- und API-Routen

V1 enthält bewusst nicht:

- Magic Link
- Social Login
- Passkeys
- Zwei-Faktor-Authentifizierung

## Consequences

Auth-UI und API werden auf E-Mail/Passwort optimiert. Erweiterungen können später als Better-Auth-
Plugins ergänzt werden, ohne das User-/Session-Modell zu ersetzen.
