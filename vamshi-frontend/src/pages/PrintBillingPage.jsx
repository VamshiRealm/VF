// src/pages/PrintBillingPage.jsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

export default function PrintBillingPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    customer,
    items = [],
    rates = {},
    subtotal = 0,
    paid = 0,
    balance = 0,
    orderDate,
    deliveryDate,
    orderId,
  } = state || {};

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!customer) return null;

  return (
    <div className="print-container">

      <div className="no-print p-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-black text-white rounded"
        >
          ← Back to Billing
        </button>
      </div>

      <style>{`
        @page {
          size: A5;
          margin: 12mm;
        }

        body {
          font-family: Arial;
        }

        .bill {
          width: 148mm;
        }

        .brand {
          font-size: 24px;
          font-weight: bold;
          text-align:center;
        }

        table {
          width:100%;
          border-collapse: collapse;
          margin-top:10px;
        }

        th,td {
          border-bottom:1px solid #ddd;
          padding:6px;
          font-size:14px;
        }

        .right {
          text-align:right;
        }

        .totals {
          margin-top:10px;
          text-align:right;
          font-weight:bold;
        }

        @media print {
          .no-print {
            display:none;
          }
        }
      `}</style>

      <div className="bill">

        <div className="brand">VAMSHI FASHION</div>

        <div style={{fontSize:"13px",marginTop:"8px"}}>
          Customer: {customer.name} • {customer.phone}
            <br/>
            Order ID: #{orderId}
            <br/>
          Order: {new Date(orderDate).toLocaleString()}
        <br/>
        Delivery: {deliveryDate || "-"}
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th className="right">Qty</th>
              <th className="right">Rate</th>
              <th className="right">Amount</th>
            </tr>
          </thead>

          <tbody>
            {items.map((it, idx) => {
              const rate = Number(rates[it.garment] || 0);
              const amount = rate * it.qty;

              return (
                <tr key={idx}>
                  <td>{it.garment}</td>
                  <td className="right">{it.qty}</td>
                  <td className="right">{rate.toFixed(2)}</td>
                  <td className="right">{amount.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="totals">
          Total: {subtotal.toFixed(2)} <br/>
          Paid: {Number(paid).toFixed(2)} <br/>
          Balance: {balance.toFixed(2)}
        </div>

      </div>
      <div className="mt-4 text-center">

          <p className="text-sm">Scan to track your order</p>

               <QRCodeCanvas
                 value={`${window.location.origin}/track/order/${orderId}`}
                 size={120}
                />

      </div>
    </div>
  );
}