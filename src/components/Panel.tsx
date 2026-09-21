import type { ReactNode } from "react";
import { slugify } from "../lib/slug";

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel" id={slugify(title)}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
