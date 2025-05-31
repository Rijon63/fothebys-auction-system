import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../assets/editLot.css";

export default function EditLot() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lot, setLot] = useState(null);
  const [formData, setFormData] = useState({
    lotNumber: "",
    title: "",
    artist: "",
    yearProduced: "",
    description: "",
    estimatedPrice: "",
    salePrice: "",
    image: null,
  });
  const [loading, setLoading] = useState(true);

  // Fetch lot data and check authorization
  useEffect(() => {
    if (!user) {
      alert("Please log in to continue.");
      navigate("/login");
      return;
    }
    if (user.role === "buyer") {
      alert("You are not authorized to edit lots.");
      navigate("/dashboard");
      return;
    }

    const fetchLot = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Please log in to continue.");
          navigate("/login");
          return;
        }
        const { data } = await axios.get(`http://localhost:8081/api/lots/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Check if user is authorized to edit the lot
        if (user.role !== "admin" && data.sellerId !== user._id) {
          alert("You are not authorized to edit this lot.");
          navigate("/dashboard");
          return;
        }

        setLot(data);
        setFormData({
          lotNumber: data.lotNumber,
          title: data.title,
          artist: data.artist,
          yearProduced: data.yearProduced || "",
          description: data.description || "",
          estimatedPrice: data.estimatedPrice || "",
          salePrice: data.salePrice || "",
          image: null,
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching lot:", err);
        if (err.response?.status === 401) {
          alert("Unauthorized: Please log in again.");
          navigate("/login");
        } else if (err.response?.status === 403) {
          alert("You are not authorized to access this lot.");
          navigate("/dashboard");
        } else {
          alert("Failed to load lot.");
          navigate("/dashboard");
        }
      }
    };
    fetchLot();
  }, [id, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = new FormData();
      updateData.append("lotNumber", formData.lotNumber);
      updateData.append("title", formData.title);
      updateData.append("artist", formData.artist);
      updateData.append("yearProduced", formData.yearProduced);
      updateData.append("description", formData.description);
      updateData.append("estimatedPrice", formData.estimatedPrice);
      updateData.append("salePrice", formData.salePrice);

      if (formData.image) {
        updateData.append("image", formData.image);
      }

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to continue.");
        navigate("/login");
        return;
      }

      await axios.put(`http://localhost:8081/api/lots/${id}`, updateData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Lot updated successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error updating lot:", err);
      if (err.response?.status === 401) {
        alert("Unauthorized: Please log in again.");
        navigate("/login");
      } else if (err.response?.status === 403) {
        alert("You are not authorized to update this lot.");
        navigate("/dashboard");
      } else {
        alert("Failed to update lot: " + (err.response?.data?.error || "Please try again."));
      }
    }
  };

  if (loading) return <p className="loading">Loading lot…</p>;

  return (
    <div className="edit-lot-container">
      <h2>Edit Lot</h2>
      <form className="edit-lot-form" onSubmit={handleSubmit}>
        <label>Lot Number:</label>
        <input
          type="text"
          name="lotNumber"
          value={formData.lotNumber}
          onChange={handleChange}
          required
        />

        <label>Title:</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <label>Artist:</label>
        <input
          type="text"
          name="artist"
          value={formData.artist}
          onChange={handleChange}
        />

        <label>Year Produced:</label>
        <input
          type="number"
          name="yearProduced"
          value={formData.yearProduced}
          onChange={handleChange}
        />

        <label>Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
        ></textarea>

        <label>Estimated Price (£):</label>
        <input
          type="number"
          name="estimatedPrice"
          value={formData.estimatedPrice}
          onChange={handleChange}
          required
        />

        <label>Sale Price (£):</label>
        <input
          type="number"
          name="salePrice"
          value={formData.salePrice}
          onChange={handleChange}
        />

        <label>Upload New Image (optional):</label>
        <input type="file" name="image" accept="image/*" onChange={handleFileChange} />

        <button className="btn save-btn" type="submit">
          Save Changes
        </button>
      </form>
    </div>
  );
}