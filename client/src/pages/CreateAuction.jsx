import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../assets/CreateAuction.css";

export default function CreateAuction() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [biddingEndTime, setBiddingEndTime] = useState("");
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "buyer") {
      alert("You are not authorized to create auctions.");
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert('Only JPEG, JPG, PNG, or GIF images are allowed.');
        setImage(null);
        e.target.value = ''; // Clear the input
        return;
      }
      setImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) {
      console.log('Submission already in progress');
      return;
    }

    console.log('handleSubmit called'); // Debug log

    // Client-side validation
    if (!category) {
      alert("Please select a category.");
      return;
    }
    
    setIsSubmitting(true); // Disable further submissions

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("biddingEndTime", biddingEndTime);
    formData.append("creatorId", user._id);
    formData.append("category", category);
    if (image) formData.append("image", image);

    try {
      console.log('FormData:', Object.fromEntries(formData)); // Log form data
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8081/api/auctions", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Auction created!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating auction:", error.response?.data || error);
      if (error.response?.status === 401) {
        alert("Unauthorized: Please log in again.");
        navigate("/login");
      } else if (error.response?.status === 403) {
        alert("You are not authorized to create auctions.");
        navigate("/dashboard");
      } else {
        alert("Error creating auction: " + (error.response?.data?.error || "Please try again."));
      }
    } finally {
      setIsSubmitting(false); // Re-enable form
    }
  };

  return (
    <div className="create-auction-wrapper">
      <h2 className="form-title">Create Auction</h2>
      <form className="create-auction-form" onSubmit={handleSubmit}>
        <input
          className="form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
        <textarea
          className="form-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
        <input
          className="form-input"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <input
          className="form-input"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
        <input
          className="form-input"
          type="datetime-local"
          value={biddingEndTime}
          onChange={(e) => setBiddingEndTime(e.target.value)}
          placeholder="Bidding End Time"
          required
        />
        <select
          className="form-input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
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
          onChange={handleImageChange}
          accept=".jpg,.jpeg,.png,.gif"
        />
        <button
          className="form-button"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create'}
        </button>
      </form>
    </div>
  );
}