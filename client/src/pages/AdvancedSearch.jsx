import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/axios.config";
import "../assets/advancedSearch.css";

export default function AdvancedSearch() {
  const [filters, setFilters] = useState({
    auctionTitle: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    startAuctionDate: "",
    endAuctionDate: "",
    subjectClassification: "",
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please log in.");
      }
      const response = await api.get("/api/search/advanced", {
        params: filters,
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(response.data);
    } catch (err) {
      console.error("Search failed:", err);
      setError(err.response?.data?.error || "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleResultClick = (lot) => {
    // Navigate to lot or auction details based on your app's routing
    navigate(`/auction/${lot.auctionId?._id || 'unknown'}`);
  };

  return (
    <div className="advanced-search-wrapper">
      <h2>Advanced Lot Search</h2>
      <form className="advanced-search-form" onSubmit={handleSubmit}>
        <input
          name="auctionTitle"
          value={filters.auctionTitle}
          onChange={handleChange}
          placeholder="Auction Name"
        />
        <input
          name="category"
          value={filters.category}
          onChange={handleChange}
          placeholder="Category"
        />
        <input
          name="subjectClassification"
          value={filters.subjectClassification}
          onChange={handleChange}
          placeholder="Subject Classification"
        />
        <input
          type="number"
          name="minPrice"
          value={filters.minPrice}
          onChange={handleChange}
          placeholder="Min Price"
        />
        <input
          type="number"
          name="maxPrice"
          value={filters.maxPrice}
          onChange={handleChange}
          placeholder="Max Price"
        />
        <label>Auction Date Range:</label>
        <input
          type="date"
          name="startAuctionDate"
          value={filters.startAuctionDate}
          onChange={handleChange}
        />
        <input
          type="date"
          name="endAuctionDate"
          value={filters.endAuctionDate}
          onChange={handleChange}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      <h3>Results</h3>
      {error && <div className="error-message">{error}</div>}
      <div className="search-results">
        {results.length > 0 ? (
          results.map((lot) => (
            <div
              key={lot._id}
              className="lot-card"
              onClick={() => handleResultClick(lot)}
            >
              {lot.image && (
                <img
                  src={`http://localhost:8081/uploads/${lot.image}`}
                  alt={lot.title}
                  className="lot-image"
                />
              )}
              <div className="lot-details">
                <h4>{lot.title}</h4>
                <p><strong>Auction:</strong> {lot.auctionId?.title || "No Auction Linked"}</p>
                <p><strong>Category:</strong> {lot.category || "N/A"}</p>
                <p><strong>Price Estimate:</strong> £{lot.estimatedPrice || "N/A"}</p>
                <p><strong>Subject:</strong> {lot.subjectClassification || "N/A"}</p>
                <p>
                  <strong>Auction Date:</strong>{" "}
                  {lot.auctionDate ? new Date(lot.auctionDate).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>No results found.</p>
        )}
      </div>
    </div>
  );
}