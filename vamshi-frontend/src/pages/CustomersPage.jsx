import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE;

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Load customers
  const loadCustomers = async (query = "") => {
    try {
      const res = await axios.get(`${API}/customers?q=${query}`);
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

  // Add new customer
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) return;

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API}/customers`, formData);

      navigate(`/dashboard/measurements/${res.data.customerCode}`, {
        state: res.data,
      });
    } catch (err) {
      console.error("Error creating customer:", err);
      alert("Failed to create customer.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = (cust) => {
    navigate(`/dashboard/measurements/${cust.customerCode}`, { state: cust });
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    loadCustomers(value);
  };

  return (
    <div>

      <h1 className="text-2xl font-bold text-gray-700 mb-4">Customers</h1>

      {/* Add Customer */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md max-w-lg mb-6"
      >
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Mobile Number</label>
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
            loading ? "bg-indigo-300" : "bg-indigo-600 hover:bg-indigo-700"
          } text-white px-6 py-2 rounded-lg`}
        >
          {loading ? "Adding..." : "Add Customer & Enter Measurements"}
        </button>
      </form>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full max-w-lg border p-2 rounded-lg focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Customer Table */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden">

        {customers.length === 0 ? (
          <p className="p-4 text-gray-500">No customers found.</p>
        ) : (

          <table className="w-full text-sm">

            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="p-3 text-left">Customer ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Phone</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((cust) => (
                <tr
                  key={cust.customerCode}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelectCustomer(cust)}
                >
                  <td className="p-3 font-mono text-indigo-600">
                    {cust.customerCode}
                  </td>

                  <td className="p-3">{cust.name}</td>

                  <td className="p-3">{cust.phone}</td>
                </tr>
              ))}
            </tbody>

          </table>

        )}

      </div>

    </div>
  );
}