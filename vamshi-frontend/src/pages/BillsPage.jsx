import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE;

export default function BillsPage() {

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await axios.get(`${API}/bills`);
      setBills(res.data || []);
    } catch (err) {
      console.error("Failed to fetch bills:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBill = (bill) => {
    navigate("/dashboard/print-bill", {
      state: {
        orderId: bill.orderId,
        customer: bill.order.customer,
        subtotal: bill.subtotal,
        paid: bill.paid,
        balance: bill.balance,
        orderDate: bill.order.createdAt,
        deliveryDate: bill.deliveryDate
      }
    });
  };

  if (loading) {
    return <div className="p-4">Loading bills...</div>;
  }

  return (
    <div>

      <h1 className="text-2xl font-bold mb-4">Generated Bills</h1>

      <table className="w-full bg-white shadow rounded">

        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Bill ID</th>
            <th>Customer</th>
            <th>Phone</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Balance</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {bills.length === 0 && (
            <tr>
              <td colSpan="8" className="text-center p-4">
                No bills generated yet
              </td>
            </tr>
          )}

          {bills.map((b) => (
            <tr key={b.id} className="border-t">

              <td className="p-2">#{b.id}</td>
              <td>{b.order?.customer?.name}</td>
              <td>{b.order?.customer?.phone}</td>
              <td>₹{b.subtotal}</td>
              <td>₹{b.paid}</td>
              <td>₹{b.balance}</td>
              <td>{new Date(b.createdAt).toLocaleDateString()}</td>

              <td>
                <button
                  onClick={() => handleViewBill(b)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
                >
                  View / Print
                </button>
              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}