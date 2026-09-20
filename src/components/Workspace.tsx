import type { ReactNode } from "react";
import { useAuth } from "../auth/AuthContext";

export function Workspace({ title, children }: { title: string; children: ReactNode }) {
  const { session, logout } = useAuth();
  return (
    <>
      <header className="topbar">
        <span className="identity">
          <b>{title}</b> — {session?.username} ({session?.role}){session?.subdomain ? ` @ ${session.subdomain}` : ""}
        </span>
        <button onClick={logout}>Sign out</button>
      </header>
      <div className="workspace">{children}</div>
    </>
  );
}
