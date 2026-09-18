import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../api/client";
import { useAction } from "../hooks/useAction";
import { Workspace } from "../components/Workspace";
import { Panel } from "../components/Panel";
import { Notice } from "../components/Notice";
import type { LabOrderView, LabResultRequest, LabResultResponse } from "../api/types";

function ResultForm({ visitId, itemId, testName, onRecorded }: { visitId: number; itemId: number; testName: string; onRecorded: () => void }) {
  const { session } = useAuth();
  const [form, setForm] = useState({ resultValue: "", normalRange: "", remarks: "" });
  const action = useAction((body: LabResultRequest) =>
    apiFetch<LabResultResponse>(session!, `/api/visits/${visitId}/lab-order-items/${itemId}/result`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    action
      .run({ resultValue: form.resultValue, normalRange: form.normalRange || undefined, remarks: form.remarks || undefined })
      .then(() => onRecorded())
      .catch(() => {});
  }

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <label>
        {testName} — result value
        <input value={form.resultValue} onChange={(e) => setForm({ ...form, resultValue: e.target.value })} required />
      </label>
      <label>
        Normal range
        <input value={form.normalRange} onChange={(e) => setForm({ ...form, normalRange: e.target.value })} />
      </label>
      <label>
        Remarks
        <input value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
      </label>
      <button type="submit" disabled={action.loading}>
        {action.loading ? "Saving…" : "Record result"}
      </button>
      {action.error && <Notice kind="error">{action.error}</Notice>}
    </form>
  );
}

export function LabPage() {
  const { session } = useAuth();
  const [visitId, setVisitId] = useState("");
  const vid = Number(visitId);
  const order = useAction(() => apiFetch<LabOrderView>(session!, `/api/visits/${vid}/lab-order`));

  return (
    <Workspace title="Lab">
      <Panel title="Lab order">
        <form
          className="inline-form"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            order.run().catch(() => {});
          }}
        >
          <label>
            Visit ID
            <input type="number" value={visitId} onChange={(e) => setVisitId(e.target.value)} required />
          </label>
          <button type="submit" disabled={order.loading}>
            {order.loading ? "Loading…" : "Load lab order"}
          </button>
        </form>
        {order.error && <Notice kind="error">{order.error}</Notice>}
        {order.result && (
          <p className="meta">
            Visit status: <span className="badge">{order.result.status}</span>
          </p>
        )}
      </Panel>

      {order.result && (
        <div className="panel-row">
          {order.result.items.map((item) => (
            <Panel key={item.itemId} title={item.recorded ? `${item.testName} — recorded` : item.testName}>
              {item.recorded ? (
                <p className="meta">Result: {item.resultValue}</p>
              ) : (
                <ResultForm visitId={vid} itemId={item.itemId} testName={item.testName} onRecorded={() => order.run().catch(() => {})} />
              )}
            </Panel>
          ))}
        </div>
      )}
    </Workspace>
  );
}
