// src/pages/AdminRates.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminRates() {
  const [rates, setRates] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchRates(); }, []);

  const fetchRates = async () => {
    try {
      const res = await axios.get("/api/rates");
      setRates(res.data || {});
    } catch (err) { console.error(err); }
  };

  const update = (k, v) => setRates((r) => ({ ...r, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await axios.put("/api/rates", rates);
      alert("Rates updated (in-memory).");
    } catch (err) { console.error(err); alert("Failed to save rates."); }
    setSaving(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin — Rates</h1>
      <div className="bg-white rounded p-4 space-y-3 max-w-md">
        {Object.keys(rates).map((k) => (
          <div key={k} className="flex items-center gap-3">
            <div className="w-40">{k}</div>
            <input type="number" value={rates[k]} onChange={(e) => update(k, e.target.value)} className="border p-1 rounded w-32" />
          </div>
        ))}
        <div className="mt-3">
          <button onClick={save} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded">Save Rates</button>
        </div>
      </div>
    </div>
  );
}
