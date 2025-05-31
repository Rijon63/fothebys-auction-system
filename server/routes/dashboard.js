import express from "express";
import Auction from "../models/Auction.js";
import Lot from "../models/Lot.js";
import Bid from "../models/Bid.js"; // if applicable

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const totalAuctions = await Auction.countDocuments();
    const activeLots = await Lot.countDocuments({ status: "active" });
    const totalBids = await Bid.countDocuments();

    res.json({ totalAuctions, activeLots, totalBids });
  } catch (err) {
    res.status(500).json({ error: "Error fetching dashboard stats" });
  }
});

export default router;
