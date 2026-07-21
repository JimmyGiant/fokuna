"use client";

import { InsightCard, PageHeader } from "@fokuna/ui";
import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/lib/api";
import styles from "./insights-view.module.css";

interface InsightsPayload {
  cards: Array<{ id: string; title: string; value: string; hint: string }>;
}

export function InsightsView() {
  const insightsQuery = useQuery({
    queryKey: ["insights"],
    queryFn: () => apiGet<InsightsPayload>("/api/v1/insights"),
  });

  const cards = insightsQuery.data?.cards ?? [];

  return (
    <div className={styles.page}>
      <PageHeader
        subtitle="Aussagen statt dekorativer Zahlen — jede Karte hat einen Metrikvertrag."
        title="Insights"
      />
      {cards.every((card) => card.value === "0" || card.value === "—") ? (
        <p className={styles.empty}>
          Noch zu wenig Daten für belastbare Muster. Plane Tasks, starte Fokus und halte dein
          Journal — Insights wachsen mit deiner Aktivität.
        </p>
      ) : null}
      <div className={styles.grid}>
        {cards.map((card) => (
          <InsightCard icon="trending" key={card.id} subtitle={card.hint} title={card.title}>
            <strong className={styles.value}>{card.value}</strong>
          </InsightCard>
        ))}
      </div>
    </div>
  );
}
