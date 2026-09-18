import type { ReactNode } from "react";

export function Notice({ kind, children }: { kind: "error" | "success"; children: ReactNode }) {
  return <p className={kind === "error" ? "error" : "success"}>{children}</p>;
}
