import type { ReactNode } from "react";
import { statusTone, type Tone } from "../lib/statusTone";

export function Badge({ tone, children }: { tone?: Tone; children: ReactNode }) {
  const resolved = tone ?? statusTone(String(children));
  return <span className={`badge badge-${resolved}`}>{children}</span>;
}
