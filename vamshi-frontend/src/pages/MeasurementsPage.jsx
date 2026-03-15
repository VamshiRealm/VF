import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
const API = import.meta.env.VITE_API_BASE;

const TOP_OPTIONS = [
  "Shirt",
  "Kurta",
  "Short Kurta",
  "Safari",
  "Sherwani",
  "Suit",
  "Jacket",
  "Open Sherwani",
];

const BOTTOM_OPTIONS = ["Pant", "Vijar", "Jeans"];

// Dropdown values inside panels
const POSITION_OPTIONS = ["", "1", "2", "3", "4"]; // adjust as you prefer
const SHIRT_TYPE_OPTIONS = ["Bushirt", "Open-shirt"];
const COLLAR_TYPE_OPTIONS = [
  "2.25",
  "2.5",
  "2.75",
  "2.25J",
  "2.5J",
  "2.75J",
  "2.25K",
  "2.5K",
  "2.75K",
];

const INITIAL_PANT = {
  position: "",
  length: "",
  waist: "",
  hip: "",
  thigh: "",
  knee: "",
  bottom: "",
  chain: "",
};

const INITIAL_SHIRT = {
  shirtType: "Bushirt",
  length: "",
  chest: "",
  stomach: "",
  front1: "",
  front2: "",
  front3: "",
  shoulder: "",
  sleeve: "",
  sleeveLoosing: "",
  collar: "",
  collarType: "2.25",
};

const inputStyle =
  "border p-1 rounded text-center w-20 focus:ring-2 focus:ring-indigo-400";

export default function MeasurementsPage() {
  const { id } = useParams(); // 5-digit code
  const navigate = useNavigate();
  const location = useLocation();
  const customer = location.state;

  const [resolvedCustomer, setResolvedCustomer] = useState(customer || null);

  // Multiple sets of measurements (pant+shirt) per customer
  const [entries, setEntries] = useState([
    {
      topType: "Shirt",
      bottomType: "Pant",
      pantQty: 1,
      shirtQty: 1,
      pant: { ...INITIAL_PANT },
      shirt: { ...INITIAL_SHIRT },
      pantComments: "",
      shirtComments: "",
      extraPant: [],
      extraShirt: [],
    },
  ]);

  const inputRefs = useRef([]);
  const saveButtonRef = useRef(null);

  const REQUIRED_PANT_FIELDS = ["length", "waist", "hip"];
  const REQUIRED_SHIRT_FIELDS = ["length", "chest","stomach", "shoulder"];


  const addInputRef = (el) => {
    if (el && !inputRefs.current.includes(el)) {
      inputRefs.current.push(el);
    }
  };

  const handleEnterKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const idx = inputRefs.current.indexOf(e.target);
      const next = inputRefs.current[idx + 1];
      if (next) {
        next.focus();
      } else if (saveButtonRef.current) {
        saveButtonRef.current.focus();
        saveButtonRef.current.click();
      }
    }
  };

useEffect(() => {
  async function loadCustomerAndMeasurements() {
    try {
      // Load customer
      let cust = resolvedCustomer;

      if (!cust) {
        const res = await axios.get(`${API}/customers/${id}`);
        cust = res.data;
        setResolvedCustomer(cust);
      }

      // Load previous measurements
      const resMeasurements = await axios.get(
        `${API}/customers/${id}/measurements`
      );

      const list = resMeasurements.data;

      if (list.length > 0) {

        let top = null;
        let bottom = null;

        for (const m of list) {
          if (!top && TOP_OPTIONS.map(t => t.toLowerCase()).includes(m.type)) {
            top = m;
          }

          if (!bottom && BOTTOM_OPTIONS.map(b => b.toLowerCase()).includes(m.type)) {
            bottom = m;
          }

          if (top && bottom) break;
        }

        setEntries([
          {
            topType: top?.data?.garment || "Shirt",
            bottomType: bottom?.data?.garment || "Pant",

            pantQty: bottom?.quantity || 1,
            shirtQty: top?.quantity || 1,

            pant: { ...INITIAL_PANT, ...(bottom?.data || {}) },
            shirt: { ...INITIAL_SHIRT, ...(top?.data || {}) },

            pantComments: bottom?.comments || "",
            shirtComments: top?.comments || "",

            extraPant: [],
            extraShirt: [],
          },
        ]);
      }

    } catch (err) {
      console.error("Error loading measurements:", err);
    }
  }

  loadCustomerAndMeasurements();
}, [id]);


  // Clear refs on each render so we rebuild them
  if (!resolvedCustomer) return null;
  inputRefs.current = [];

  // ------- handlers per entry -------
  const updateEntry = (index, updater) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, ...updater(e) } : e))
    );
  };

  const handlePantChange = (index, e) => {
    const { name, value } = e.target;
    updateEntry(index, (entry) => ({
      pant: { ...entry.pant, [name]: value },
    }));
  };

  const handleShirtChange = (index, e) => {
    const { name, value } = e.target;
    updateEntry(index, (entry) => ({
      shirt: { ...entry.shirt, [name]: value },
    }));
  };

  const handlePantQtyChange = (index, value) => {
    updateEntry(index, () => ({ pantQty: Number(value) || 0 }));
  };

  const handleShirtQtyChange = (index, value) => {
    updateEntry(index, () => ({ shirtQty: Number(value) || 0 }));
  };

  const handlePantCommentsChange = (index, value) => {
    updateEntry(index, () => ({ pantComments: value }));
  };

  const handleShirtCommentsChange = (index, value) => {
    updateEntry(index, () => ({ shirtComments: value }));
  };

  const handleBottomTypeChange = (index, value) => {
    updateEntry(index, () => ({ bottomType: value }));
  };

  const handleTopTypeChange = (index, value) => {
    updateEntry(index, () => ({ topType: value }));
  };

  const addExtraPant = (index) => {
    updateEntry(index, (entry) => ({
      extraPant: [...entry.extraPant, { label: "", value: "" }],
    }));
  };

  const addExtraShirt = (index) => {
    updateEntry(index, (entry) => ({
      extraShirt: [...entry.extraShirt, { label: "", value: "" }],
    }));
  };

  const handleExtraPantChange = (entryIndex, i, field, value) => {
    updateEntry(entryIndex, (entry) => ({
      extraPant: entry.extraPant.map((ex, idx) =>
        idx === i ? { ...ex, [field]: value } : ex
      ),
    }));
  };

  const handleExtraShirtChange = (entryIndex, i, field, value) => {
    updateEntry(entryIndex, (entry) => ({
      extraShirt: entry.extraShirt.map((ex, idx) =>
        idx === i ? { ...ex, [field]: value } : ex
      ),
    }));
  };



  // ------- Save All to backend -------
const handleSaveAll = async (e) => {
  e.preventDefault();
  const snapshotEntries = JSON.parse(JSON.stringify(entries));


  if (!resolvedCustomer) {
    alert("Customer not loaded");
    return;
  }

  for (const entry of entries) {

      if (!entry.pant.length || !entry.pant.waist || !entry.pant.hip) {
        alert("Bottom measurements Length, Waist and Hip are required.");
        return;
     }

      if (!entry.shirt.length || !entry.shirt.chest || !entry.shirt.shoulder) {
        alert("Top measurements Length, Chest and Shoulder are required.");
        return;
        }

    }

  const identifier = resolvedCustomer.customerCode
    ? resolvedCustomer.customerCode.toString()
    : resolvedCustomer.id.toString();

  try {
    const billingItems = []; 
    const garments = [];

    for (const entry of entries) {
       garments.push({
          type: entry.topType,
         quantity: entry.shirtQty,
        });

       garments.push({
         type: entry.bottomType,
         quantity: entry.pantQty,
         });
      }

        // CREATE ORDER FIRST
      const orderRes = await axios.post(
        `${API}/customers/${identifier}/orders`,
           { garments }
         );

       const order = orderRes.data;
      console.log("Order created:", order);

    for (const entry of entries) {
      const groupId =
        Date.now().toString() + Math.floor(Math.random() * 1000);

      const bottomType = entry.bottomType.toLowerCase();
      const topType = entry.topType.toLowerCase();

      // save bottom
      await axios.post(
        `${API}/customers/${identifier}/measurements`,
        {
          type: bottomType,
          data: { ...entry.pant, garment: entry.bottomType, groupId },
          comments: entry.pantComments,
          quantity: entry.pantQty,
        }
      );

      // save top
      await axios.post(
        `${API}/customers/${identifier}/measurements`,
        {
          type: topType,
          data: { ...entry.shirt, garment: entry.topType, groupId },
          comments: entry.shirtComments,
          quantity: entry.shirtQty,
        }
      );

      // 👇 collect billing info
      billingItems.push({
        type: entry.bottomType,
        quantity: entry.pantQty,
      });

      billingItems.push({
        type: entry.topType,
        quantity: entry.shirtQty,
      });
    }

    alert("✅ Measurements saved");

  

      setTimeout(() => {
        navigate("/dashboard/print-measurements", {
        state: {
          customer: resolvedCustomer,
          entries: snapshotEntries,
          orderId: order.id,
          orderDate: new Date().toISOString(),
          billingItems,
        },
      });
      }, 500);


  } catch (err) {
    console.error(err);
    alert("Failed to save measurements");
  }
};

const handleCancel = async () => {
  try {
    if (resolvedCustomer?.id || resolvedCustomer?.customerCode) {
      const identifier =
        resolvedCustomer.customerCode || resolvedCustomer.id;

      await axios.delete(`/customers/${identifier}`);
    }
  } catch (err) {
    console.error("Error deleting customer:", err);
  }

  navigate("/dashboard/customers");
};


  // Helper to render a field (input or select) for pant
  const renderPantField = (entryIndex, name, label) => {
    const entry = entries[entryIndex];
    if (name === "position") {
      return (
        <select
          name={name}
          value={entry.pant[name]}
          onChange={(e) => handlePantChange(entryIndex, e)}
          className="border p-1 rounded w-24 focus:ring-2 focus:ring-indigo-400"
          onKeyDown={handleEnterKey}
          ref={addInputRef}
        >
          {POSITION_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
      autoComplete="off"
        type="text"
        name={name}
        value={entry.pant[name]}
        onChange={(e) => handlePantChange(entryIndex, e)}
        className={inputStyle}
        onKeyDown={handleEnterKey}
        ref={addInputRef}
      />
    );
  };

  // Helper to render a field (input or select) for shirt
  const renderShirtField = (entryIndex, name, label) => {
    const entry = entries[entryIndex];

    if (name === "shirtType") {
      return (
        <select
          name={name}
          value={entry.shirt[name]}
          onChange={(e) => handleShirtChange(entryIndex, e)}
          className="border p-1 rounded w-28 focus:ring-2 focus:ring-indigo-400"
          onKeyDown={handleEnterKey}
          ref={addInputRef}
        >
          {SHIRT_TYPE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (name === "collarType") {
      return (
        <select
          name={name}
          value={entry.shirt[name]}
          onChange={(e) => handleShirtChange(entryIndex, e)}
          className="border p-1 rounded w-24 focus:ring-2 focus:ring-indigo-400"
          onKeyDown={handleEnterKey}
          ref={addInputRef}
        >
          {COLLAR_TYPE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
      autoComplete="off"
        type="text"
        name={name}
        value={entry.shirt[name]}
        onChange={(e) => handleShirtChange(entryIndex, e)}
        className={inputStyle}
        onKeyDown={handleEnterKey}
        ref={addInputRef}
      />
    );
  };

  const pantFields = [
    { name: "position", label: "Waist Position (from Navel)" },
    { name: "length", label: "Length" },
    { name: "waist", label: "Waist" },
    { name: "hip", label: "Hip" },
    { name: "thigh", label: "Thigh" },
    { name: "knee", label: "Knee" },
    { name: "bottom", label: "Bottom" },
    { name: "chain", label: "Chain" },
  ];

  const shirtFields = [
    { name: "shirtType", label: "Shirt Type" },
    { name: "length", label: "Length" },
    { name: "chest", label: "Chest" },
    { name: "stomach", label: "Stomach" },
    { name: "front1", label: "Front 1" },
    { name: "front2", label: "Front 2" },
    { name: "front3", label: "Front 3" },
    { name: "shoulder", label: "Shoulder" },
    { name: "sleeve", label: "Sleeve" },
    { name: "sleeveLoosing", label: "Sleeve Loosing" },
    { name: "collar", label: "Collar" },
    { name: "collarType", label: "Collar Type" },
  ];

    useEffect(() => {
  const style = document.createElement("style");
        style.innerHTML = `
          @media print {
            body * { visibility: hidden; }
            #print-area, #print-area * { visibility: visible; }
            #print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .page {
              page-break-after: always;
              width: 148mm;
              min-height: 210mm;
              padding: 10mm;
            }
          }
        `;
        document.head.appendChild(style);

        return () => document.head.removeChild(style);
      }, []);


  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-700">
        Measurements for {resolvedCustomer.name} ({resolvedCustomer.phone}) —{" "}
        <span className="text-indigo-600 font-semibold">
          ID: {resolvedCustomer.customerCode}
        </span>
      </h1>

      <form onSubmit={handleSaveAll} autoComplete="off" className="space-y-6">
        {entries.map((entry, index) => (
          <div key={index} className="grid md:grid-cols-2 gap-6">
            {/* Bottom Panel */}
            <div className="bg-white p-4 rounded-xl shadow space-y-3">
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-indigo-600 text-lg">
                    Bottom
                  </h2>
                  <span className="text-xs text-gray-500">
                    Set {index + 1}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Type</label>
                  <select
                    className="border p-1 rounded"
                    value={entry.bottomType}
                    onChange={(e) =>
                      handleBottomTypeChange(index, e.target.value)
                    }
                  >
                    {BOTTOM_OPTIONS.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Qty</label>
                  <input
                  autoComplete="off"
                    type="number"
                    className={inputStyle}
                    value={entry.pantQty}
                    onChange={(e) =>
                      handlePantQtyChange(index, e.target.value)
                    }
                    onKeyDown={handleEnterKey}
                    ref={addInputRef}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {pantFields.map(({ name, label }) => (
                  <div key={name} className="flex items-center gap-2">
                    <label className="w-24 text-xs md:text-sm text-gray-700">
                        {label}
                        {REQUIRED_PANT_FIELDS.includes(name) && (
                         <span className="text-red-500 ml-1">*</span>
                       )}
                    </label>
                    {renderPantField(index, name, label)}
                  </div>
                ))}
              </div>

              {entry.extraPant.map((ex, i) => (
                <div key={i} className="flex items-center gap-2 mt-1">
                  <input
                    autoComplete="off"
                    type="text"
                    placeholder="Label"
                    value={ex.label}
                    onChange={(e) =>
                      handleExtraPantChange(index, i, "label", e.target.value)
                    }
                    className="border p-1 rounded w-24"
                    onKeyDown={handleEnterKey}
                    ref={addInputRef}
                  />
                  <input
                    autoComplete="off"
                    type="text"
                    placeholder="Value"
                    value={ex.value}
                    onChange={(e) =>
                      handleExtraPantChange(index, i, "value", e.target.value)
                    }
                    className={inputStyle}
                    onKeyDown={handleEnterKey}
                    ref={addInputRef}
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={() => addExtraPant(index)}
                className="text-sm text-indigo-600 hover:underline mt-1"
              >
                + Add extra field
              </button>

              <textarea
                placeholder="Comments"
                value={entry.pantComments}
                onChange={(e) =>
                  handlePantCommentsChange(index, e.target.value)
                }
                className="w-full border p-2 rounded mt-2"
                rows={3}
                onKeyDown={handleEnterKey}
                ref={addInputRef}
              />
            </div>

            {/* Top Panel */}
            <div className="bg-white p-4 rounded-xl shadow space-y-3">
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-indigo-600 text-lg">
                    Top
                  </h2>
                  <span className="text-xs text-gray-500">
                    Set {index + 1}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Type</label>
                  <select
                    className="border p-1 rounded"
                    value={entry.topType}
                    onChange={(e) =>
                      handleTopTypeChange(index, e.target.value)
                    }
                  >
                    {TOP_OPTIONS.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Qty</label>
                  <input
                    autoComplete="off"
                    type="number"
                    className={inputStyle}
                    value={entry.shirtQty}
                    onChange={(e) =>
                      handleShirtQtyChange(index, e.target.value)
                    }
                    onKeyDown={handleEnterKey}
                    ref={addInputRef}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {shirtFields.map(({ name, label }) => (
                  <div key={name} className="flex items-center gap-2">
                    <label className="w-28 text-xs md:text-sm text-gray-700">
                      {label}
                      {REQUIRED_SHIRT_FIELDS.includes(name) && (
                         <span className="text-red-500 ml-1">*</span>
                 )}
                    </label>
                    {renderShirtField(index, name, label)}
                  </div>
                ))}
              </div>

              {entry.extraShirt.map((ex, i) => (
                <div key={i} className="flex items-center gap-2 mt-1">
                  <input
                    autoComplete="off"
                    type="text"
                    placeholder="Label"
                    value={ex.label}
                    onChange={(e) =>
                      handleExtraShirtChange(index, i, "label", e.target.value)
                    }
                    className="border p-1 rounded w-24"
                    onKeyDown={handleEnterKey}
                    ref={addInputRef}
                  />
                  <input
                    autoComplete="off"
                    type="text"
                    placeholder="Value"
                    value={ex.value}
                    onChange={(e) =>
                      handleExtraShirtChange(index, i, "value", e.target.value)
                    }
                    className={inputStyle}
                    onKeyDown={handleEnterKey}
                    ref={addInputRef}
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={() => addExtraShirt(index)}
                className="text-sm text-indigo-600 hover:underline mt-1"
              >
                + Add extra field
              </button>

              <textarea
                placeholder="Comments"
                value={entry.shirtComments}
                onChange={(e) =>
                  handleShirtCommentsChange(index, e.target.value)
                }
                className="w-full border p-2 rounded mt-2"
                rows={3}
                onKeyDown={handleEnterKey}
                ref={addInputRef}
              />
            </div>
          </div>
        ))}

        {/* Bottom controls row */}
        <div className="flex justify-end gap-4 mt-4">
          {/* <button
            type="button"
            onClick={handleAddMore}
            className="bg-white border border-indigo-500 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 text-sm"
          >
            + Add More
          </button> */}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500"
            >
              Cancel
            </button>
           
           <button
              type="submit"
              ref={saveButtonRef}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
    
  );
}
