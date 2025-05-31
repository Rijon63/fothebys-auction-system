import Lot from '../models/Lot.js';
import Auction from '../models/Auction.js';

export const getAllLots = async (req, res) => {
  try {
    let lots;
    if (req.user.role === "admin") {
      // Admins see all lots
      lots = await Lot.find().populate('auctionId', 'title').populate('sellerId', 'username');
    } else if (req.user.role === "seller") {
      // Sellers see only their own lots
      lots = await Lot.find({ sellerId: req.user.id }).populate('auctionId', 'title').populate('sellerId', 'username');
    } else if (req.user.role === "buyer") {
      // Buyers see only available lots (not sold)
      lots = await Lot.find({ salePrice: null }).populate('auctionId', 'title').populate('sellerId', 'username');
    } else {
      return res.status(403).json({ error: "Unauthorized to view lots" });
    }
    res.status(200).json(lots);
  } catch (err) {
    console.error("Error fetching lots:", err);
    res.status(500).json({ error: "Failed to fetch lots. Please try again." });
  }
};

export const createLot = async (req, res) => {
  try {
    const {
      auctionId,
      lotNumber,
      title,
      artist,
      yearProduced,
      subjectClassification,
      description,
      auctionDate,
      startingPrice,
      estimatedPrice,
      category,
      salePrice,
      dimensions,
      weight,
      framed,
      mediumOrMaterial,
      sellerId,
    } = req.body;

    // Validate required fields
    if (!auctionId || !lotNumber || !title || !artist || !yearProduced || !subjectClassification ||
        !description || !startingPrice || !estimatedPrice || !category || !sellerId) {
      return res.status(400).json({ error: "All required fields must be provided." });
    }

    // Validate auctionId exists
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found." });
    }

    // Prepare dimensions object
    const parsedDimensions = {
      height: dimensions?.height ? parseFloat(dimensions.height) : null,
      length: dimensions?.length ? parseFloat(dimensions.length) : null,
      width: dimensions?.width ? parseFloat(dimensions.width) : null,
    };

    // Validate dimensions
    if (parsedDimensions.height && isNaN(parsedDimensions.height)) {
      return res.status(400).json({ error: "Invalid height: must be a number." });
    }
    if (parsedDimensions.length && isNaN(parsedDimensions.length)) {
      return res.status(400).json({ error: "Invalid length: must be a number." });
    }
    if (parsedDimensions.width && isNaN(parsedDimensions.width)) {
      return res.status(400).json({ error: "Invalid width: must be a number." });
    }

    // Create new lot
    const newLot = new Lot({
      auctionId,
      lotNumber,
      title,
      artist,
      yearProduced: parseInt(yearProduced),
      subjectClassification,
      description,
      auctionDate: auctionDate ? new Date(auctionDate) : null,
      startingPrice: parseFloat(startingPrice),
      estimatedPrice: parseFloat(estimatedPrice),
      category,
      salePrice: salePrice ? parseFloat(salePrice) : null,
      sellerId,
      dimensions: parsedDimensions,
      weight: weight ? parseFloat(weight) : null,
      framed: framed === 'true' || framed === true,
      mediumOrMaterial,
      image: req.file ? req.file.filename : null,
    });

    // Save lot to database
    const savedLot = await newLot.save();
    res.status(201).json(savedLot);
  } catch (err) {
    console.error("Error creating lot:", err);
    if (err.code === 11000 && err.keyPattern?.lotNumber) {
      return res.status(400).json({ error: "Lot Number must be unique." });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: `Validation failed: ${err.message}` });
    }
    res.status(500).json({ error: "Failed to create lot. Please try again." });
  }
};

export const getLotById = async (req, res) => {
  try {
    const lot = await Lot.findById(req.params.id).populate('auctionId', 'title').populate('sellerId', 'username');
    if (!lot) {
      return res.status(404).json({ error: "Lot not found" });
    }
    res.status(200).json(lot);
  } catch (err) {
    console.error("Error fetching lot:", err);
    res.status(500).json({ error: "Failed to fetch lot. Please try again." });
  }
};

export const updateLot = async (req, res) => {
  // Implementation (already provided in routes/lot.js for simplicity)
};

export const deleteLot = async (req, res) => {
  try {
    const lot = await Lot.findById(req.params.id);
    if (!lot) {
      return res.status(404).json({ error: "Lot not found" });
    }
    if (req.user.role !== "admin" && lot.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized to delete this lot" });
    }
    await Lot.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Lot deleted successfully" });
  } catch (err) {
    console.error("Error deleting lot:", err);
    res.status(500).json({ error: "Failed to delete lot. Please try again." });
  }
};