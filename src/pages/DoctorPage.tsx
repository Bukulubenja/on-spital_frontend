import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../api/client";
import { useAction } from "../hooks/useAction";
import { Workspace } from "../components/Workspace";
import { Panel } from "../components/Panel";
import { Notice } from "../components/Notice";
import type {
  DiagnosisRequest,
  LabTestOrderResponse,
  PrescriptionItemRequest,
  VisitStatusResponse,
  VitalsRequest,
} from "../api/types";

export function DoctorPage() {
  const { session } = useAuth();
  const [visitId, setVisitId] = useState("");
  const vid = Number(visitId);

  const start = useAction(() => apiFetch<VisitStatusResponse>(session!, `/api/visits/${vid}/start`, { method: "POST" }));
  const complete = useAction(() => apiFetch<VisitStatusResponse>(session!, `/api/visits/${vid}/complete`, { method: "POST" }));

  const [vitals, setVitals] = useState({ temperature: "", pulseRate: "", bloodPressure: "", weight: "", height: "" });
  const vitalsAction = useAction((body: VitalsRequest) =>
    apiFetch<void>(session!, `/api/visits/${vid}/vitals`, { method: "POST", body: JSON.stringify(body) }),
  );

  const [diagnosis, setDiagnosis] = useState({ diagnosis: "", notes: "" });
  const diagnosisAction = useAction((body: DiagnosisRequest) =>
    apiFetch<void>(session!, `/api/visits/${vid}/diagnosis`, { method: "POST", body: JSON.stringify(body) }),
  );

  const [prescription, setPrescription] = useState({ drugId: "", quantity: "1", dosage: "", frequency: "", duration: "", instructions: "" });
  const prescriptionAction = useAction((body: PrescriptionItemRequest) =>
    apiFetch<void>(session!, `/api/visits/${vid}/prescriptions`, { method: "POST", body: JSON.stringify(body) }),
  );

  const [testId, setTestId] = useState("");
  const labTestAction = useAction(() =>
    apiFetch<LabTestOrderResponse>(session!, `/api/visits/${vid}/lab-tests`, {
      method: "POST",
      body: JSON.stringify({ testId: Number(testId) }),
    }),
  );

  const visitReady = visitId.length > 0 && !Number.isNaN(vid);

  return (
    <Workspace title="Doctor">
      <Panel title="Visit">
        <label>
          Visit ID
          <input type="number" value={visitId} onChange={(e) => setVisitId(e.target.value)} placeholder="e.g. from reception check-in" />
        </label>
        <div className="panel-row">
          <button disabled={!visitReady || start.loading} onClick={() => start.run().catch(() => {})}>
            {start.loading ? "Starting…" : "Start consultation"}
          </button>
          <button disabled={!visitReady || complete.loading} onClick={() => complete.run().catch(() => {})}>
            {complete.loading ? "Completing…" : "Complete visit"}
          </button>
        </div>
        {start.error && <Notice kind="error">{start.error}</Notice>}
        {start.result && <Notice kind="success">Visit {start.result.visitId} → {start.result.status}</Notice>}
        {complete.error && <Notice kind="error">{complete.error}</Notice>}
        {complete.result && <Notice kind="success">Visit {complete.result.visitId} → {complete.result.status}</Notice>}
      </Panel>

      <div className="panel-row">
        <Panel title="Record vitals">
          <form
            className="inline-form"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              vitalsAction
                .run({
                  temperature: Number(vitals.temperature),
                  pulseRate: Number(vitals.pulseRate),
                  bloodPressure: vitals.bloodPressure,
                  weight: Number(vitals.weight),
                  height: Number(vitals.height),
                })
                .catch(() => {});
            }}
          >
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
            <button type="submit" disabled={!visitReady || vitalsAction.loading}>
              {vitalsAction.loading ? "Saving…" : "Save vitals"}
            </button>
            {vitalsAction.error && <Notice kind="error">{vitalsAction.error}</Notice>}
            {vitalsAction.succeeded && <Notice kind="success">Vitals recorded.</Notice>}
          </form>
        </Panel>

        <Panel title="Record diagnosis">
          <form
            className="inline-form"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              diagnosisAction.run({ diagnosis: diagnosis.diagnosis, notes: diagnosis.notes || undefined }).catch(() => {});
            }}
          >
            <label>
              Diagnosis
              <input value={diagnosis.diagnosis} onChange={(e) => setDiagnosis({ ...diagnosis, diagnosis: e.target.value })} required />
            </label>
            <label>
              Notes
              <textarea value={diagnosis.notes} onChange={(e) => setDiagnosis({ ...diagnosis, notes: e.target.value })} />
            </label>
            <button type="submit" disabled={!visitReady || diagnosisAction.loading}>
              {diagnosisAction.loading ? "Saving…" : "Save diagnosis"}
            </button>
            {diagnosisAction.error && <Notice kind="error">{diagnosisAction.error}</Notice>}
            {diagnosisAction.succeeded && <Notice kind="success">Diagnosis recorded.</Notice>}
          </form>
        </Panel>
      </div>

      <div className="panel-row">
        <Panel title="Add prescription item">
          <form
            className="inline-form"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              prescriptionAction
                .run({
                  drugId: Number(prescription.drugId),
                  quantity: Number(prescription.quantity),
                  dosage: prescription.dosage,
                  frequency: prescription.frequency,
                  duration: prescription.duration,
                  instructions: prescription.instructions || undefined,
                })
                .catch(() => {});
            }}
          >
            <label>
              Drug ID
              <input type="number" value={prescription.drugId} onChange={(e) => setPrescription({ ...prescription, drugId: e.target.value })} required />
            </label>
            <label>
              Quantity
              <input type="number" min={1} value={prescription.quantity} onChange={(e) => setPrescription({ ...prescription, quantity: e.target.value })} required />
            </label>
            <label>
              Dosage
              <input value={prescription.dosage} onChange={(e) => setPrescription({ ...prescription, dosage: e.target.value })} required />
            </label>
            <label>
              Frequency
              <input value={prescription.frequency} onChange={(e) => setPrescription({ ...prescription, frequency: e.target.value })} required />
            </label>
            <label>
              Duration
              <input value={prescription.duration} onChange={(e) => setPrescription({ ...prescription, duration: e.target.value })} required />
            </label>
            <label>
              Instructions
              <input value={prescription.instructions} onChange={(e) => setPrescription({ ...prescription, instructions: e.target.value })} />
            </label>
            <button type="submit" disabled={!visitReady || prescriptionAction.loading}>
              {prescriptionAction.loading ? "Adding…" : "Add prescription item"}
            </button>
            {prescriptionAction.error && <Notice kind="error">{prescriptionAction.error}</Notice>}
            {prescriptionAction.succeeded && <Notice kind="success">Prescription item added.</Notice>}
          </form>
        </Panel>

        <Panel title="Order lab test">
          <form
            className="inline-form"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              labTestAction.run().catch(() => {});
            }}
          >
            <label>
              Test ID
              <input type="number" value={testId} onChange={(e) => setTestId(e.target.value)} required />
            </label>
            <button type="submit" disabled={!visitReady || labTestAction.loading}>
              {labTestAction.loading ? "Ordering…" : "Order test"}
            </button>
            {labTestAction.error && <Notice kind="error">{labTestAction.error}</Notice>}
            {labTestAction.result && (
              <Notice kind="success">
                {labTestAction.result.testName}
                {labTestAction.result.alreadyOrdered ? " (already ordered)" : " — ordered"}
              </Notice>
            )}
          </form>
        </Panel>
      </div>
    </Workspace>
  );
}
