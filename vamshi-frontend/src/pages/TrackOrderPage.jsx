import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE;

const STATUS_COLORS = {
  RECEIVED: "text-gray-600",
  CUTTING: "text-yellow-600",
  STITCHING: "text-blue-600",
  FINISHING: "text-purple-600",
  READY: "text-green-600",
};

const STATUS_LABELS = {
  RECEIVED: "Order Received",
  CUTTING: "Garment Cutting",
  STITCHING: "Stitching",
  FINISHING: "Finishing Process",
  READY: "Ready for Delivery",
};

export default function TrackOrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`${API}/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error("Failed to load order", err);
    }
  };

  if (!order) return <p className="p-10">Loading order status...</p>;

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg">

        <h1 className="text-2xl font-bold text-center mb-4">
          Vamshi Fashion
        </h1>

        <div className="text-center mb-4">
          Order #{order.id}
        </div>

        <div className="text-sm text-gray-600 text-center mb-6">
          {order.customer.name} • {order.customer.phone}
        </div>

        <div className="space-y-3">

          {order.garments.map((g) => (
            <div
              key={g.id}
              className="flex justify-between border-b pb-2"
            >
              <span>{g.type}</span>
              <span className={`font-semibold ${STATUS_COLORS[g.status]}`}>
                {STATUS_LABELS[g.status]}
              </span>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
}