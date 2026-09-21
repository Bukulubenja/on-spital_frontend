import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../api/client";
import { useAction } from "../hooks/useAction";
import { Workspace } from "../components/Workspace";
import { Panel } from "../components/Panel";
import { Notice } from "../components/Notice";
import { Badge } from "../components/Badge";
import type { DispenseResponse, PrescriptionView } from "../api/types";

export function PharmacyPage() {
  const { session } = useAuth();
  const [visitId, setVisitId] = useState("");
  const vid = Number(visitId);
  const prescription = useAction(() => apiFetch<PrescriptionView>(session!, `/api/visits/${vid}/prescription`));
  const dispense = useAction((itemId: number) =>
    apiFetch<DispenseResponse>(session!, `/api/visits/${vid}/prescription-items/${itemId}/dispense`, { method: "POST" }),
  );

  return (
    <Workspace title="Pharmacy" sections={["Prescription", "Items"]}>
      <Panel title="Prescription">
        <form
          className="inline-form"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            prescription.run().catch(() => {});
          }}
        >
          <label>
            Visit ID
            <input type="number" value={visitId} onChange={(e) => setVisitId(e.target.value)} required />
          </label>
          <button type="submit" className="button-secondary" disabled={prescription.loading}>
            {prescription.loading ? "Loading…" : "Load prescription"}
          </button>
        </form>
        {prescription.error && <Notice kind="error">{prescription.error}</Notice>}
        {prescription.result && !prescription.result.canDispense && (
          <Notice kind="error">This visit's balance isn't settled yet — dispensing is blocked.</Notice>
        )}
      </Panel>

      {prescription.result && (
        <Panel title="Items">
          <div className="item-list">
            {prescription.result.items.map((item) => (
              <div className="item-row" key={item.itemId}>
                <span>
                  {item.drugName} × {item.quantity} — {item.dosage}, {item.frequency}, {item.duration}
                </span>
                <span className="meta">
                  stock: {item.availableStock}{" "}
                  {item.dispensed ? (
                    <Badge tone="success">Dispensed</Badge>
                  ) : (
                    <button
                      disabled={!prescription.result!.canDispense || dispense.loading}
                      onClick={() => dispense.run(item.itemId).then(() => prescription.run()).catch(() => {})}
                    >
                      Dispense
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
          {dispense.error && <Notice kind="error">{dispense.error}</Notice>}
          {dispense.result && (
            <Notice kind="success">
              {dispense.result.drugName} × {dispense.result.quantity}
              {dispense.result.alreadyDispensed ? " (already dispensed)" : " — dispensed"} — visit status {dispense.result.visitStatus}
            </Notice>
          )}
        </Panel>
      )}
    </Workspace>
  );
}
