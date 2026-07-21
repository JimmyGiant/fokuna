export const priorityOptions = [
  { value: "urgent" as const, label: "Hoch", color: "var(--fk-color-task-priority-urgent)" },
  { value: "medium" as const, label: "Mittel", color: "var(--fk-color-task-priority-medium)" },
  { value: "low" as const, label: "Niedrig", color: "var(--fk-color-task-priority-low)" },
  { value: "none" as const, label: "Keine", color: "var(--fk-color-icon-tertiary)" },
];

export const estimateOptions = [
  { value: "30", label: "30 Min" },
  { value: "60", label: "1:00 Std" },
  { value: "90", label: "1:30 Std" },
  { value: "120", label: "2:00 Std" },
  { value: "180", label: "3 Std" },
  { value: "240", label: "4 Std" },
];

export function estimateLabel(minutes: number | null | undefined): string | undefined {
  if (!minutes) return undefined;
  const match = estimateOptions.find((option) => Number(option.value) === minutes);
  if (match) return match.label;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${minutes} Min`;
  if (rest === 0) return `${hours}:00 Std`;
  return `${hours}:${String(rest).padStart(2, "0")} Std`;
}
