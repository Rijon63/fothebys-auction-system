import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../utils/axios.config";
import "../assets/clients.css";

export default function Clients() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      alert("Please log in to access the clients page.");
      navigate("/login");
      return;
    }
    if (user.role !== "admin") {
      alert("Only admins can access the clients page.");
      navigate("/dashboard");
      return;
    }
    fetchClients();
  }, [user, navigate]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found.");
      }
      console.log("Fetching clients with token:", token);
      const response = await axios.get("/api/clients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching clients:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        alert("Unauthorized: Please log in again.");
        logout();
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Failed to fetch clients: " + (err.response?.data?.error || "Please try again."));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (path) => navigate(path);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/api/clients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Client deleted!");
        fetchClients();
      } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete client: " + (error.response?.data?.error || "Please try again."));
      }
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="clients-container">
      <h2>Clients Management</h2>
      {error && <p className="error-message">{error}</p>}
      {loading ? (
        <p>Loading clients...</p>
      ) : clients.length === 0 ? (
        <p>No clients found.</p>
      ) : (
        <div className="clients-list">
          {clients.map((client) => (
            <div key={client._id} className="client-card">
              <p>
                <strong>Name:</strong> {client.fullName}
              </p>
              <p>
                <strong>Email:</strong> {client.email}
              </p>
              <p>
                <strong>Type:</strong> {client.type}
              </p>
              <p>
                <strong>Phone:</strong> {client.phone || "N/A"}
              </p>
              <p>
                <strong>Address:</strong> {client.address || "N/A"}
              </p>
              <div className="client-actions">
                <button
                  className="edit-btn"
                  onClick={() => handleNavigation(`/edit-client/${client._id}`)}
                >
                  Edit
                </button>
                <button className="delete-btn" onClick={() => handleDelete(client._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        Back to Dashboard
      </button>
    </div>
  );
}