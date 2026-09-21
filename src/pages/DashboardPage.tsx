import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiFetch, ApiError } from "../api/client";
import { Workspace } from "../components/Workspace";
import { Panel } from "../components/Panel";
import type { AdminDashboard } from "../api/types";

const ICON_PATHS: Record<string, string> = {
  people: "M10 10a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM3.5 16c.6-3 3-5 6.5-5s5.9 2 6.5 5",
  calendar: "M3.5 5h13v11.5h-13V5Zm0 3.5h13M7 3v3M13 3v3",
  pulse: "M2.5 10h3l1.8-4.5 2.8 9 2-6 1.4 3h3.5",
  cash: "M2.5 6h15v8h-15V6Zm7.5 1.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM5 6.2v.1M15 13.7v.1",
  alert: "M10 3 2.5 17h15L10 3Zm0 5.5v4M10 14.5v.1",
  box: "M2.5 6.5 10 3l7.5 3.5L10 10l-7.5-3.5ZM2.5 6.5V14L10 17l7.5-3V6.5M10 10v7",
};

function iconFor(label: string): keyof typeof ICON_PATHS {
  const l = label.toLowerCase();
  if (l.includes("revenue") || l.includes("balance")) return l.includes("balance") ? "alert" : "cash";
  if (l.includes("appointment")) return "calendar";
  if (l.includes("visit")) return "pulse";
  if (l.includes("stock") || l.includes("drug")) return "box";
  return "people";
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat-tile">
      <span className="stat-icon">
        <svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d={ICON_PATHS[iconFor(label)]} />
        </svg>
      </span>
      <span>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </span>
    </div>
  );
}

export function DashboardPage() {
  const { session, logout } = useAuth();
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    apiFetch<AdminDashboard>(session, "/api/admin/dashboard")
      .then(setData)
      .catch((err) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          logout();
          return;
        }
        setError("Could not load the dashboard.");
      });
  }, [session, logout]);

  return (
    <Workspace title="Admin" sections={["Overview", "Recent patients", "Recent payments"]}>
      {error && <p className="error">{error}</p>}
      {!error && !data && <p>Loading…</p>}
      {data && (
        <>
          <section className="stat-grid" id="overview">
            <StatTile label="Total patients" value={data.totalPatients} />
            <StatTile label="Today's appointments" value={data.todaysAppointments} />
            <StatTile label="Active visits" value={data.activeVisits} />
            <StatTile label="Today's revenue" value={data.todaysRevenue} />
            <StatTile label="Outstanding balance" value={data.outstandingBalance} />
            <StatTile label="Low stock drugs" value={data.lowStockDrugs} />
            <StatTile label="Total staff" value={data.totalStaff} />
          </section>

          <Panel title="Recent patients">
            {data.recentPatients.length === 0 ? (
              <p className="empty-state">No patients registered yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Patient #</th>
                    <th>Name</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentPatients.map((p) => (
                    <tr key={p.id}>
                      <td>{p.patientNumber}</td>
                      <td>{p.fullName}</td>
                      <td>{new Date(p.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>

          <Panel title="Recent payments">
            {data.recentPayments.length === 0 ? (
              <p className="empty-state">No payments recorded yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Receipt #</th>
                    <th>Patient</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentPayments.map((p) => (
                    <tr key={p.id}>
                      <td>{p.receiptNumber}</td>
                      <td>{p.patientName}</td>
                      <td className="tabular">{p.amountPaid.toFixed(2)}</td>
                      <td>{new Date(p.paymentDate).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>
        </>
      )}
    </Workspace>
  );
}
