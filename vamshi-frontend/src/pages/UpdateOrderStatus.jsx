import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE;

const STATUS_OPTIONS = [
  { value: "RECEIVED", label: "Order received" },
  { value: "CUTTING", label: "Garment cutting" },
  { value: "STITCHING", label: "Stitching" },
  { value: "FINISHING", label: "Finishing process" },
  { value: "READY", label: "Ready for delivery" },
];

export default function UpdateOrderStatus() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API}/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (garmentId, status) => {
    try {
      await axios.patch(`${API}/garments/${garmentId}/status`, {
        status,
      });

      setOrders((prev) =>
        prev.map((order) => ({
          ...order,
          garments: order.garments.map((g) =>
            g.id === garmentId ? { ...g, status } : g
          ),
        }))
      );
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Status update failed");
    }
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h1 className="text-2xl font-bold text-gray-700 mb-6">
        Order Tracking
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="p-2 text-left">Order ID</th>
              <th className="p-2 text-left">Customer</th>
              <th className="p-2 text-left">Phone</th>
              <th className="p-2 text-left">Garment</th>
              <th className="p-2 text-left">Qty</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Update</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) =>
              order.garments.map((garment) => (
                <tr key={garment.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{order.id}</td>
                  <td className="p-2">{order.customer.name}</td>
                  <td className="p-2">{order.customer.phone}</td>
                  <td className="p-2">{garment.type}</td>
                  <td className="p-2">{garment.quantity}</td>
                  <td className="p-2 font-medium">
                    {STATUS_OPTIONS.find((s) => s.value === garment.status)?.label}
                  </td>

                  <td className="p-2">
                    <select
                      value={garment.status}
                      onChange={(e) =>
                        updateStatus(garment.id, e.target.value)
                      }
                      className="border rounded p-1"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}