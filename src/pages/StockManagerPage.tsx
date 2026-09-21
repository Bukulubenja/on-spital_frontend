import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../api/client";
import { useAction } from "../hooks/useAction";
import { Workspace } from "../components/Workspace";
import { Panel } from "../components/Panel";
import { Notice } from "../components/Notice";
import type { AdjustStockRequest, DrugStockDetailView, ReceiveStockRequest, StockDashboardView } from "../api/types";

function DashboardPanel() {
  const { session } = useAuth();
  const action = useAction(() => apiFetch<StockDashboardView>(session!, "/api/stock/dashboard"));

  return (
    <Panel title="Stock dashboard">
      <button onClick={() => action.run().catch(() => {})} disabled={action.loading}>
        {action.loading ? "Loading…" : "Refresh"}
      </button>
      {action.error && <Notice kind="error">{action.error}</Notice>}
      {action.result && (
        <>
          <p className="meta">
            Expiring soon: {action.result.expiringSoonCount} — Expired: {action.result.expiredCount}
          </p>
          <div className="item-list">
            {action.result.drugs.map((d) => (
              <div className="item-row" key={d.drugId}>
                <span>
                  #{d.drugId} {d.name} ({d.strength})
                </span>
                <span className="meta">
                  {d.category} — qty {d.totalQuantity}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Panel>
  );
}

function DrugDetailPanel() {
  const { session } = useAuth();
  const [drugId, setDrugId] = useState("");
  const did = Number(drugId);
  const detail = useAction(() => apiFetch<DrugStockDetailView>(session!, `/api/drugs/${did}/stock`));

  const [receive, setReceive] = useState({ batchNumber: "", quantity: "", expiryDate: "" });
  const receiveAction = useAction((body: ReceiveStockRequest) =>
    apiFetch<void>(session!, `/api/drugs/${did}/stock/receive`, { method: "POST", body: JSON.stringify(body) }),
  );

  const [adjust, setAdjust] = useState({ batchId: "", quantity: "", reason: "" });
  const adjustAction = useAction((body: AdjustStockRequest) =>
    apiFetch<void>(session!, `/api/drugs/${did}/stock/adjust`, { method: "POST", body: JSON.stringify(body) }),
  );

  return (
    <>
      <Panel title="Drug stock detail">
        <form
          className="inline-form"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            detail.run().catch(() => {});
          }}
        >
          <label>
            Drug ID
            <input type="number" value={drugId} onChange={(e) => setDrugId(e.target.value)} required />
          </label>
          <button type="submit" disabled={detail.loading}>
            {detail.loading ? "Loading…" : "Load"}
          </button>
        </form>
        {detail.error && <Notice kind="error">{detail.error}</Notice>}
        {detail.result && (
          <div className="item-list">
            {detail.result.batches.map((b) => (
              <div className="item-row" key={b.stockId}>
                <span>
                  {b.batchNumber} — qty {b.quantity}
                </span>
                <span className="meta">
                  expires {b.expiryDate} <span className="badge">{b.status}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <div className="panel-row">
        <Panel title="Receive stock">
          <form
            className="inline-form"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              receiveAction
                .run({ batchNumber: receive.batchNumber, quantity: Number(receive.quantity), expiryDate: receive.expiryDate })
                .then(() => detail.run())
                .catch(() => {});
            }}
          >
            <label>
              Batch number
              <input value={receive.batchNumber} onChange={(e) => setReceive({ ...receive, batchNumber: e.target.value })} required />
            </label>
            <label>
              Quantity
              <input type="number" min={1} value={receive.quantity} onChange={(e) => setReceive({ ...receive, quantity: e.target.value })} required />
            </label>
            <label>
              Expiry date (must be in the future)
              <input type="date" value={receive.expiryDate} onChange={(e) => setReceive({ ...receive, expiryDate: e.target.value })} required />
            </label>
            <button type="submit" disabled={!drugId || receiveAction.loading}>
              {receiveAction.loading ? "Receiving…" : "Receive stock"}
            </button>
            {receiveAction.error && <Notice kind="error">{receiveAction.error}</Notice>}
            {receiveAction.succeeded && <Notice kind="success">Stock received.</Notice>}
          </form>
        </Panel>

        <Panel title="Adjust stock (write off)">
          <form
            className="inline-form"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              adjustAction
                .run({ batchId: Number(adjust.batchId), quantity: Number(adjust.quantity), reason: adjust.reason })
                .then(() => detail.run())
                .catch(() => {});
            }}
          >
            <label>
              Batch (stock) ID
              <input type="number" value={adjust.batchId} onChange={(e) => setAdjust({ ...adjust, batchId: e.target.value })} required />
            </label>
            <label>
              Quantity to remove
              <input type="number" min={1} value={adjust.quantity} onChange={(e) => setAdjust({ ...adjust, quantity: e.target.value })} required />
            </label>
            <label>
              Reason
              <input value={adjust.reason} onChange={(e) => setAdjust({ ...adjust, reason: e.target.value })} required />
            </label>
            <button type="submit" disabled={!drugId || adjustAction.loading}>
              {adjustAction.loading ? "Adjusting…" : "Adjust stock"}
            </button>
            {adjustAction.error && <Notice kind="error">{adjustAction.error}</Notice>}
            {adjustAction.succeeded && <Notice kind="success">Stock adjusted.</Notice>}
          </form>
        </Panel>
      </div>
    </>
  );
}

export function StockManagerPage() {
  return (
    <Workspace title="Stock Manager" sections={["Stock dashboard", "Drug stock detail", "Receive stock", "Adjust stock (write off)"]}>
      <DashboardPanel />
      <DrugDetailPanel />
    </Workspace>
  );
}
