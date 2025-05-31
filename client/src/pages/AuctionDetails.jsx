import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../assets/auctionDetails.css";

export default function AuctionDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      alert('Please log in to view auction details.');
      navigate('/login');
      return;
    }

    const fetchAuction = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found.');
        }

        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/auctions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAuction(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching auction:", err);
        if (err.response?.status === 401) {
          alert('Unauthorized: Please log in again.');
          localStorage.removeItem('token');
          navigate('/login');
        } else if (err.response?.status === 404) {
          setError('Auction not found.');
        } else {
          setError('Failed to fetch auction details. Please try again.');
        }
      }
    };

    fetchAuction();
  }, [id, user, navigate]);

  if (!auction && !error) return <p className="loading">Loading auction…</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="auction-details">
      <button className="btn back-btn" onClick={() => navigate("/dashboard")}>
        ← Back to Auctions
      </button>

      {/* Auction Main Card */}
      <div className="auction-card">
        <div className="auction-image-wrapper">
          {auction.image && (
            <img
              className="auction-image"
              src={`http://localhost:8081/uploads/${auction.image}`}
              alt={auction.title}
              onError={(e) => (e.target.style.display = "none")}
            />
          )}
        </div>
        <div className="auction-content">
          <h1 className="meta-title">{auction.title}</h1>
          <p className="meta-description">{auction.description || 'No description available'}</p>
          <div className="meta-dates">
            <div><span className="label">Start:</span> {new Date(auction.startDate).toLocaleDateString()}</div>
            <div><span className="label">End:</span> {new Date(auction.endDate).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Lots Section */}
      <h2 className="section-title">Lots in this Auction</h2>
      {auction.lots?.length > 0 ? (
        <div className="lots-container">
          {auction.lots.map(lot => (
            <div key={lot._id} className="lot-card">
              {lot.image && (
                <img
                  className="lot-image"
                  src={`http://localhost:8081/uploads/${lot.image}`}
                  alt={`Lot ${lot.lotNumber || 'Unknown'}`}
                />
              )}
              <div className="lot-body">
                <p><strong>Lot No:</strong> {lot.lotNumber || 'N/A'}</p>
                <p><strong>Title:</strong> {lot.title || 'Untitled'}</p>
                <p><strong>Category:</strong> {lot.artist || 'Unknown'} ({lot.yearProduced || 'N/A'})</p>
                <p><strong>Size:</strong> {lot.description || 'No description'}</p>
              </div>
              <div className="lot-footer">
                <span className="lot-price">
                  <strong>Est.:</strong> £{lot.estimatedPrice ? lot.estimatedPrice.toLocaleString() : 'N/A'}
                </span>
                {user.role === 'admin' || user.role === 'seller' ? (
                  <button className="btn edit-btn" onClick={() => navigate(`/edit-lot/${lot._id}`)}>
                    Edit
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-lots">No lots available yet.</p>
      )}
    </div>
  );
}