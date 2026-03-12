// src/pages/BillingPage.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function BillingPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [customer] = useState(state?.customer || null);
  const [orderId] = useState(state?.orderId || null);
  const [orderDate] = useState(state?.orderDate || new Date().toISOString());
  const [deliveryDate, setDeliveryDate] = useState(state?.deliveryDate || "");

  const [items] = useState(
    (state?.items || []).map((it) => ({
      garment: it.garment || it.type || "",
      qty: it.qty || it.quantity || 0,
    }))
  );

  const [rates, setRates] = useState({});
  const [paid, setPaid] = useState(0);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const res = await axios.get(`${API_BASE}/rates`);
      setRates(res.data || {});
    } catch (err) {
      console.error("Failed to fetch rates:", err);
    }
  };

  const updateRateLocally = (garment, val) => {
    setRates((r) => ({ ...r, [garment]: Number(val || 0) }));
  };

  const subtotal = items.reduce((s, it) => {
    const rate = Number(rates[it.garment] || 0);
    return s + rate * Number(it.qty || 0);
  }, 0);

  const balance = subtotal - Number(paid || 0);

const handleSaveBill = async () => {
  try {
    if (!orderId) {
      alert("Order ID missing");
      return;
    }

    const billData = {
        orderId: Number(orderId),
        subtotal: Number(subtotal),
        paid: Number(paid),
        balance: Number(subtotal) - Number(paid),
        deliveryDate
    };    

    await axios.post(`${API_BASE}/bills`, billData);

    alert("✅ Bill saved successfully");
  } catch (err) {
    console.error("Save bill failed:", err);
    alert("❌ Failed to save bill");
  }
};

  const handlePrint = () => {
    navigate("/dashboard/print-bill", {
      state: {
        customer,
        items,
        rates,
        subtotal,
        paid,
        balance,
        orderDate,
        deliveryDate,
        orderId,
      },
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-700">Billing</h1>

      <div className="bg-white rounded-xl shadow p-6 max-w-3xl">

        <div className="grid md:grid-cols-2 gap-4">

          <div>
            <label className="text-sm text-gray-600">Customer</label>
            <div className="p-2 border rounded">
              {customer?.name} • {customer?.phone}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Order date</label>
            <input
              readOnly
              value={new Date(orderDate).toLocaleString()}
              className="w-full border p-2 rounded bg-gray-50"
            />

            <label className="text-sm text-gray-600 mt-2 block">
              Delivery date
            </label>

            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

        </div>

        <div className="mt-4">
          <h3 className="font-semibold">Line items</h3>

          <table className="min-w-full text-sm mt-2">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">Item</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Rate</th>
                <th className="px-3 py-2 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {items.map((it, idx) => {
                const rate = Number(rates[it.garment] || 0);
                const amount = rate * Number(it.qty || 0);

                return (
                  <tr key={idx} className="border-t">

                    <td className="px-3 py-2">{it.garment}</td>

                    <td className="px-3 py-2 text-right">{it.qty}</td>

                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        value={rates[it.garment] ?? 0}
                        onChange={(e) =>
                          updateRateLocally(it.garment, e.target.value)
                        }
                        className="w-24 text-right border p-1 rounded"
                      />
                    </td>

                    <td className="px-3 py-2 text-right">
                      {amount.toFixed(2)}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-4 flex justify-between">

            <div>
              <label className="text-sm text-gray-600">Paid</label>
              <input
                type="number"
                value={paid}
                onChange={(e) => setPaid(e.target.value)}
                className="border p-2 rounded w-32"
              />
            </div>

            <div className="text-right">
              <div>Subtotal: <strong>{subtotal.toFixed(2)}</strong></div>
              <div>Balance: <strong>{balance.toFixed(2)}</strong></div>
            </div>

          </div>

          <div className="mt-4 flex gap-3 justify-end">

            <button
              onClick={() => navigate("/dashboard/customers")}
              className="px-4 py-2 border rounded"
            >
             ← Dashboard
            </button>
            
            <button
              onClick={handleSaveBill}
              className="px-4 py-2 bg-green-600 text-white rounded"
          >
               Save Bill
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Print Bill
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}