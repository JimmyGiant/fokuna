"use client";

import type { UserProfileDto } from "@fokuna/api-contracts";
import { resolveTasksPreferences } from "@fokuna/domain";
import { Button, Callout, PageHeader, Switch, TabBar } from "@fokuna/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { apiGet, apiSend } from "@/lib/api";
import styles from "./settings-view.module.css";

type SettingsTab =
  | "general"
  | "tasks"
  | "calendar"
  | "account"
  | "billing"
  | "notifications"
  | "focus";

interface Integration {
  id: string;
  provider: "google_calendar" | "microsoft_calendar";
  status: string;
  lastError: string | null;
  lastSyncedAt: string | null;
}

const tabs: Array<{ value: SettingsTab; label: string }> = [
  { value: "general", label: "Allgemein" },
  { value: "tasks", label: "Aufgaben" },
  { value: "calendar", label: "Kalender" },
  { value: "account", label: "Account" },
  { value: "billing", label: "Abrechnung" },
  { value: "notifications", label: "Benachrichtigungen" },
  { value: "focus", label: "Fokusmodus" },
];

export function SettingsView() {
  const [tab, setTab] = useState<SettingsTab>("general");
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiGet<UserProfileDto>("/api/v1/profile"),
  });

  const tasksPrefs = resolveTasksPreferences(profileQuery.data?.uiPreferences);

  const updateProfile = useMutation({
    mutationFn: (payload: { tasks: { completeAnimations: boolean } }) =>
      apiSend<UserProfileDto>("/api/v1/profile", "PATCH", payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["profile"] });
      const previous = queryClient.getQueryData<UserProfileDto>(["profile"]);
      if (previous) {
        queryClient.setQueryData<UserProfileDto>(["profile"], {
          ...previous,
          uiPreferences: {
            ...previous.uiPreferences,
            tasks: {
              ...resolveTasksPreferences(previous.uiPreferences),
              ...payload.tasks,
            },
          },
        });
      }
      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["profile"], context.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const integrationsQuery = useQuery({
    queryKey: ["integrations"],
    queryFn: () => apiGet<Integration[]>("/api/v1/integrations"),
  });

  const integrationMutation = useMutation({
    mutationFn: (payload: {
      provider: "google_calendar" | "microsoft_calendar";
      action: "connect" | "disconnect";
    }) => apiSend("/api/v1/integrations", "POST", payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
  });

  return (
    <div className={styles.page}>
      <PageHeader title="Einstellungen" />
      <TabBar items={tabs} onValueChange={(value) => setTab(value as SettingsTab)} value={tab} />

      {tab === "general" ? (
        <section className={styles.section}>
          <h2>Allgemein</h2>
          <p>Zeitzone Europe/Berlin, Sprache Deutsch — gespeichert im User-Profile-Schema.</p>
          <label className={styles.row}>
            <span>Wochenstart Montag</span>
            <Switch defaultChecked />
          </label>
        </section>
      ) : null}

      {tab === "tasks" ? (
        <section className={styles.section}>
          <h2>Aufgaben</h2>
          <p>Darstellung und Verhalten der Aufgabenliste — gespeichert im Account.</p>
          <label className={styles.row}>
            <span className={styles.rowCopy}>
              <strong>Animation beim Erledigen</strong>
              <small>
                Bewegte Übergänge beim Abhaken (Durchstreichen, Ausblenden). Erledigte Aufgaben sehen
                immer gleich aus — Farbe, Strikethrough und abgeschwächte Meta. Aus = sofort der
                Endzustand, ohne Animation.
              </small>
            </span>
            <Switch
              checked={tasksPrefs.completeAnimations}
              disabled={profileQuery.isLoading || updateProfile.isPending}
              onCheckedChange={(checked) =>
                updateProfile.mutate({ tasks: { completeAnimations: checked } })
              }
            />
          </label>
        </section>
      ) : null}

      {tab === "calendar" ? (
        <section className={styles.section}>
          <h2>Kalender-Integrationen</h2>
          <Callout title="Zwei-Wege-Sync" tone="info">
            OAuth-Tokens werden serverseitig verschlüsselt. Sync nutzt Cursor/Delta und zeigt
            Reconnect-Zustände.
          </Callout>
          {(integrationsQuery.data ?? []).map((integration) => (
            <div className={styles.integration} key={integration.id}>
              <div>
                <strong>
                  {integration.provider === "google_calendar" ? "Google Calendar" : "Microsoft 365"}
                </strong>
                <p>Status: {integration.status}</p>
              </div>
              <Button
                onClick={() =>
                  integrationMutation.mutate({
                    provider: integration.provider,
                    action: integration.status === "connected" ? "disconnect" : "connect",
                  })
                }
                size="md"
                type="button"
              >
                {integration.status === "connected" ? "Trennen" : "Verbinden"}
              </Button>
            </div>
          ))}
        </section>
      ) : null}

      {tab === "account" ? (
        <section className={styles.section}>
          <h2>Account</h2>
          <p>E-Mail, Passwort-Reset und Sessionverwaltung über Better Auth / Demo-Auth.</p>
          <Button
            intent="tertiary"
            onClick={async () => {
              await fetch("/api/auth/demo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "sign-out" }),
              });
              window.location.href = "/login";
            }}
            size="md"
            type="button"
          >
            Abmelden
          </Button>
        </section>
      ) : null}

      {tab === "billing" ? (
        <section className={styles.section}>
          <h2>Abrechnung</h2>
          <p>
            Stripe Checkout/Portal und Webhook-Endpunkt `/api/v1/billing/webhook` sind vorbereitet.
            Pricing/Entitlements folgen der PO-Entscheidung.
          </p>
          <Button disabled size="md" type="button">
            Customer Portal öffnen
          </Button>
        </section>
      ) : null}

      {tab === "notifications" ? (
        <section className={styles.section}>
          <h2>Benachrichtigungen</h2>
          <label className={styles.row}>
            <span>Tägliche Planungserinnerung</span>
            <Switch />
          </label>
          <label className={styles.row}>
            <span>Journal Check-out Reminder</span>
            <Switch defaultChecked />
          </label>
        </section>
      ) : null}

      {tab === "focus" ? (
        <section className={styles.section}>
          <h2>Fokusmodus</h2>
          <label className={styles.row}>
            <span>Standarddauer 25 Minuten</span>
            <Switch defaultChecked />
          </label>
          <label className={styles.row}>
            <span>Session nach Reload wiederherstellen</span>
            <Switch defaultChecked />
          </label>
        </section>
      ) : null}
    </div>
  );
}
