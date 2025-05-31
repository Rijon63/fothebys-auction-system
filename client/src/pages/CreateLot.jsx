import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../assets/createLot.css";

export default function CreateLot() {
  const [lot, setLot] = useState({
    title: "",
    startingPrice: "",
    auctionId: "",
    lotNumber: "",
    artist: "",
    yearProduced: "",
    subjectClassification: "",
    description: "",
    auctionDate: "",
    estimatedPrice: "",
    category: "Painting",
    salePrice: "",
    dimensions: { height: "", length: "", width: "" },
    weight: "",
    framed: false,
    mediumOrMaterial: "",
    image: null,
  });
  const [auctions, setAuctions] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect buyers and fetch auctions
  useEffect(() => {
    if (!user) {
      alert("Please log in to continue.");
      navigate("/login");
      return;
    }
    if (user.role === "buyer") {
      alert("You are not authorized to create lots.");
      navigate("/dashboard");
      return;
    }

    const fetchAuctions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Please log in to continue.");
          navigate("/login");
          return;
        }
        const res = await axios.get("http://localhost:8081/api/auctions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAuctions(res.data.filter(auction => auction.creatorId === user._id || user.role === "admin"));
      } catch (err) {
        console.error("Error fetching auctions:", err);
        if (err.response?.status === 401) {
          alert("Unauthorized: Please log in again.");
          navigate("/login");
        } else {
          alert("Failed to fetch auctions.");
        }
      }
    };
    fetchAuctions();
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (["height", "length", "width"].includes(name)) {
      setLot(prev => ({
        ...prev,
        dimensions: { ...prev.dimensions, [name]: value ? parseFloat(value) : "" },
      }));
    } else {
      setLot(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleImageChange = (e) => {
    setLot(prev => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  const validateForm = () => {
    if (!lot.auctionId) return "Auction is required.";
    if (!lot.lotNumber.trim()) return "Lot Number is required.";
    if (!lot.title.trim()) return "Title is required.";
    if (!lot.artist.trim()) return "Artist is required.";
    if (!lot.yearProduced || isNaN(lot.yearProduced)) return "Year Produced must be a valid number.";
    if (!lot.subjectClassification) return "Subject Classification is required.";
    if (!lot.description.trim()) return "Description is required.";
    if (!lot.startingPrice || isNaN(lot.startingPrice)) return "Starting Price must be a valid number.";
    if (!lot.estimatedPrice || isNaN(lot.estimatedPrice)) return "Estimated Price must be a valid number.";
    if (["Painting", "Drawing", "Photographic Image", "Sculpture", "Carving"].indexOf(lot.category) === -1) {
      return "Invalid category.";
    }
    if ((lot.category === "Painting" || lot.category === "Drawing" || lot.category === "Photographic Image") && !lot.mediumOrMaterial.trim()) {
      return "Medium is required for this category.";
    }
    if ((lot.category === "Sculpture" || lot.category === "Carving") && !lot.mediumOrMaterial.trim()) {
      return "Material is required for this category.";
    }
    if (lot.salePrice && isNaN(lot.salePrice)) return "Sale Price must be a valid number.";
    if (lot.weight && isNaN(lot.weight)) return "Weight must be a valid number.";
    if (
      lot.dimensions.height && isNaN(lot.dimensions.height) ||
      lot.dimensions.length && isNaN(lot.dimensions.length) ||
      lot.dimensions.width && isNaN(lot.dimensions.width)
    ) {
      return "Dimensions must be valid numbers.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    const formData = new FormData();
    Object.keys(lot).forEach(key => {
      if (key === "dimensions") {
        if (lot.dimensions.height) formData.append("dimensions.height", parseFloat(lot.dimensions.height));
        if (lot.dimensions.length) formData.append("dimensions.length", parseFloat(lot.dimensions.length));
        if (lot.dimensions.width) formData.append("dimensions.width", parseFloat(lot.dimensions.width));
      } else if (key === "image" && lot.image) {
        formData.append("image", lot.image);
      } else if (key !== "salePrice" || lot[key]) { // Skip empty salePrice
        formData.append(key, lot[key]);
      }
    });
    formData.append("sellerId", user._id);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to continue.");
        navigate("/login");
        return;
      }
      const { data: created } = await axios.post("http://localhost:8081/api/lots", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Lot created successfully!");
      navigate(`/auction/${created.auctionId}`);
    } catch (error) {
      console.error("Error creating lot:", error);
      if (error.response?.status === 401) {
        alert("Unauthorized: Please log in again.");
        navigate("/login");
      } else if (error.response?.status === 403) {
        alert("You are not authorized to create lots.");
        navigate("/dashboard");
      } else if (
        error.response?.data?.message?.includes("duplicate key") &&
        error.response?.data?.message?.includes("lotNumber")
      ) {
        alert("Lot Number must be unique.");
      } else if (error.response?.status === 400 && error.response?.data?.error?.includes("Validation failed")) {
        alert(`Validation error: ${error.response.data.error}`);
      } else if (error.response?.status === 500) {
        alert("Server error: Failed to create lot. Please try again later.");
      } else {
        alert("Failed to create lot: " + (error.response?.data?.error || "Please check all required fields."));
      }
    }
  };

  return (
    <div className="create-lot-wrapper">
      <h2 className="create-lot-title">Create Lot</h2>
      <form className="create-lot-form" onSubmit={handleSubmit}>
        {/* Auction Selection */}
        <div className="form-group">
          <label>Auction</label>
          <select name="auctionId" value={lot.auctionId} onChange={handleChange} required>
            <option value="">Select Auction</option>
            {auctions.map(a => (
              <option key={a._id} value={a._id}>{a.title}</option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div className="form-group">
          <label>Title</label>
          <input type="text" name="title" value={lot.title} onChange={handleChange} required />
        </div>

        {/* Starting Price */}
        <div className="form-group">
          <label>Starting Price</label>
          <input type="number" name="startingPrice" value={lot.startingPrice} onChange={handleChange} required />
        </div>

        {/* Lot Number */}
        <div className="form-group">
          <label>Lot Number</label>
          <input type="text" name="lotNumber" value={lot.lotNumber} onChange={handleChange} required />
        </div>

        {/* Artist */}
        <div className="form-group">
          <label>Artist</label>
          <input type="text" name="artist" value={lot.artist} onChange={handleChange} required />
        </div>

        {/* Year Produced */}
        <div className="form-group">
          <label>Year Produced</label>
          <input type="number" name="yearProduced" value={lot.yearProduced} onChange={handleChange} required />
        </div>

        {/* Sale Price */}
        <div className="form-group">
          <label>Sale Price (leave empty if not sold yet)</label>
          <input type="number" name="salePrice" value={lot.salePrice} onChange={handleChange} />
        </div>

        {/* Subject Classification */}
        <div className="form-group">
          <label>Subject Classification</label>
          <select name="subjectClassification" value={lot.subjectClassification} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="landscape">Landscape</option>
            <option value="seascape">Seascape</option>
            <option value="portrait">Portrait</option>
            <option value="figure">Figure</option>
            <option value="still life">Still Life</option>
            <option value="nude">Nude</option>
            <option value="animal">Animal</option>
            <option value="abstract">Abstract</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Description */}
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={lot.description} onChange={handleChange} required />
        </div>

        {/* Auction Date */}
        <div className="form-group">
          <label>Auction Date</label>
          <input type="date" name="auctionDate" value={lot.auctionDate} onChange={handleChange} />
        </div>

        {/* Estimated Price */}
        <div className="form-group">
          <label>Estimated Price</label>
          <input type="number" name="estimatedPrice" value={lot.estimatedPrice} onChange={handleChange} required />
        </div>

        {/* Category */}
        <div className="form-group">
          <label>Category</label>
          <select name="category" value={lot.category} onChange={handleChange} required>
            <option value="Painting">Painting</option>
            <option value="Drawing">Drawing</option>
            <option value="Photographic Image">Photographic Image</option>
            <option value="Sculpture">Sculpture</option>
            <option value="Carving">Carving</option>
          </select>
        </div>

        {/* Category-specific fields */}
        {(lot.category === "Painting" || lot.category === "Drawing") && (
          <>
            <div className="form-group">
              <label>Medium</label>
              <input type="text" name="mediumOrMaterial" value={lot.mediumOrMaterial} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Framed</label>
              <input type="checkbox" name="framed" checked={lot.framed} onChange={handleChange} />
            </div>
          </>
        )}
        {lot.category === "Photographic Image" && (
          <div className="form-group">
            <label>Medium (B&W / Colour)</label>
            <input type="text" name="mediumOrMaterial" value={lot.mediumOrMaterial} onChange={handleChange} required />
          </div>
        )}
        {(lot.category === "Sculpture" || lot.category === "Carving") && (
          <>
            <div className="form-group">
              <label>Material</label>
              <input type="text" name="mediumOrMaterial" value={lot.mediumOrMaterial} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Weight (kg)</label>
              <input type="number" name="weight" value={lot.weight} onChange={handleChange} />
            </div>
          </>
        )}

        {/* Dimensions */}
        {lot.category !== "Photographic Image" && (
          <>
            <div className="form-group">
              <label>Height (cm)</label>
              <input type="number" name="height" value={lot.dimensions.height} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Length (cm)</label>
              <input type="number" name="length" value={lot.dimensions.length} onChange={handleChange} />
            </div>
          </>
        )}
        {(lot.category === "Sculpture" || lot.category === "Carving") && (
          <div className="form-group">
            <label>Width (cm)</label>
            <input type="number" name="width" value={lot.dimensions.width} onChange={handleChange} />
          </div>
        )}

        {/* Image Upload */}
        <div className="form-group">
          <label>Image</label>
          <input type="file" onChange={handleImageChange} accept="image/*" />
        </div>

        <button type="submit" className="create-lot-btn">Submit Lot</button>
      </form>
    </div>
  );
}