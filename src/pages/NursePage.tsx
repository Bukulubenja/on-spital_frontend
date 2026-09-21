import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../api/client";
import { useAction } from "../hooks/useAction";
import { Workspace } from "../components/Workspace";
import { Panel } from "../components/Panel";
import { Notice } from "../components/Notice";
import { Badge } from "../components/Badge";
import type { NurseQueueEntry, VitalsRequest } from "../api/types";

function QueuePanel({ onPick }: { onPick: (visitId: number) => void }) {
  const { session } = useAuth();
  const action = useAction(() => apiFetch<NurseQueueEntry[]>(session!, "/api/nurse/queue"));

  return (
    <Panel title="Triage queue">
      <button className="button-secondary" onClick={() => action.run().catch(() => {})} disabled={action.loading}>
        {action.loading ? "Loading…" : "Refresh"}
      </button>
      {action.error && <Notice kind="error">{action.error}</Notice>}
      {action.result && (
        <div className="item-list">
          {action.result.length === 0 && <p className="meta">No visits waiting on a doctor.</p>}
          {action.result.map((entry) => (
            <div className="item-row" key={entry.visitId}>
              <span>
                Visit #{entry.visitId} — {entry.patientName}
              </span>
              <span className="meta">
                Dr. {entry.doctorUsername ?? "unassigned"}
                {entry.hasVitals ? <Badge tone="success">Vitals recorded</Badge> : <button onClick={() => onPick(entry.visitId)}>Record vitals</button>}
              </span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function VitalsPanel({ visitId, setVisitId }: { visitId: string; setVisitId: (v: string) => void }) {
  const { session } = useAuth();
  const [vitals, setVitals] = useState({ temperature: "", pulseRate: "", bloodPressure: "", weight: "", height: "" });
  const action = useAction((id: number, body: VitalsRequest) =>
    apiFetch<void>(session!, `/api/visits/${id}/nurse-vitals`, { method: "POST", body: JSON.stringify(body) }),
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    action
      .run(Number(visitId), {
        temperature: Number(vitals.temperature),
        pulseRate: Number(vitals.pulseRate),
        bloodPressure: vitals.bloodPressure,
        weight: Number(vitals.weight),
        height: Number(vitals.height),
      })
      .catch(() => {});
  }

  return (
    <Panel title="Record vitals">
      <form className="inline-form" onSubmit={handleSubmit}>
        <label>
          Visit ID
          <input type="number" value={visitId} onChange={(e) => setVisitId(e.target.value)} required />
        </label>
        <label>
          Temperature (°C)
          <input type="number" step="0.1" value={vitals.temperature} onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })} required />
        </label>
        <label>
          Pulse rate (bpm)
          <input type="number" value={vitals.pulseRate} onChange={(e) => setVitals({ ...vitals, pulseRate: e.target.value })} required />
        </label>
        <label>
          Blood pressure
          <input placeholder="120/80" value={vitals.bloodPressure} onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })} required />
        </label>
        <label>
          Weight (kg)
          <input type="number" step="0.1" value={vitals.weight} onChange={(e) => setVitals({ ...vitals, weight: e.target.value })} required />
        </label>
        <label>
          Height (cm)
          <input type="number" step="0.1" value={vitals.height} onChange={(e) => setVitals({ ...vitals, height: e.target.value })} required />
        </label>
        <button type="submit" disabled={action.loading}>
          {action.loading ? "Saving…" : "Save vitals"}
        </button>
        {action.error && <Notice kind="error">{action.error}</Notice>}
        {action.succeeded && <Notice kind="success">Vitals recorded.</Notice>}
      </form>
    </Panel>
  );
}

export function NursePage() {
  const [visitId, setVisitId] = useState("");
  return (
    <Workspace title="Nurse" sections={["Triage queue", "Record vitals"]}>
      <div className="panel-row">
        <QueuePanel onPick={(id) => setVisitId(String(id))} />
        <VitalsPanel visitId={visitId} setVisitId={setVisitId} />
      </div>
    </Workspace>
  );
}
