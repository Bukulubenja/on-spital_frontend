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
