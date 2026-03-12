import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-600 text-white p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-6">Vamshi Fashion</h2>
          <nav className="flex flex-col gap-3">
            <Link to="/dashboard/customers" className="hover:text-gray-200">Customers</Link>
            <Link to="/dashboard/measurements" className="hover:text-gray-200">Measurements</Link>
            <Link to="/dashboard/bills" className="hover:text-gray-200">Billing</Link>
            <Link to="/dashboard/orders" className="hover:text-gray-200">Orders</Link>
          </nav>
        </div>
        <button
          onClick={logout}
          className="bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 mt-6"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
