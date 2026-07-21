# Phase 6: Production Hardening Checklist

## Quality gates

- [ ] `corepack pnpm check` green
- [ ] Playwright E2E: Auth, Tasks, Calendar move, Focus, Journal, Integrations reconnect, Stripe webhook
- [ ] Visual regression baselines for Pattern Library and core views
- [ ] WCAG 2.2 AA checklist for central flows
- [ ] Core Web Vitals: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 at p75

## Security and data

- [ ] Secrets only in environment / secret manager
- [ ] Neon EU + connection pooling
- [ ] Independent PostgreSQL backups in EU S3 bucket; restore tested
- [ ] Stripe / calendar webhooks signature-verified and idempotent
- [ ] Integration credentials encrypted at rest
- [ ] Privacy texts, export and account deletion process approved

## Observability

- [ ] Sentry errors, traces, releases, source maps
- [ ] PostHog product events with consent model
- [ ] Alerts for auth failures, sync backlog, billing webhook errors

## Release

- [ ] Rollback and incident runbooks
- [ ] Staging sign-off against Figma views
- [ ] Pattern Library catalog still current for all shipped components
