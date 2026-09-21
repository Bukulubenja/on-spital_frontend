import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../api/client";
import { useAction } from "../hooks/useAction";
import { Workspace } from "../components/Workspace";
import { Panel } from "../components/Panel";
import { Notice } from "../components/Notice";
import { Badge } from "../components/Badge";
import type { CreateHospitalRequest, Hospital } from "../api/types";

function HospitalsPanel() {
  const { session } = useAuth();
  const list = useAction(() => apiFetch<Hospital[]>(session!, "/api/platform/hospitals"));
  const toggle = useAction((hospital: Hospital) =>
    apiFetch<Hospital>(session!, `/api/platform/hospitals/${hospital.id}/${hospital.active ? "deactivate" : "activate"}`, {
      method: "POST",
    }),
  );

  useEffect(() => {
    list.run().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Panel title="Hospitals">
      <button className="button-secondary" onClick={() => list.run().catch(() => {})} disabled={list.loading}>
        {list.loading ? "Loading…" : "Refresh"}
      </button>
      {list.error && <Notice kind="error">{list.error}</Notice>}
      {toggle.error && <Notice kind="error">{toggle.error}</Notice>}
      {list.result && (
        <div className="item-list">
          {list.result.map((h) => (
            <div className="item-row" key={h.id}>
              <span>
                {h.name} <span className="meta">({h.subdomain})</span>
              </span>
              <span className="meta">
                <Badge tone={h.active ? "success" : "neutral"}>{h.active ? "Active" : "Inactive"}</Badge>{" "}
                <button
                  className={h.active ? "button-danger" : undefined}
                  disabled={toggle.loading}
                  onClick={() => toggle.run(h).then(() => list.run()).catch(() => {})}
                >
                  {h.active ? "Deactivate" : "Activate"}
                </button>
              </span>
            </div>
          ))}
          {list.result.length === 0 && <p className="meta">No hospitals yet.</p>}
        </div>
      )}
    </Panel>
  );
}

function AddHospitalPanel({ onCreated }: { onCreated: () => void }) {
  const { session } = useAuth();
  const [form, setForm] = useState({ name: "", subdomain: "" });
  const create = useAction((body: CreateHospitalRequest) =>
    apiFetch<Hospital>(session!, "/api/platform/hospitals", { method: "POST", body: JSON.stringify(body) }),
  );

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    create
      .run({ name: form.name, subdomain: form.subdomain })
      .then(() => {
        setForm({ name: "", subdomain: "" });
        onCreated();
      })
      .catch(() => {});
  }

  return (
    <Panel title="Add a hospital">
      <form className="inline-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>
          Subdomain
          <input
            value={form.subdomain}
            onChange={(e) => setForm({ ...form, subdomain: e.target.value.toLowerCase() })}
            pattern="[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?"
            title="lowercase letters, digits, and hyphens; can't start or end with a hyphen"
            required
          />
        </label>
        <button type="submit" disabled={create.loading}>
          {create.loading ? "Adding…" : "Add hospital"}
        </button>
        {create.error && <Notice kind="error">{create.error}</Notice>}
        {create.succeeded && <Notice kind="success">Hospital added.</Notice>}
      </form>
    </Panel>
  );
}

export function DeveloperPage() {
  // Bumping this key remounts HospitalsPanel, which re-fetches on mount —
  // simplest way to refresh the list after a create without lifting a
  // second "list" action up just to share it between the two panels.
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <Workspace title="Developer" sections={["Add a hospital", "Hospitals"]}>
      <AddHospitalPanel onCreated={() => setRefreshKey((k) => k + 1)} />
      <HospitalsPanel key={refreshKey} />
    </Workspace>
  );
}
