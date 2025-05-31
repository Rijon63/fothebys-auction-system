import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../assets/dashboard.css";

export default function LotsDashboard() {
  const [lots, setLots] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      alert("Please log in to view the dashboard.");
      navigate("/login");
      return;
    }

    fetchLots();
    fetchAuctions();
  }, [user, navigate]);

  const fetchLots = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
      const res = await axios.get("http://localhost:8081/api/lots", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLots(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching lots:", err);
      if (err.response?.status === 401) {
        alert("Unauthorized: Please log in again.");
        navigate("/login");
      } else if (err.response?.status === 403) {
        alert("You are not authorized to view lots.");
        navigate("/dashboard");
      } else {
        setError("Failed to fetch lots. Please try again.");
      }
    }
  };

  const fetchAuctions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
      const res = await axios.get("http://localhost:8081/api/auctions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuctions(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching auctions:", err);
      if (err.response?.status === 401) {
        alert("Unauthorized: Please log in again.");
        navigate("/login");
      } else {
        setError("Failed to fetch auctions. Please try again.");
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-lot/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this lot?")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
      await axios.delete(`http://localhost:8081/api/lots/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Lot deleted successfully.");
      fetchLots();
    } catch (err) {
      console.error("Delete error:", err);
      if (err.response?.status === 401) {
        alert("Unauthorized: Please log in again.");
        navigate("/login");
      } else if (err.response?.status === 403) {
        alert("You are not authorized to delete this lot.");
      } else {
        alert("Failed to delete lot: " + (err.response?.data?.error || "Please try again."));
      }
    }
  };

  const handleBuy = async (lotId) => {
    const amount = window.prompt("Enter your offer price:");
    if (!amount || isNaN(amount)) return alert("Invalid price.");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
      await axios.put(`http://localhost:8081/api/lots/buy/${lotId}`, {
        salePrice: Number(amount),
        buyerId: user.clientId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Lot purchased successfully.");
      fetchLots();
    } catch (err) {
      console.error("Buy failed:", err);
      if (err.response?.status === 401) {
        alert("Unauthorized: Please log in again.");
        navigate("/login");
      } else if (err.response?.status === 403) {
        alert("You are not authorized to purchase this lot.");
      } else {
        alert("Error completing purchase: " + (err.response?.data?.error || "Please try again."));
      }
    }
  };

  const getAuctionTitle = (id) => {
    const a = auctions.find((a) => a._id === id);
    return a ? a.title : "Unknown";
  };

  return (
    <div className="dashboard-wrapper">
      <h2 className="dashboard-title">Lots Dashboard</h2>
      {error && <p className="error-message">{error}</p>}
      {lots.length === 0 && !error ? (
        <p>No lots available.</p>
      ) : (
        <div className="auction-list">
          {lots.map((lot) => (
            <div key={lot._id} className="auction-card">
              {lot.image && (
                <img
                  src={`http://localhost:8081/uploads/${lot.image}`}
                  alt={lot.title}
                  className="auction-image"
                />
              )}
              <h3>{lot.title}</h3>
              <p>{lot.description}</p>
              <p><strong>Auction:</strong> {getAuctionTitle(lot.auctionId)}</p>
              <p><strong>Estimated Price:</strong> £{lot.estimatedPrice}</p>
              <p><strong>Status:</strong> {lot.salePrice ? `Sold for £${lot.salePrice}` : "Available"}</p>

              <div className="auction-actions">
                {(user?.role === "admin" || (user?.role === "seller" && lot.sellerId === user._id)) && (
                  <>
                    <button className="edit-btn" onClick={() => handleEdit(lot._id)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(lot._id)}>Delete</button>
                  </>
                )}

                {lot.salePrice ? (
                  <span className="sold-label">Sold</span>
                ) : (
                  user?.role === "buyer" && (
                    <button className="buy-btn" onClick={() => handleBuy(lot._id)}>Buy</button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}