import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiFetch, ApiError } from "../api/client";
import type { AdminDashboard } from "../api/types";

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat-tile">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
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

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard — {session?.subdomain}</h1>
        <button onClick={logout}>Sign out</button>
      </header>

      <section className="stat-grid">
        <StatTile label="Total patients" value={data.totalPatients} />
        <StatTile label="Today's appointments" value={data.todaysAppointments} />
        <StatTile label="Active visits" value={data.activeVisits} />
        <StatTile label="Today's revenue" value={data.todaysRevenue} />
        <StatTile label="Outstanding balance" value={data.outstandingBalance} />
        <StatTile label="Low stock drugs" value={data.lowStockDrugs} />
        <StatTile label="Total staff" value={data.totalStaff} />
      </section>

      <section>
        <h2>Recent patients</h2>
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
      </section>

      <section>
        <h2>Recent payments</h2>
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
                <td>{p.amountPaid.toFixed(2)}</td>
                <td>{new Date(p.paymentDate).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
