import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE;

/*
 MeasurementsListPage
 - Search by name/phone/ID (calls /api/measurements to get grouped sets)
 - "View all" opens modal that fetches /api/customers/:id/measurements (raw)
   and groups them into chronological sets (groupId preferred).
 - Modal renders each set as two form-like panels (Bottom | Top), newest first.
 - Print button prints each set on its own A5 page (CSS injected into new print window).
*/

export default function MeasurementsListPage() {
  const [sets, setSets] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalCustomer, setModalCustomer] = useState(null);
  const [modalSets, setModalSets] = useState([]); // grouped sets for selected customer
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    loadSets();
  }, []);

  const loadSets = async (q = "") => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await axios.get(`${API_BASE}/measurements`, { params: { q } });
      // backend may already return grouped "sets"; if so, use directly.
      // If backend returns flat list, this will be an empty/invalid case — handle gracefully.
      setSets(res.data || []);
    } catch (err) {
      console.error("Failed to load measurement sets:", err);
      setErrorMsg("Failed to load measurements");
      setSets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearch(q);
    loadSets(q);
  };

  // fetch all raw measurements for a customer and group them into sets (groupId preferred)
  const fetchCustomerMeasurementsAndGroup = async (customer) => {
    try {
      setModalLoading(true);
      setModalSets([]);
      const id = customer.customerCode || customer.id;
      const res = await axios.get(`${API_BASE}/customers/${id}/measurements`);
      const raw = (res.data || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // newest first

      // Group by groupId
      const byGroup = {};
      const ungrouped = [];
      for (const m of raw) {
        const groupId = m.data && typeof m.data === "object" ? m.data.groupId : undefined;
        if (groupId) {
          byGroup[groupId] = byGroup[groupId] || [];
          byGroup[groupId].push(m);
        } else {
          ungrouped.push(m);
        }
      }

      const result = [];

      // Build sets from explicit groups — convert each group array into a set {groupId, createdAt, top, bottom, raw}
      for (const gid of Object.keys(byGroup)) {
        const arr = byGroup[gid].slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const set = { groupId: gid, createdAt: arr[0].createdAt, top: null, bottom: null, raw: arr };
        for (const m of arr) {
          const t = (m.type || "").toString().toLowerCase();
          if (t.includes("top") || t === "shirt" || t === "kurta" || t === "sherwani" || t.includes("jacket")) {
            set.top = set.top ? (Array.isArray(set.top) ? [...set.top, m] : [set.top, m]) : m;
          } else {
            set.bottom = set.bottom ? (Array.isArray(set.bottom) ? [...set.bottom, m] : [set.bottom, m]) : m;
          }
        }
        result.push(set);
      }

      // Pair the remaining ungrouped sequentially (newest-first)
      // Strategy: iterate ungrouped (newest first) and attempt to pair top+bottom; if singletons remain, they stay alone.
      let i = 0;
      while (i < ungrouped.length) {
        const a = ungrouped[i];
        const b = ungrouped[i + 1];
        const set = { groupId: null, createdAt: a.createdAt, top: null, bottom: null, raw: [] };
        const ta = (a.type || "").toString().toLowerCase();
        if (ta.includes("top") || ta === "shirt" || ta === "kurta" || ta === "sherwani") set.top = a;
        else set.bottom = a;
        set.raw.push(a);

        if (b) {
          const tb = (b.type || "").toString().toLowerCase();
          // prefer to put b into the missing slot
          if (!set.top && (tb.includes("top") || tb === "shirt" || tb === "kurta")) {
            set.top = b;
            set.raw.push(b);
            i += 2;
          } else if (!set.bottom) {
            set.bottom = b;
            set.raw.push(b);
            i += 2;
          } else {
            // both filled (rare), move one-by-one
            i += 1;
          }
        } else {
          i += 1;
        }
        result.push(set);
      }

      // Sort result by createdAt desc (newest first)
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setModalSets(result);
    } catch (err) {
      console.error("Failed to load customer measurements for modal:", err);
      setModalSets([]);
    } finally {
      setModalLoading(false);
    }
  };

  const openModalForCustomer = async (customer) => {
    setModalCustomer(customer);
    setModalOpen(true);
    await fetchCustomerMeasurementsAndGroup(customer);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalCustomer(null);
    setModalSets([]);
  };

  // Render helpers
  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const getGarmentLabel = (m) => {
    if (!m) return "-";
    if (m.data && m.data.garment) return m.data.garment;
    return m.type || "-";
  };

  const getKeySummary = (m) => {
    if (!m || !m.data) return "-";
    const d = m.data;
    const parts = [];
    if (d.length) parts.push(`L:${d.length}`);
    if (d.waist) parts.push(`W:${d.waist}`);
    if (d.hip) parts.push(`Hip:${d.hip}`);
    if (d.chest) parts.push(`Chest:${d.chest}`);
    if (d.shoulder) parts.push(`Sh:${d.shoulder}`);
    return parts.join(" | ") || "-";
  };

 
// prints every measurement (each m in modalSets[].raw) as a separate A5 page
const navigate = useNavigate();

const handlePrintModalSets = () => {
  if (!modalCustomer || modalSets.length === 0) {
    alert("No measurements available to print.");
    return;
  }

  // Convert modalSets into entries format used by PrintMeasurementsPage
  const entries = modalSets.map((set) => {
    const pant = set.bottom?.data || {};
    const shirt = set.top?.data || {};

    return {
      bottomType: set.bottom?.type || "Pant",
      topType: set.top?.type || "Shirt",

      pant,
      shirt,

      pantComments: set.bottom?.comments || "",
      shirtComments: set.top?.comments || "",
    };
  });

  navigate("/dashboard/print-measurements", {
    state: {
      customer: modalCustomer,
      entries,
      orderDate: modalSets[0]?.raw?.[0]?.data?.orderDate || new Date(),
      deliveryDate: modalSets[0]?.raw?.[0]?.data?.deliveryDate || "",
      billingItems: [],
    },
  });
};



  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-700">Measurements</h1>

      <div className="flex gap-3 items-center">
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by customer name, phone, or ID..."
          className="w-full sm:w-96 border p-2 rounded-lg focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Modified</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Mobile</th>
              <th className="px-4 py-3 text-left">Type(s)</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Loading...</td></tr>
            ) : sets.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No measurement sets found.</td></tr>
            ) : (
              sets.map((s) => {
                const customer = (s.top && s.top.customer) || (s.bottom && s.bottom.customer) || null;
                const modified = s.createdAt || (s.raw && s.raw[0] && s.raw[0].createdAt) || "";
                const types = [];
                if (s.top) types.push(s.top.data?.garment || s.top.type || "Top");
                if (s.bottom) types.push(s.bottom.data?.garment || s.bottom.type || "Bottom");
                return (
                  <tr key={s.groupId || modified + (customer?.customerCode || Math.random())} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">{modified ? new Date(modified).toLocaleString() : "-"}</td>
                    <td className="px-4 py-3">{customer?.name || "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{customer?.phone || "-"}</td>
                    <td className="px-4 py-3">{types.join(" • ")}</td>
                    <td className="px-4 py-3 text-right">
                      {customer && <button onClick={() => openModalForCustomer(customer)} className="text-sm text-indigo-600 hover:underline">View all</button>}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: display grouped sets for selected customer */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-40 p-6 overflow-auto">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-6xl max-h-[90vh] overflow-auto p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-lg font-semibold">Measurements — {modalCustomer?.name}</h3>
                <div className="text-xs text-gray-500">{modalCustomer?.phone} • ID: <span className="font-mono">{modalCustomer?.customerCode}</span></div>
              </div>

              <div className="flex gap-2">
                <button onClick={handlePrintModalSets} className="px-3 py-1 bg-indigo-600 text-white rounded">Print</button>
                <button onClick={closeModal} className="px-3 py-1 bg-gray-200 rounded">Close</button>
              </div>
            </div>

            {modalLoading ? (
              <div className="text-gray-500">Loading sets...</div>
            ) : modalSets.length === 0 ? (
              <div className="text-gray-500">No measurements found for this customer.</div>
            ) : (
              <div className="space-y-4">
                {modalSets.map((s, idx) => {
                  const top = s.top || null;
                  const bottom = s.bottom || null;
                  const created = s.createdAt || (s.raw && s.raw[0] && s.raw[0].createdAt) || "";
                  const delivery = (s.raw && s.raw[0] && s.raw[0].data && s.raw[0].data.deliveryDate) || (top && top.data && top.data.deliveryDate) || (bottom && bottom.data && bottom.data.deliveryDate) || "";

                  return (
                    <div key={s.groupId || idx} className="border rounded p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-sm text-gray-600">Saved</div>
                          <div className="font-semibold">{created ? new Date(created).toLocaleString() : "-"}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Delivery date</div>
                          <div className="font-semibold">{delivery || "-"}</div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Bottom panel (form-like) */}
                        <div className="bg-white p-3 rounded shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-indigo-600">Bottom</h4>
                            <div className="text-xs text-gray-500">Qty: {bottom?.quantity ?? "-"}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {/* render same fields as your form */}
                            {["position","length","waist","hip","thigh","knee","bottom","chain"].map((k) => (
                              <div key={k} className="flex items-center gap-2 text-sm">
                                <div className="w-24 text-gray-600 capitalize">{k}</div>
                                <div className="font-medium">{bottom?.data?.[k] ?? "-"}</div>
                              </div>
                            ))}
                          </div>
                          {bottom?.comments && <div className="mt-2 text-sm"><strong>Notes:</strong> {bottom.comments}</div>}
                        </div>

                        {/* Top panel (form-like) */}
                        <div className="bg-white p-3 rounded shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-indigo-600">Top</h4>
                            <div className="text-xs text-gray-500">Qty: {top?.quantity ?? "-"}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {["shirtType","length","chest","stomach","front1","front2","front3","shoulder","sleeve","sleeveLoosing","collar","collarType"].map((k) => (
                              <div key={k} className="flex items-center gap-2 text-sm">
                                <div className="w-28 text-gray-600 capitalize">{k}</div>
                                <div className="font-medium">{top?.data?.[k] ?? "-"}</div>
                              </div>
                            ))}
                          </div>
                          {top?.comments && <div className="mt-2 text-sm"><strong>Notes:</strong> {top.comments}</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
