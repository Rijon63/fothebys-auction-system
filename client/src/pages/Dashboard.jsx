import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../assets/dashboard.css";
import { FaSearch, FaSignOutAlt, FaUser, FaPlus, FaGavel, FaUsers, FaFileAlt, FaThList, FaHeart } from "react-icons/fa";
import api from "../utils/axios.config";

export default function Dashboard() {
  const [auctions, setAuctions] = useState([]);
  const [favoriteAuctions, setFavoriteAuctions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const fetchAuctions = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to continue.");
        navigate("/login");
        return;
      }
      const response = await api.get("/api/auctions", {
        params: { category: categoryFilter },
      });
      setAuctions(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching auctions:", error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, navigate]);

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
    console.log('User details:', user); // Debug log
    fetchAuctions();
    if (user?.role === "buyer" && user?.clientId) {
      fetchFavoriteAuctions();
    }
  }, [categoryFilter, user, fetchAuctions, fetchFavoriteAuctions]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleError = (error) => {
    if (error.response?.status === 401) {
      alert("Unauthorized: Please log in again.");
      localStorage.removeItem("token");
      navigate("/login");
    } else if (error.response?.status === 404) {
      alert("Auctions endpoint not found. Please contact support.");
    } else {
      alert("Failed to fetch auctions: " + (error.response?.data?.error || "Server error."));
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleNavigation = (path) => navigate(path);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this auction?")) {
      try {
        await api.delete(`/api/auctions/${id}`);
        alert("Auction deleted!");
        fetchAuctions();
      } catch (error) {
        console.error("Delete error:", error);
        handleError(error);
      }
    }
  };

  const handleBuyAuction = async (auctionId) => {
    const amount = window.prompt("Enter total sale price for the auction:");
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return alert("Please enter a valid sale price.");
    }
    try {
      const token = localStorage.getItem("token");
      if (!user?.clientId) {
        throw new Error("User client ID is missing.");
      }

      // Fetch client data
      console.log('Fetching client for clientId:', user.clientId); // Debug log
      const clientResponse = await api.get(`/api/clients/by-user-clientid/${user.clientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const clientObjectId = clientResponse.data._id;
      if (!clientObjectId) {
        throw new Error("Client ID not found in response.");
      }

      // Buy the auction
      await api.put(
        `/api/auctions/buy/${auctionId}`,
        {
          salePrice: Number(amount),
          buyerId: clientObjectId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Auction purchased successfully!");
      fetchAuctions();
      if (user?.role === "buyer") {
        fetchFavoriteAuctions();
      }
    } catch (error) {
      console.error("Buy auction failed:", error);
      const errorMessage =
        error.response?.status === 404
          ? "Client or auction not found. Please ensure your account is properly set up or contact support."
          : error.response?.data?.error || error.message || "Please try again.";
      alert(`Failed to buy auction: ${errorMessage}`);
    }
  };

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

  const filteredAuctions = auctions.filter((auction) =>
    auction.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <input
          type="text"
          placeholder="Search auctions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          className="search-input"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Drawings">Drawings</option>
          <option value="Paintings">Paintings</option>
          <option value="Photographic Images">Photographic Images</option>
          <option value="Sculptures">Sculptures</option>
          <option value="Carvings">Carvings</option>
        </select>
        {(user?.role === "admin" || user?.role === "seller") && (
          <>
            <button className="sidebar-btn" onClick={() => handleNavigation("/create-auction")}>
              <FaPlus /> Create Auction
            </button>
            <button className="sidebar-btn" onClick={() => handleNavigation("/create-lot")}>
              <FaGavel /> Create Lot
            </button>
          </>
        )}
        {user?.role === "admin" && (
          <button className="sidebar-btn" onClick={() => handleNavigation("/clients")}>
            <FaUsers /> Clients
          </button>
        )}
        <button className="sidebar-btn" onClick={() => handleNavigation("/lots-dashboard")}>
          <FaThList /> Lots Dashboard
        </button>
        <button className="sidebar-btn" onClick={() => handleNavigation("/commission-bids")}>
          <FaGavel /> Commission Bids
        </button>
        <button className="sidebar-btn" onClick={() => handleNavigation("/client-portal")}>
          <FaUser /> My Portal
        </button>
        <button className="sidebar-btn" onClick={() => handleNavigation("/advanced-search")}>
          <FaSearch /> Advanced Search
        </button>
        {user?.role === "buyer" && (
          <button className="sidebar-btn" onClick={() => handleNavigation("/favorites")}>
            <FaHeart /> My Favorites
          </button>
        )}
        {user?.role === "admin" && (
          <button className="sidebar-btn" onClick={() => handleNavigation("/reports")}>
            <FaFileAlt /> Reports
          </button>
        )}
        <div className="auth-section">
          <span className="welcome-text">Welcome, {user?.username || user?.fullName}</span>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>
      <main className="dashboard-content">
        <h2 className="dashboard-title">Auction Dashboard</h2>
        {loading ? (
          <p>Loading auctions...</p>
        ) : error ? (
          <div className="error-message">Error: {error}</div>
        ) : filteredAuctions.length === 0 ? (
          <p>No auctions found.</p>
        ) : (
          <div className="auction-list">
            {filteredAuctions.map((auction) => (
              <div
                key={auction._id}
                className="auction-card"
                onClick={() => handleNavigation(`/auction/${auction._id}`)}
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
                  {(user?.role === "admin" || (user?.role === "seller" && auction.creatorId === user._id)) && (
                    <>
                      <button className="edit-btn" onClick={() => handleNavigation(`/edit-auction/${auction._id}`)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(auction._id)}>Delete</button>
                    </>
                  )}
                  {auction.salePrice ? (
                    <span className="sold-label">Sold</span>
                  ) : (
                    user?.role === "buyer" && (
                      <>
                        <button className="buy-btn" onClick={() => handleBuyAuction(auction._id)}>Buy</button>
                        <button
                          className={`favorite-btn ${favoriteAuctions.some((fav) => fav._id === auction._id) ? 'favorited' : ''}`}
                          onClick={() => handleToggleFavorite(auction._id)}
                        >
                          <FaHeart /> {favoriteAuctions.some((fav) => fav._id === auction._id) ? 'Unfavorite' : 'Favorite'}
                        </button>
                      </>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}