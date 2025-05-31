import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../assets/commissionBids.css";

export default function CommissionBids() {
  const [clients, setClients] = useState([]);
  const [lots, setLots] = useState([]);
  const [formData, setFormData] = useState({
    clientId: "",
    lotId: "",
    maxBidAmount: "",
  });
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      alert("Please log in to place a commission bid.");
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found. Please log in again.");
        }

        // Fetch clients
        const clientsResponse = await axios.get("http://localhost:8081/api/clients", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClients(clientsResponse.data);

        // Fetch lots
        const lotsResponse = await axios.get("http://localhost:8081/api/lots", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLots(lotsResponse.data);

        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err.response?.data || err.message);
        if (err.response?.status === 401) {
          alert("Unauthorized: Please log in again.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          setError("Failed to load clients or lots. Please try again.");
        }
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please log in again.");
      }

      await axios.post("http://localhost:8081/api/commission-bids", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Commission bid placed!");
      setFormData({ clientId: "", lotId: "", maxBidAmount: "" });
    } catch (err) {
      console.error("Error placing bid:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        alert("Unauthorized: Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        alert("Failed to place bid: " + (err.response?.data?.error || "Please try again."));
      }
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="commission-bids-wrapper">
      <h2>Place Commission Bid</h2>
      {error && <p className="error-message">{error}</p>}
      <form className="commission-form" onSubmit={handleSubmit}>
        <select name="clientId" value={formData.clientId} onChange={handleChange} required>
          <option value="">Select Client</option>
          {clients.map(c => (
            <option key={c._id} value={c._id}>{c.fullName}</option>
          ))}
        </select>

        <select name="lotId" value={formData.lotId} onChange={handleChange} required>
          <option value="">Select Lot</option>
          {lots.map(l => (
            <option key={l._id} value={l._id}>{l.title}</option>
          ))}
        </select>

        <input
          type="number"
          name="maxBidAmount"
          placeholder="Max Bid Amount"
          value={formData.maxBidAmount}
          onChange={handleChange}
          required
        />

        <button type="submit">Place Bid</button>
      </form>
    </div>
  );
}