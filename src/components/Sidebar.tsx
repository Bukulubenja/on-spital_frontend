import { useAuth } from "../auth/AuthContext";
import { slugify } from "../lib/slug";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  RECEPTIONIST: "Reception",
  DOCTOR: "Doctor",
  NURSE: "Nurse",
  LAB: "Lab",
  PHARMACIST: "Pharmacy",
  CASHIER: "Cashier",
  STOCK_MANAGER: "Stock Manager",
  PLATFORM_OPERATOR: "Platform",
};

function DashboardIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.4" />
      <rect x="11" y="2.5" width="6.5" height="6.5" rx="1.4" />
      <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.4" />
      <rect x="11" y="11" width="6.5" height="6.5" rx="1.4" />
    </svg>
  );
}

function SectionIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="3" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H4.5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1H8" />
      <path d="M13 14l4-4-4-4" />
      <path d="M17 10H7.5" />
    </svg>
  );
}

export function Sidebar({ sections }: { sections: string[] }) {
  const { session, logout } = useAuth();
  const roleLabel = session ? (ROLE_LABEL[session.role] ?? session.role) : "";

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">HMS</span>
        <span className="sidebar-tagline">Hospital Management System</span>
      </div>

      <nav className="sidebar-nav" aria-label="Sections">
        <a href="#top" className="sidebar-link sidebar-link-home">
          <DashboardIcon />
          <span>{roleLabel} Dashboard</span>
        </a>
        {sections.map((label) => (
          <a key={label} href={`#${slugify(label)}`} className="sidebar-link">
            <SectionIcon />
            <span>{label}</span>
          </a>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <span className="avatar">{session?.username.slice(0, 2).toUpperCase()}</span>
          <span className="sidebar-user-meta">
            <b>{session?.username}</b>
            <small>{roleLabel}{session?.subdomain ? ` · ${session.subdomain}` : ""}</small>
          </span>
        </div>
        <button className="sidebar-signout" onClick={logout}>
          <LogoutIcon />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
