import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../utils/axios.config";
import "../assets/clientPortal.css";

export default function ClientPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [commissionBids, setCommissionBids] = useState([]);
  const [boughtLots, setBoughtLots] = useState([]);
  const [pendingSales, setPendingSales] = useState([]);
  const [wonAuctions, setWonAuctions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      alert("Please log in to access the client portal.");
      navigate("/login");
      return;
    }
    if (user.role !== "buyer") {
      alert("Only buyers can access the client portal.");
      navigate("/dashboard");
      return;
    }
    if (!user.clientId) {
      alert("Buyer account not properly configured. Please contact support.");
      navigate("/dashboard");
      return;
    }
    fetchCommissionBids();
    fetchBoughtLots();
    fetchPendingSales();
    fetchWonAuctions();
  }, [user, navigate]);

  const fetchCommissionBids = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found.");
      }
      const { data } = await axios.get(`/api/commission-bids/client/${user.clientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCommissionBids(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching commission bids:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        alert("Unauthorized: Please log in again.");
        logout();
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Failed to fetch commission bids: " + (err.response?.data?.error || "Please try again."));
      }
    }
  };

  const fetchBoughtLots = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found.");
      }
      const { data } = await axios.get(`/api/lots/bought/${user.clientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBoughtLots(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching bought lots:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        alert("Unauthorized: Please log in again.");
        logout();
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Failed to fetch bought lots: " + (err.response?.data?.error || "Please try again."));
      }
    }
  };

  const fetchPendingSales = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found.");
      }
      const { data } = await axios.get(`/api/lots/pending-sales/${user.clientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingSales(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching pending sales:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        alert("Unauthorized: Please log in again.");
        logout();
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Failed to fetch pending sales: " + (err.response?.data?.error || "Please try again."));
      }
    }
  };

  const fetchWonAuctions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found.");
      }
      const { data } = await axios.get(`/api/auctions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const won = data.filter(
        (auction) => auction.winnerId && auction.winnerId.toString() === user.clientId
      );
      setWonAuctions(won);
      setError(null);
    } catch (err) {
      console.error("Error fetching won auctions:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        alert("Unauthorized: Please log in again.");
        logout();
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Failed to fetch won auctions: " + (err.response?.data?.error || "Please try again."));
      }
    }
  };

  if (!user) return <p>Loading client portal...</p>;

  return (
    <div className="client-portal-wrapper">
      <h2>Welcome, {user.username}</h2>
      {error && <p className="error-message">{error}</p>}
      <section>
        <h3>Won Auctions</h3>
        {wonAuctions.length > 0 ? (
          wonAuctions.map((auction) => (
            <div key={auction._id} className="auction-card">
              <h4>{auction.title}</h4>
              <p>
                <strong>Winning Price:</strong> £{auction.highestBid || "N/A"}
              </p>
              <p>
                <strong>Date Won:</strong>{" "}
                {new Date(auction.biddingEndTime).toLocaleDateString()}
              </p>
              {auction.image && (
                <img
                  src={`http://localhost:8081/uploads/${auction.image}`}
                  alt={auction.title}
                  className="lot-image"
                  style={{ maxWidth: "100px", marginTop: "10px" }}
                />
              )}
            </div>
          ))
        ) : (
          <p>No won auctions yet.</p>
        )}
      </section>
      <section>
        <h3>My Bought Lots</h3>
        {boughtLots.length > 0 ? (
          boughtLots.map((lot) => (
            <div key={lot._id} className="lot-card">
              <p>
                <strong>Title:</strong> {lot.title}
              </p>
              <p>
                <strong>Sold Price:</strong> £{lot.salePrice}
              </p>
              {lot.image && (
                <img
                  src={`http://localhost:8081/uploads/${lot.image}`}
                  alt={lot.title}
                  className="lot-image"
                  style={{ maxWidth: "100px", marginTop: "10px" }}
                />
              )}
            </div>
          ))
        ) : (
          <p>No bought lots yet.</p>
        )}
      </section>
      <section>
        <h3>My Pending Sales</h3>
        {pendingSales.length > 0 ? (
          pendingSales.map((lot) => (
            <div key={lot._id} className="lot-card">
              <p>
                <strong>Title:</strong> {lot.title}
              </p>
              <p>
                <strong>Estimated Price:</strong> £{lot.estimatedPrice}
              </p>
              <p>
                <strong>Status:</strong> Awaiting sale
              </p>
              {lot.image && (
                <img
                  src={`http://localhost:8081/uploads/${lot.image}`}
                  alt={lot.title}
                  className="lot-image"
                  style={{ maxWidth: "100px", marginTop: "10px" }}
                />
              )}
            </div>
          ))
        ) : (
          <p>No pending sales.</p>
        )}
      </section>
      <section>
        <h3>My Commission Bids</h3>
        {commissionBids.length > 0 ? (
          commissionBids.map((bid) => (
            <div key={bid._id} className="bid-card">
              <p>
                <strong>Lot:</strong> {bid.lotId?.title || bid.lotId || "N/A"}
              </p>
              <p>
                <strong>Bid Amount:</strong> £{bid.bidAmount}
              </p>
            </div>
          ))
        ) : (
          <p>No commission bids placed yet.</p>
        )}
      </section>
    </div>
  );
}