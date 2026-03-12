import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import CustomersPage from "./pages/CustomersPage";
import MeasurementsPage from "./pages/MeasurementsPage";
import MeasurementsListPage from "./pages/MeasurementsListPage";
import BillingPage from "./pages/BillingPage";
import LoginPage from "./pages/LoginPage";
import PrintMeasurementsPage from "./pages/PrintMeasurementsPage";
import PrintBillingPage from "./pages/PrintBillingPage";
import UpdateOrderStatus from "./pages/UpdateOrderStatus";
import { AuthProvider, useAuth } from "./context/AuthContext";
import TrackOrderPage from "./pages/TrackOrderPage";
import BillsPage from "./pages/BillsPage";

// Protected Route wrapper
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/track/order/:id" element={<TrackOrderPage />} />

          <Route path="/dashboard/*" element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }>
              <Route path="customers" element={<CustomersPage />} />
              <Route path="measurements" element={<MeasurementsListPage />} />
              <Route path="measurements/:id" element={<MeasurementsPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="print-measurements" element={<PrintMeasurementsPage />} />
              <Route path="print-bill" element={<PrintBillingPage />} />
              <Route path="orders" element={<UpdateOrderStatus />} />
              <Route path="bills" element={<BillsPage />} />

            </Route>
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
