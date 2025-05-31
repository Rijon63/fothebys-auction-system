import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../assets/editAuction.css";

export default function EditAuction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [auction, setAuction] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    category: "",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch existing auction data
  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Please log in to continue.");
          navigate("/login");
          return;
        }

        const res = await axios.get(`http://localhost:8081/api/auctions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (user.role !== "admin" && res.data.creatorId !== user._id) {
          alert("You are not authorized to edit this auction.");
          navigate("/dashboard");
          return;
        }

        setAuction({
          title: res.data.title,
          description: res.data.description,
          startDate: res.data.startDate ? res.data.startDate.substring(0, 10) : "",
          endDate: res.data.endDate ? res.data.endDate.substring(0, 10) : "",
          category: res.data.category,
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching auction:", err);
        if (err.response?.status === 401) {
          alert("Unauthorized: Please log in again.");
          navigate("/login");
        } else if (err.response?.status === 403) {
          alert("You are not authorized to access this auction.");
          navigate("/dashboard");
        } else {
          alert("Failed to load auction.");
          navigate("/dashboard");
        }
      }
    };
    fetchAuction();
  }, [id, user, navigate]);

  const handleChange = (e) => {
    setAuction({ ...auction, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", auction.title);
    formData.append("description", auction.description);
    formData.append("startDate", auction.startDate);
    formData.append("endDate", auction.endDate);
    formData.append("category", auction.category);
    if (image) formData.append("image", image);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to continue.");
        navigate("/login");
        return;
      }

      await axios.put(`http://localhost:8081/api/auctions/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Auction updated!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error updating auction:", err);
      if (err.response?.status === 401) {
        alert("Unauthorized: Please log in again.");
        navigate("/login");
      } else if (err.response?.status === 403) {
        alert("You are not authorized to update this auction.");
        navigate("/dashboard");
      } else {
        alert("Failed to update auction: " + (err.response?.data?.error || "Please try again."));
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="edit-auction-wrapper">
      <h2>Edit Auction</h2>
      <form className="edit-auction-form" onSubmit={handleSubmit}>
        <input
          className="form-input"
          name="title"
          value={auction.title}
          onChange={handleChange}
          placeholder="Title"
          required
        />
        <textarea
          className="form-textarea"
          name="description"
          value={auction.description}
          onChange={handleChange}
          placeholder="Description"
        />
        <input
          className="form-input"
          type="date"
          name="startDate"
          value={auction.startDate}
          onChange={handleChange}
          required
        />
        <input
          className="form-input"
          type="date"
          name="endDate"
          value={auction.endDate}
          onChange={handleChange}
          required
        />
        <select
          className="form-input"
          name="category"
          value={auction.category}
          onChange={handleChange}
          required
        >
          <option value="" disabled>Select Category</option>
          <option value="Drawings">Drawings</option>
          <option value="Paintings">Paintings</option>
          <option value="Photographic Images">Photographic Images</option>
          <option value="Sculptures">Sculptures</option>
          <option value="Carvings">Carvings</option>
        </select>
        <input
          className="form-input"
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
          accept="image/*"
        />
        <button className="form-button" type="submit">
          Update Auction
        </button>
      </form>
    </div>
  );
}