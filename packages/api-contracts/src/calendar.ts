import { z } from "zod";

export const calendarEntrySourceSchema = z.enum(["task", "block", "manual", "google", "microsoft"]);

export const calendarEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  source: calendarEntrySourceSchema,
  taskId: z.string().nullable(),
  blockId: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  startsAt: z.string(),
  endsAt: z.string(),
  allDay: z.boolean(),
  timezone: z.string(),
  recurrenceRule: z.string().nullable(),
});

export const createCalendarEntryInputSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(5000).optional(),
    source: calendarEntrySourceSchema.default("manual"),
    taskId: z.string().optional(),
    blockId: z.string().optional(),
    startsAt: z.string().datetime({ offset: true }),
    endsAt: z.string().datetime({ offset: true }),
    allDay: z.boolean().default(false),
    timezone: z.string().default("Europe/Berlin"),
  })
  .refine((value) => new Date(value.endsAt) > new Date(value.startsAt), {
    message: "endsAt must be after startsAt",
    path: ["endsAt"],
  });

export const moveCalendarEntryInputSchema = z
  .object({
    startsAt: z.string().datetime({ offset: true }),
    endsAt: z.string().datetime({ offset: true }),
  })
  .refine((value) => new Date(value.endsAt) > new Date(value.startsAt), {
    message: "endsAt must be after startsAt",
    path: ["endsAt"],
  });

export type CalendarEntryDto = z.infer<typeof calendarEntrySchema>;
export type CreateCalendarEntryInput = z.infer<typeof createCalendarEntryInputSchema>;
