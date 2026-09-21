import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../api/client";
import { useAction } from "../hooks/useAction";
import { useLookup } from "../hooks/useLookup";
import { Workspace } from "../components/Workspace";
import { Panel } from "../components/Panel";
import { Notice } from "../components/Notice";
import type {
  AppointmentRequest,
  AppointmentResponse,
  CheckInResponse,
  ConsultationType,
  DepartmentSummary,
  DoctorSummary,
  Gender,
  PatientRequest,
  PatientResponse,
  PatientSummary,
  QueueTicketResponse,
} from "../api/types";

function RegisterPatientPanel() {
  const { session } = useAuth();
  const [form, setForm] = useState<PatientRequest>({
    fullName: "",
    gender: "MALE",
    dateOfBirth: "",
    phone: "",
    address: "",
    bloodGroup: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });
  const action = useAction((body: PatientRequest) =>
    apiFetch<PatientResponse>(session!, "/api/patients", { method: "POST", body: JSON.stringify(body) }),
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    action.run(form).catch(() => {});
  }

  return (
    <Panel title="Register patient">
      <form className="inline-form" onSubmit={handleSubmit}>
        <label>
          Full name
          <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
        </label>
        <label>
          Gender
          <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </label>
        <label>
          Date of birth
          <input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} required />
        </label>
        <label>
          Phone
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        </label>
        <label>
          Address
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </label>
        <label>
          Blood group
          <input value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} />
        </label>
        <label>
          Emergency contact name
          <input value={form.emergencyContactName} onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })} />
        </label>
        <label>
          Emergency contact phone
          <input value={form.emergencyContactPhone} onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })} />
        </label>
        <button type="submit" disabled={action.loading}>
          {action.loading ? "Registering…" : "Register"}
        </button>
        {action.error && <Notice kind="error">{action.error}</Notice>}
        {action.result && (
          <Notice kind="success">
            Registered {action.result.patientNumber} — {action.result.fullName} (patient id {action.result.id})
          </Notice>
        )}
      </form>
    </Panel>
  );
}

function BookAppointmentPanel() {
  const { session } = useAuth();
  const patients = useLookup<PatientSummary>("/api/patients");
  const doctors = useLookup<DoctorSummary>("/api/doctors");
  const departments = useLookup<DepartmentSummary>("/api/departments");
  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    departmentId: "",
    appointmentDate: "",
    reason: "",
    consultationType: "IN_PERSON" as ConsultationType,
  });
  const action = useAction((body: AppointmentRequest) =>
    apiFetch<AppointmentResponse>(session!, "/api/appointments", { method: "POST", body: JSON.stringify(body) }),
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    action
      .run({
        patientId: Number(form.patientId),
        doctorId: Number(form.doctorId),
        departmentId: Number(form.departmentId),
        appointmentDate: new Date(form.appointmentDate).toISOString(),
        reason: form.reason || undefined,
        consultationType: form.consultationType,
      })
      .catch(() => {});
  }

  return (
    <Panel title="Book appointment">
      <form className="inline-form" onSubmit={handleSubmit}>
        <label>
          Patient
          <select value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} required>
            <option value="" disabled>
              {patients.loading ? "Loading…" : "Select a patient"}
            </option>
            {patients.items.map((p) => (
              <option key={p.id} value={p.id}>
                {p.patientNumber} — {p.fullName}
              </option>
            ))}
          </select>
        </label>
        <label>
          Doctor
          <select value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} required>
            <option value="" disabled>
              {doctors.loading ? "Loading…" : "Select a doctor"}
            </option>
            {doctors.items.map((d) => (
              <option key={d.id} value={d.id}>
                {d.firstName || d.lastName ? `${d.firstName} ${d.lastName}`.trim() : d.username}
              </option>
            ))}
          </select>
        </label>
        <label>
          Department
          <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} required>
            <option value="" disabled>
              {departments.loading ? "Loading…" : "Select a department"}
            </option>
            {departments.items.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Appointment date/time (must be in the future)
          <input
            type="datetime-local"
            value={form.appointmentDate}
            onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })}
            required
          />
        </label>
        <label>
          Reason
          <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </label>
        <label>
          Consultation type
          <select
            value={form.consultationType}
            onChange={(e) => setForm({ ...form, consultationType: e.target.value as ConsultationType })}
          >
            <option value="IN_PERSON">In person</option>
            <option value="TELEMEDICINE">Telemedicine</option>
          </select>
        </label>
        <button type="submit" disabled={action.loading}>
          {action.loading ? "Booking…" : "Book"}
        </button>
        {action.error && <Notice kind="error">{action.error}</Notice>}
        {action.result && <Notice kind="success">Booked appointment #{action.result.id} — status {action.result.status}</Notice>}
      </form>
    </Panel>
  );
}

function CheckInPanel() {
  const { session } = useAuth();
  const [appointmentId, setAppointmentId] = useState("");
  const action = useAction((id: number) => apiFetch<CheckInResponse>(session!, `/api/appointments/${id}/checkin`, { method: "POST" }));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    action.run(Number(appointmentId)).catch(() => {});
  }

  return (
    <Panel title="Check in">
      <form className="inline-form" onSubmit={handleSubmit}>
        <label>
          Appointment ID
          <input type="number" value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)} required />
        </label>
        <button type="submit" disabled={action.loading}>
          {action.loading ? "Checking in…" : "Check in"}
        </button>
        {action.error && <Notice kind="error">{action.error}</Notice>}
        {action.result && (
          <Notice kind="success">
            Visit #{action.result.visitId} — queue #{action.result.queueNumber} — status {action.result.status}
          </Notice>
        )}
      </form>
    </Panel>
  );
}

function QueuePanel() {
  const { session } = useAuth();
  const action = useAction(() => apiFetch<QueueTicketResponse[]>(session!, "/api/reception/queue"));

  return (
    <Panel title="Today's queue">
      <button onClick={() => action.run().catch(() => {})} disabled={action.loading}>
        {action.loading ? "Loading…" : "Refresh"}
      </button>
      {action.error && <Notice kind="error">{action.error}</Notice>}
      {action.result && (
        <div className="item-list">
          {action.result.length === 0 && <p className="meta">No queue entries today.</p>}
          {action.result.map((t) => (
            <div className="item-row" key={t.queueNumber}>
              <span>
                #{t.queueNumber} — {t.patientName}
              </span>
              <span className="meta">
                Dr. {t.doctorUsername ?? "unassigned"} {t.served && <span className="badge">served</span>}
              </span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

export function ReceptionPage() {
  return (
    <Workspace title="Reception" sections={["Register patient", "Book appointment", "Check in", "Today's queue"]}>
      <div className="panel-row">
        <RegisterPatientPanel />
        <BookAppointmentPanel />
      </div>
      <div className="panel-row">
        <CheckInPanel />
        <QueuePanel />
      </div>
    </Workspace>
  );
}
