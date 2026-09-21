export type Tone = "success" | "warning" | "danger" | "neutral";

const SUCCESS_WORDS = ["completed", "paid", "active", "served", "dispensed", "fresh", "confirmed", "recorded", "resolved"];
const WARNING_WORDS = ["pending", "in_progress", "in progress", "expiring_soon", "expiring soon", "waiting", "partial", "unassigned"];
const DANGER_WORDS = ["expired", "cancelled", "canceled", "failed", "void", "overdue", "no_show", "no show", "rejected"];

export function statusTone(label: string): Tone {
  const l = label.toLowerCase();
  if (DANGER_WORDS.some((w) => l.includes(w))) return "danger";
  if (WARNING_WORDS.some((w) => l.includes(w))) return "warning";
  if (SUCCESS_WORDS.some((w) => l.includes(w))) return "success";
  return "neutral";
}
