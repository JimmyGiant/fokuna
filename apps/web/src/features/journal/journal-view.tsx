"use client";

import { todayIsoDateString } from "@fokuna/domain";
import { Button, InputGroup, PageHeader, TabBar, TemplateCard } from "@fokuna/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { apiGet, apiSend } from "@/lib/api";
import styles from "./journal-view.module.css";

interface JournalTemplate {
  id: string;
  title: string;
  description: string | null;
  isDefault: boolean;
  checkInElements: unknown[];
  checkOutElements: unknown[];
}

export function JournalView() {
  const [kind, setKind] = useState<"check_in" | "check_out">("check_in");
  const [answer, setAnswer] = useState("");
  const queryClient = useQueryClient();

  const templatesQuery = useQuery({
    queryKey: ["journal-templates"],
    queryFn: () => apiGet<JournalTemplate[]>("/api/v1/journal/templates"),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      apiSend("/api/v1/journal/entries", "POST", {
        kind,
        entryDate: todayIsoDateString(),
        templateId: templatesQuery.data?.[0]?.id,
        answers: { focus: answer },
        mood: 4,
        energy: 3,
      }),
    onSuccess: async () => {
      setAnswer("");
      await queryClient.invalidateQueries({ queryKey: ["journal-templates"] });
    },
  });

  return (
    <div className={styles.page}>
      <PageHeader title="Journal" />
      <TabBar
        items={[
          { value: "check_in", label: "Check-in" },
          { value: "check_out", label: "Check-out" },
        ]}
        onValueChange={(value) => setKind(value as "check_in" | "check_out")}
        value={kind}
      />

      <section className={styles.entry}>
        <h2>{kind === "check_in" ? "Was ist heute wichtig?" : "Was nimmst du mit?"}</h2>
        <InputGroup
          controlSize="xl"
          label={kind === "check_in" ? "Absicht" : "Reflexion"}
          onChange={(event) => setAnswer(event.target.value)}
          value={answer}
        />
        <Button onClick={() => saveMutation.mutate()} size="lg" type="button">
          Speichern
        </Button>
      </section>

      <section className={styles.templates}>
        <h2>Templates</h2>
        <div className={styles.grid}>
          {(templatesQuery.data ?? []).map((template) => (
            <TemplateCard
              description={template.description ?? undefined}
              key={template.id}
              meta={[
                {
                  id: "elements",
                  label: `${template.checkInElements.length + template.checkOutElements.length} Elemente`,
                },
              ]}
              title={template.title}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
