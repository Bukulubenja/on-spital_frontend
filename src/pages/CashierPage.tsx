import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../api/client";
import { useAction } from "../hooks/useAction";
import { useLookup } from "../hooks/useLookup";
import { Workspace } from "../components/Workspace";
import { Panel } from "../components/Panel";
import { Notice } from "../components/Notice";
import { Badge } from "../components/Badge";
import type { InvoiceItemRequest, InvoiceView, PaymentMethod, PaymentRequest, PaymentResponse, ServiceSummary } from "../api/types";

export function CashierPage() {
  const { session } = useAuth();
  const [visitId, setVisitId] = useState("");
  const vid = Number(visitId);
  const invoice = useAction(() => apiFetch<InvoiceView>(session!, `/api/visits/${vid}/invoice`));
  const services = useLookup<ServiceSummary>("/api/services");

  const [item, setItem] = useState({ serviceId: "", quantity: "1" });
  const addItem = useAction((body: InvoiceItemRequest) =>
    apiFetch<void>(session!, `/api/visits/${vid}/invoice-items`, { method: "POST", body: JSON.stringify(body) }),
  );

  const [payment, setPayment] = useState({ amountPaid: "", method: "CASH" as PaymentMethod, reference: "" });
  const pay = useAction((body: PaymentRequest) =>
    apiFetch<PaymentResponse>(session!, `/api/visits/${vid}/payments`, { method: "POST", body: JSON.stringify(body) }),
  );

  return (
    <Workspace title="Cashier" sections={["Invoice", "Add invoice item", "Record payment"]}>
      <Panel title="Invoice">
        <form
          className="inline-form"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            invoice.run().catch(() => {});
          }}
        >
          <label>
            Visit ID
            <input type="number" value={visitId} onChange={(e) => setVisitId(e.target.value)} required />
          </label>
          <button type="submit" className="button-secondary" disabled={invoice.loading}>
            {invoice.loading ? "Loading…" : "Load invoice"}
          </button>
        </form>
        {invoice.error && <Notice kind="error">{invoice.error}</Notice>}
        {invoice.result && (
          <>
            <p className="meta">
              Total: {invoice.result.totalAmount.toFixed(2)} — Paid: {invoice.result.amountPaid.toFixed(2)} — Balance:{" "}
              {invoice.result.balanceDue.toFixed(2)} — <Badge>{invoice.result.status}</Badge>
            </p>
            <div className="item-list">
              {invoice.result.items.map((it) => (
                <div className="item-row" key={it.itemId}>
                  <span>
                    {it.serviceName} × {it.quantity}
                  </span>
                  <span className="meta">{it.subtotal.toFixed(2)}</span>
                </div>
              ))}
              {invoice.result.payments.map((p) => (
                <div className="item-row" key={p.receiptNumber}>
                  <span>{p.receiptNumber}</span>
                  <span className="meta">
                    {p.amountPaid.toFixed(2)} — {p.method}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </Panel>

      <div className="panel-row">
        <Panel title="Add invoice item">
          <form
            className="inline-form"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              addItem
                .run({ serviceId: Number(item.serviceId), quantity: Number(item.quantity) })
                .then(() => invoice.run())
                .catch(() => {});
            }}
          >
            <label>
              Service
              <select value={item.serviceId} onChange={(e) => setItem({ ...item, serviceId: e.target.value })} required>
                <option value="" disabled>
                  {services.loading ? "Loading…" : "Select a service"}
                </option>
                {services.items.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.price.toFixed(2)})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Quantity
              <input type="number" min={1} value={item.quantity} onChange={(e) => setItem({ ...item, quantity: e.target.value })} required />
            </label>
            <button type="submit" disabled={!visitId || addItem.loading}>
              {addItem.loading ? "Adding…" : "Add item"}
            </button>
            {addItem.error && <Notice kind="error">{addItem.error}</Notice>}
            {addItem.succeeded && <Notice kind="success">Item added.</Notice>}
          </form>
        </Panel>

        <Panel title="Record payment">
          <form
            className="inline-form"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              pay
                .run({ amountPaid: Number(payment.amountPaid), method: payment.method, reference: payment.reference || undefined })
                .then(() => invoice.run())
                .catch(() => {});
            }}
          >
            <label>
              Amount paid
              <input type="number" step="0.01" min="0.01" value={payment.amountPaid} onChange={(e) => setPayment({ ...payment, amountPaid: e.target.value })} required />
            </label>
            <label>
              Method
              <select value={payment.method} onChange={(e) => setPayment({ ...payment, method: e.target.value as PaymentMethod })}>
                <option value="CASH">Cash</option>
                <option value="MOBILE_MONEY">Mobile money</option>
                <option value="INSURANCE">Insurance</option>
              </select>
            </label>
            <label>
              Reference
              <input value={payment.reference} onChange={(e) => setPayment({ ...payment, reference: e.target.value })} />
            </label>
            <button type="submit" disabled={!visitId || pay.loading}>
              {pay.loading ? "Recording…" : "Record payment"}
            </button>
            {pay.error && <Notice kind="error">{pay.error}</Notice>}
            {pay.result && (
              <Notice kind="success">
                Receipt {pay.result.receiptNumber} — {pay.result.amountPaid.toFixed(2)}
                {pay.result.alreadySettled ? " (already settled)" : ""} — invoice {pay.result.invoiceStatus}
              </Notice>
            )}
          </form>
        </Panel>
      </div>
    </Workspace>
  );
}
