import express from "express";
import Lot from "../models/Lot.js";

const router = express.Router();

// Simple Search
router.get("/simple", async (req, res) => {
  const { keyword } = req.query;
  const regex = new RegExp(keyword, 'i');
  try {
    const results = await Lot.find({
      $or: [
        { artist: regex },
        { category: regex },
        { subjectClassification: regex },
      ]
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Search failed" });
  }
});

// Advanced Search
router.get("/advanced", async (req, res) => {
  const { auctionTitle, category, minPrice, maxPrice, startAuctionDate, endAuctionDate, subjectClassification } = req.query;
  let filter = {};

  if (category) filter.category = category;
  if (subjectClassification) filter.subjectClassification = new RegExp(subjectClassification, 'i');
  if (minPrice && maxPrice) filter.estimatedPrice = { $gte: minPrice, $lte: maxPrice };
  if (startAuctionDate && endAuctionDate) filter.auctionDate = { $gte: startAuctionDate, $lte: endAuctionDate };

  try {
    let lots = await Lot.find(filter).populate("auctionId");

    // Now filter further by Auction Title if needed
    if (auctionTitle) {
      lots = lots.filter(lot => lot.auctionId?.title?.toLowerCase().includes(auctionTitle.toLowerCase()));
    }

    res.json(lots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Advanced search failed" });
  }
});

export default router;
