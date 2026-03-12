import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Load customers from backend on mount
  const loadCustomers = async (query = "") => {
    try {
      const res = await axios.get(`http://localhost:4000/api/customers?q=${query}`);
      setCustomers(res.data);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Create new customer in backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    //vallidate phone number
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:4000/api/customers", formData);

      // ✅ Redirect directly to measurements page with backend ID (customerCode)
      navigate(`/dashboard/measurements/${res.data.customerCode}`, { state: res.data });
    } catch (err) {
      console.error("❌ Error creating customer:", err);
      alert("Failed to create customer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle selecting an existing customer
  const handleSelectCustomer = (cust) => {
    navigate(`/dashboard/measurements/${cust.customerCode}`, { state: cust });
  };

  // ✅ Search handler
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    loadCustomers(value);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-700 mb-4">Customers</h1>

      {/* Add Customer Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-lg mb-6"
      >
        <div className="mb-4">
          <label className="block mb-1 text-gray-700">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-gray-700">Mobile Number</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            maxLength={10}
            pattern="[0-9]{10}"
            onChange={handleChange}
            className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`${
            loading ? "bg-indigo-300" : "bg-indigo-500 hover:bg-indigo-600"
          } text-white px-6 py-2 rounded-lg transition`}
        >
          {loading ? "Adding..." : "Add Customer & Enter Measurements"}
        </button>
      </form>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search customers by name or ID..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full max-w-lg border p-2 rounded-lg focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Customer List */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Customer List</h2>
        {customers.length === 0 ? (
          <p className="text-gray-500">No customers found.</p>
        ) : (
          <ul className="bg-white shadow-md rounded-xl divide-y">
            {customers.map((cust) => (
              <li
                key={cust.customerCode}
                className="p-4 flex justify-between hover:bg-gray-50 cursor-pointer"
                onClick={() => handleSelectCustomer(cust)}
              >
                <div>
                  <p className="font-semibold">{cust.name}</p>
                  <p className="text-sm text-gray-600">{cust.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-indigo-600 font-mono">ID: {cust.customerCode}</p>
                  <button className="text-indigo-600 hover:underline text-sm">
                    Enter Measurements
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
