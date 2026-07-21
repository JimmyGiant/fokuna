"use client";

import type { CalendarEntryDto } from "@fokuna/api-contracts";
import { Button, CalendarItem, PageHeader } from "@fokuna/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { DateTime } from "luxon";
import { useMemo } from "react";

import { apiGet, apiSend } from "@/lib/api";
import styles from "./calendar-view.module.css";

export function CalendarView() {
  const queryClient = useQueryClient();
  const entriesQuery = useQuery({
    queryKey: ["calendar-entries"],
    queryFn: () => apiGet<CalendarEntryDto[]>("/api/v1/calendar/entries"),
  });

  const createMutation = useMutation({
    mutationFn: () => {
      const startsAt = DateTime.now().setZone("Europe/Berlin").startOf("hour").plus({ hours: 1 });
      const starts = startsAt.toISO();
      const ends = startsAt.plus({ minutes: 50 }).toISO();
      if (!starts || !ends) {
        throw new Error("Invalid datetime");
      }
      return apiSend<CalendarEntryDto>("/api/v1/calendar/entries", "POST", {
        title: "Geplanter Block",
        source: "manual",
        startsAt: starts,
        endsAt: ends,
        timezone: "Europe/Berlin",
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["calendar-entries"] });
    },
  });

  const moveMutation = useMutation({
    mutationFn: (payload: { id: string; startsAt: string; endsAt: string }) =>
      apiSend(`/api/v1/calendar/entries/${payload.id}`, "PATCH", {
        startsAt: payload.startsAt,
        endsAt: payload.endsAt,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["calendar-entries"] });
    },
  });

  const events = useMemo(
    () =>
      (entriesQuery.data ?? []).map((entry) => ({
        id: entry.id,
        title: entry.title,
        start: entry.startsAt,
        end: entry.endsAt,
        allDay: entry.allDay,
        extendedProps: { source: entry.source },
      })),
    [entriesQuery.data],
  );

  return (
    <div className={styles.page}>
      <PageHeader
        actions={
          <Button onClick={() => createMutation.mutate()} size="md" type="button">
            Eintrag planen
          </Button>
        }
        title="Kalender"
        variant="calendar"
      />

      <div className={styles.layout}>
        <div className={styles.calendar}>
          <FullCalendar
            editable
            eventDrop={(info) => {
              const startsAt = info.event.start?.toISOString();
              const endsAt = info.event.end?.toISOString() ?? startsAt;
              if (!startsAt || !endsAt) return;
              moveMutation.mutate({ id: info.event.id, startsAt, endsAt });
            }}
            eventResize={(info) => {
              const startsAt = info.event.start?.toISOString();
              const endsAt = info.event.end?.toISOString() ?? startsAt;
              if (!startsAt || !endsAt) return;
              moveMutation.mutate({ id: info.event.id, startsAt, endsAt });
            }}
            events={events}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "timeGridDay,timeGridWeek,dayGridMonth",
            }}
            height="auto"
            initialView="timeGridWeek"
            locale="de"
            nowIndicator
            plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
            slotMinTime="06:00:00"
          />
        </div>
        <aside className={styles.drawer}>
          <h2>Geplant</h2>
          {(entriesQuery.data ?? []).slice(0, 5).map((entry) => (
            <CalendarItem
              kind={entry.source === "task" ? "task" : "block"}
              key={entry.id}
              meta={entry.timezone}
              time={DateTime.fromISO(entry.startsAt).setZone(entry.timezone).toFormat("HH:mm")}
              title={entry.title}
            />
          ))}
        </aside>
      </div>
    </div>
  );
}
