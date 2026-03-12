import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PrintMeasurementsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const customer = state?.customer;
  const entries = state?.entries || [];
  const orderDate = state?.orderDate;
  const deliveryDate = state?.deliveryDate || "";
  const billingItems = state?.billingItems || [];
  const orderId = state?.orderId;

  // FIELD ORDER (same as Measurement form)
  const PANT_FIELDS = [
    { name: "position", label: "Position" },
    { name: "length", label: "Length" },
    { name: "waist", label: "Waist" },
    { name: "hip", label: "Hip" },
    { name: "thigh", label: "Thigh" },
    { name: "knee", label: "Knee" },
    { name: "bottom", label: "Bottom" },
    { name: "chain", label: "Chain" },
  ];

  const SHIRT_FIELDS = [
    { name: "shirtType", label: "Shirt Type" },
    { name: "length", label: "Length" },
    { name: "chest", label: "Chest" },
    { name: "stomach", label: "Stomach" },
    { name: "front1", label: "Front 1" },
    { name: "front2", label: "Front 2" },
    { name: "front3", label: "Front 3" },
    { name: "shoulder", label: "Shoulder" },
    { name: "sleeve", label: "Sleeve" },
    { name: "sleeveLoosing", label: "Sleeve Loose" },
    { name: "collar", label: "Collar" },
    { name: "collarType", label: "Collar Type" },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!customer) return null;

  const renderFields = (data, fields) =>
    fields.map((f) => (
      <div key={f.name} className="row">
        <div className="label">{f.label}</div>
        <div className="value">{data?.[f.name] || "-"}</div>
      </div>
    ));

  const renderGarmentPage = (title, data, comments, fields) => (
    <div className="print-page">
      <div className="header">
        <h1>VAMSHI FASHION</h1>
        <div>
          {customer.name} | {customer.phone} | ID: {customer.customerCode}
        </div>
        <div>
          Order: {new Date(orderDate).toLocaleDateString()} | Delivery:{" "}
          {deliveryDate || "-"}
        </div>
      </div>

      <div className="garment-title">{title}</div>

      <div className="fields">{renderFields(data, fields)}</div>

      {comments && (
        <div className="comments">
          <strong>Notes:</strong> {comments}
        </div>
      )}
    </div>
  );

  return (
    <div className="print-container">

      {/* Back button (hidden in print) */}
      <div className="no-print back-btn">
        <button
          onClick={() =>
            navigate("/dashboard/billing", {
              state: {
                customer,
                items: billingItems,
                orderDate,
                deliveryDate,
                orderId: orderId
              },
            })
          }
        >
          ← Back to Billing
        </button>
      </div>

      {/* PRINT STYLES */}
      <style>{`
        @page {
          size: A5;
          margin: 8mm;
        }

        body {
          font-family: Arial, sans-serif;
          margin: 0;
        }

        .print-page {
          width: 148mm;
          min-height: 210mm;
          padding: 8mm;
          box-sizing: border-box;
          page-break-after: always;
        }

        .header {
          text-align: center;
          margin-bottom: 10px;
        }

        .header h1 {
          margin: 0;
          font-size: 28px;
          letter-spacing: 1px;
        }

        .header div {
          font-size: 14px;
          margin-top: 4px;
        }

        .garment-title {
          text-align: center;
          font-size: 22px;
          font-weight: bold;
          border-bottom: 2px solid #000;
          margin: 10px 0;
          padding-bottom: 5px;
        }

        .fields {
          margin-top: 8px;
        }

        .row {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px dashed #aaa;
          padding: 7px 0;
          font-size: 20px;
        }

        .label {
          font-weight: bold;
        }

        .value {
          min-width: 80px;
          text-align: right;
        }

        .comments {
          margin-top: 20px;
          font-size: 16px;
          border-top: 1px solid #ccc;
          padding-top: 8px;
        }

        .back-btn {
          padding: 20px;
        }

        .back-btn button {
          padding: 10px 18px;
          font-size: 16px;
          cursor: pointer;
          border-radius: 6px;
          border: none;
          background: #000;
          color: #fff;
        }

        .back-btn button:hover {
          background: #333;
        }

        @media print {
          .no-print {
            display: none;
          }

          .print-page {
            page-break-after: always;
          }
        }
      `}</style>

      {/* ONE GARMENT = ONE PAGE */}
      {entries.map((entry, idx) => (
        <div key={idx}>
          {renderGarmentPage(
            `Bottom - ${entry.bottomType}`,
            entry.pant,
            entry.pantComments,
            PANT_FIELDS
          )}

          {renderGarmentPage(
            `Top - ${entry.topType}`,
            entry.shirt,
            entry.shirtComments,
            SHIRT_FIELDS
          )}
        </div>
      ))}
    </div>
  );
}