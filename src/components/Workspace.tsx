import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

export function Workspace({
  title,
  sections = [],
  children,
}: {
  title: string;
  sections?: string[];
  children: ReactNode;
}) {
  return (
    <div className="app-shell">
      <Sidebar sections={sections} />
      <div className="app-main">
        <header className="topbar">
          <div className="breadcrumb">
            <span className="breadcrumb-role">{title.toUpperCase()}</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-page">Dashboard</span>
          </div>
        </header>
        <main className="workspace" id="top">
          {children}
        </main>
      </div>
    </div>
  );
}
