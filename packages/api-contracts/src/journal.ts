import { z } from "zod";

export const journalEntryKindSchema = z.enum(["check_in", "check_out"]);

export const journalTemplateSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  isDefault: z.boolean(),
  checkInElements: z.array(z.unknown()),
  checkOutElements: z.array(z.unknown()),
});

export const journalEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  templateId: z.string().nullable(),
  kind: journalEntryKindSchema,
  entryDate: z.string(),
  answers: z.record(z.string(), z.unknown()),
  mood: z.number().int().min(1).max(5).nullable(),
  energy: z.number().int().min(1).max(5).nullable(),
});

export const upsertJournalEntryInputSchema = z.object({
  kind: journalEntryKindSchema,
  entryDate: z.string().date(),
  templateId: z.string().optional(),
  answers: z.record(z.string(), z.unknown()).default({}),
  mood: z.number().int().min(1).max(5).optional(),
  energy: z.number().int().min(1).max(5).optional(),
});
