import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../utils/axios.config";
import "../assets/editClient.css";

export default function EditClient() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams(); // Get client ID from URL
  const [client, setClient] = useState({
    fullName: "",
    email: "",
    type: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      alert("Please log in to access this page.");
      navigate("/login");
      return;
    }
    if (user.role !== "admin") {
      alert("Only admins can edit clients.");
      navigate("/dashboard");
      return;
    }
    fetchClient();
  }, [user, navigate, id]);

  const fetchClient = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found.");
      }
      const response = await axios.get(`/api/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClient({
        fullName: response.data.fullName || "",
        email: response.data.email || "",
        type: response.data.type || "",
        phone: response.data.phone || "",
        address: response.data.address || "",
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching client:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        alert("Unauthorized: Please log in again.");
        logout();
        localStorage.removeItem("token");
        navigate("/login");
      } else if (err.response?.status === 404) {
        setError("Client not found.");
      } else {
        setError("Failed to fetch client: " + (err.response?.data?.error || "Please try again."));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClient((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found.");
      }
      await axios.put(
        `/api/clients/${id}`,
        {
          fullName: client.fullName,
          email: client.email,
          type: client.type,
          phone: client.phone,
          address: client.address,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Client updated successfully!");
      navigate("/clients");
    } catch (err) {
      console.error("Error updating client:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        alert("Unauthorized: Please log in again.");
        logout();
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Failed to update client: " + (err.response?.data?.error || "Please try again."));
      }
    }
  };

  if (!user) return <p>Loading...</p>;
  if (loading) return <p>Loading client data...</p>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="edit-client-container">
      <h2>Edit Client</h2>
      <form onSubmit={handleSubmit} className="edit-client-form">
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={client.fullName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={client.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="type">Type</label>
          <select id="type" name="type" value={client.type} onChange={handleChange} required>
            <option value="">Select Type</option>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={client.phone}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            name="address"
            value={client.address}
            onChange={handleChange}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="save-btn">
            Save Changes
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/clients")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}