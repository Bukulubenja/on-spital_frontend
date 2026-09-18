export type SeriesPoint = { date: string; count?: number; amount?: number };
export type LabeledCount = { label: string; count: number };

export type Payment = {
  id: number;
  receiptNumber: string;
  patientName: string;
  amountPaid: number;
  paymentDate: string;
};

export type Patient = {
  id: number;
  patientNumber: string;
  fullName: string;
  createdAt: string;
};

export type AdminDashboard = {
  totalPatients: number;
  todaysAppointments: number;
  appointmentsDeltaPercent: number;
  activeVisits: number;
  todaysRevenue: number;
  revenueDeltaPercent: number;
  outstandingBalance: number;
  lowStockDrugs: number;
  totalStaff: number;
  appointmentsSeries: SeriesPoint[];
  revenueSeries: SeriesPoint[];
  visitsByStatus: LabeledCount[];
  visitsByDepartment: LabeledCount[];
  staffByRole: LabeledCount[];
  recentPatients: Patient[];
  recentPayments: Payment[];
};

// --- Reception ---

export type Gender = "MALE" | "FEMALE" | "OTHER";
export type ConsultationType = "IN_PERSON" | "TELEMEDICINE";
export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export type PatientRequest = {
  fullName: string;
  gender: Gender;
  dateOfBirth: string;
  phone: string;
  address?: string;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
};

export type PatientResponse = {
  id: number;
  patientNumber: string;
  fullName: string;
  gender: Gender;
  dateOfBirth: string;
};

export type AppointmentRequest = {
  patientId: number;
  doctorId: number;
  departmentId: number;
  appointmentDate: string;
  reason?: string;
  consultationType?: ConsultationType;
  meetingLink?: string;
};

export type AppointmentResponse = {
  id: number;
  patientId: number;
  doctorUsername: string | null;
  departmentName: string | null;
  appointmentDate: string;
  status: AppointmentStatus;
  consultationType: ConsultationType;
};

export type CheckInResponse = { visitId: number; queueNumber: number; status: string };

export type PatientSummary = { id: number; patientNumber: string; fullName: string; phone: string };
export type DoctorSummary = { id: number; username: string; firstName: string; lastName: string };
export type DepartmentSummary = { id: number; name: string };

export type QueueTicketResponse = {
  queueNumber: number;
  patientName: string;
  doctorUsername: string | null;
  served: boolean;
};

// --- Doctor ---

export type VisitStatusResponse = { visitId: number; status: string };

export type VitalsRequest = {
  temperature: number;
  pulseRate: number;
  bloodPressure: string;
  weight: number;
  height: number;
};

export type DiagnosisRequest = { diagnosis: string; notes?: string };

export type PrescriptionItemRequest = {
  drugId: number;
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
};

export type LabTestOrderResponse = { testName: string; alreadyOrdered: boolean };

export type DrugLookup = { id: number; name: string; strength: string };
export type LabTestSummary = { id: number; name: string; price: number };

// --- Nurse ---

export type NurseQueueEntry = {
  visitId: number;
  patientName: string;
  doctorUsername: string | null;
  hasVitals: boolean;
};

// --- Lab ---

export type LabOrderItem = { itemId: number; testName: string; recorded: boolean; resultValue: string | null };
export type LabOrderView = { status: string; items: LabOrderItem[] };
export type LabResultRequest = { resultValue: string; normalRange?: string; remarks?: string };
export type LabResultResponse = { testName: string; alreadyRecorded: boolean; visitStatus: string };

// --- Pharmacy ---

export type PrescriptionViewItem = {
  itemId: number;
  drugName: string;
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
  dispensed: boolean;
  availableStock: number;
};
export type PrescriptionView = { canDispense: boolean; items: PrescriptionViewItem[] };
export type DispenseResponse = { drugName: string; quantity: number; alreadyDispensed: boolean; visitStatus: string };

// --- Cashier ---

export type PaymentMethod = "CASH" | "MOBILE_MONEY" | "INSURANCE";

export type ServiceSummary = { id: number; name: string; serviceType: string; price: number };

export type InvoiceItem = { itemId: number; serviceName: string; quantity: number; price: number; subtotal: number };
export type InvoicePaymentRecord = { receiptNumber: string; amountPaid: number; method: string; reference: string | null };
export type InvoiceView = {
  invoiceId: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  status: string;
  items: InvoiceItem[];
  payments: InvoicePaymentRecord[];
};
export type InvoiceItemRequest = { serviceId: number; quantity: number };
export type PaymentRequest = { amountPaid: number; method: PaymentMethod; reference?: string };
export type PaymentResponse = { receiptNumber: string; amountPaid: number; alreadySettled: boolean; invoiceStatus: string };

// --- Stock Manager ---

export type DrugSummary = { drugId: number; name: string; category: string; strength: string; totalQuantity: number };
export type TransactionView = {
  id: number;
  drugName: string;
  type: "IN" | "OUT";
  quantity: number;
  reason: string | null;
  date: string;
};
export type StockDashboardView = {
  drugs: DrugSummary[];
  expiringSoonCount: number;
  expiredCount: number;
  recentTransactions: TransactionView[];
};
export type BatchStatus = "EXPIRED" | "EXPIRING_SOON" | "FRESH";
export type BatchView = { stockId: number; batchNumber: string; quantity: number; expiryDate: string; status: BatchStatus };
export type DrugStockDetailView = {
  drugId: number;
  drugName: string;
  strength: string;
  batches: BatchView[];
  transactions: TransactionView[];
};
export type ReceiveStockRequest = { batchNumber: string; quantity: number; expiryDate: string };
export type AdjustStockRequest = { batchId: number; quantity: number; reason: string };
