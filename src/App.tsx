import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth, type Role } from "./auth/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ReceptionPage } from "./pages/ReceptionPage";
import { DoctorPage } from "./pages/DoctorPage";
import { NursePage } from "./pages/NursePage";
import { LabPage } from "./pages/LabPage";
import { PharmacyPage } from "./pages/PharmacyPage";
import { CashierPage } from "./pages/CashierPage";
import { StockManagerPage } from "./pages/StockManagerPage";
import { DeveloperPage } from "./pages/DeveloperPage";
import "./App.css";

const HOME_BY_ROLE: Record<Role, string> = {
  ADMIN: "/admin",
  RECEPTIONIST: "/reception",
  DOCTOR: "/doctor",
  NURSE: "/nurse",
  LAB: "/lab",
  PHARMACIST: "/pharmacy",
  CASHIER: "/cashier",
  STOCK_MANAGER: "/stock",
  PLATFORM_OPERATOR: "/platform",
};

function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== role) return <Navigate to={HOME_BY_ROLE[session.role]} replace />;
  return <>{children}</>;
}

function Shell() {
  const { session } = useAuth();
  const home = session ? HOME_BY_ROLE[session.role] : "/login";

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to={home} replace /> : <LoginPage />} />
      <Route
        path="/admin"
        element={
          <RequireRole role="ADMIN">
            <DashboardPage />
          </RequireRole>
        }
      />
      <Route
        path="/reception"
        element={
          <RequireRole role="RECEPTIONIST">
            <ReceptionPage />
          </RequireRole>
        }
      />
      <Route
        path="/doctor"
        element={
          <RequireRole role="DOCTOR">
            <DoctorPage />
          </RequireRole>
        }
      />
      <Route
        path="/nurse"
        element={
          <RequireRole role="NURSE">
            <NursePage />
          </RequireRole>
        }
      />
      <Route
        path="/lab"
        element={
          <RequireRole role="LAB">
            <LabPage />
          </RequireRole>
        }
      />
      <Route
        path="/pharmacy"
        element={
          <RequireRole role="PHARMACIST">
            <PharmacyPage />
          </RequireRole>
        }
      />
      <Route
        path="/cashier"
        element={
          <RequireRole role="CASHIER">
            <CashierPage />
          </RequireRole>
        }
      />
      <Route
        path="/stock"
        element={
          <RequireRole role="STOCK_MANAGER">
            <StockManagerPage />
          </RequireRole>
        }
      />
      <Route
        path="/platform"
        element={
          <RequireRole role="PLATFORM_OPERATOR">
            <DeveloperPage />
          </RequireRole>
        }
      />
      <Route path="*" element={<Navigate to={home} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </AuthProvider>
  );
}
