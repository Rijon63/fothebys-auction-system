import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaHeart } from "react-icons/fa";
import api from "../utils/axios.config";
import "../assets/dashboard.css";

export default function Favorites() {
  const [favoriteAuctions, setFavoriteAuctions] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchFavoriteAuctions = useCallback(async () => {
    if (!user?.clientId) {
      console.error("No clientId found for user:", user);
      alert("Unable to fetch favorites: User ID is missing.");
      return;
    }
    console.log('Fetching favorites for clientId:', user.clientId); // Debug log
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/api/auctions/favorites/${user.clientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavoriteAuctions(response.data);
    } catch (error) {
      console.error("Error fetching favorite auctions:", error);
      alert("Failed to fetch favorite auctions: " + (error.response?.data?.error || "Please try again."));
    }
  }, [user?.clientId]);

  useEffect(() => {
    if (user?.role === "buyer" && user?.clientId) {
      fetchFavoriteAuctions();
    }
  }, [fetchFavoriteAuctions, user]);

  const handleToggleFavorite = async (auctionId) => {
    try {
      const isFavorited = favoriteAuctions.some((auction) => auction._id === auctionId);
      if (isFavorited) {
        await api.delete(`/api/auctions/${auctionId}/favorite`);
        alert("Auction removed from favorites!");
      } else {
        await api.post(`/api/auctions/${auctionId}/favorite`);
        alert("Auction added to favorites!");
      }
      fetchFavoriteAuctions();
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Failed to toggle favorite: " + (error.response?.data?.error || "Please try again."));
    }
  };

  if (user?.role !== "buyer") {
    return (
      <div className="dashboard-container">
        <main className="dashboard-content">
          <p>Access restricted to buyers.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <main className="dashboard-content">
        <h2 className="dashboard-title">My Favorites</h2>
        {favoriteAuctions.length === 0 ? (
          <p>No favorite auctions yet.</p>
        ) : (
          <div className="auction-list">
            {favoriteAuctions.map((auction) => (
              <div
                key={auction._id}
                className="auction-card"
                onClick={() => navigate(`/auction/${auction._id}`)}
              >
                {auction.image && (
                  <img
                    src={`http://localhost:8081/uploads/${auction.image}`}
                    alt={auction.title}
                    className="auction-image"
                  />
                )}
                <h3>{auction.title}</h3>
                <p>{auction.description}</p>
                <p><strong>Category:</strong> {auction.category}</p>
                <p><strong>Start:</strong> {new Date(auction.startDate).toLocaleDateString()}</p>
                <p><strong>End:</strong> {new Date(auction.endDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {auction.salePrice ? `Sold for £${auction.salePrice}` : "Available"}</p>
                <div className="auction-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className={`favorite-btn ${favoriteAuctions.some((fav) => fav._id === auction._id) ? 'favorited' : ''}`}
                    onClick={() => handleToggleFavorite(auction._id)}
                  >
                    <FaHeart /> {favoriteAuctions.some((fav) => fav._id === auction._id) ? 'Unfavorite' : 'Favorite'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}