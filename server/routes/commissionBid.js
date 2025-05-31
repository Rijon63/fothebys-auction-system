// server/routes/commissionBids.js
import express from "express";
import CommissionBid from "../models/CommissionBid.js";
import User from "../models/User.js";
import Client from "../models/Client.js";

const router = express.Router();

// POST Commission Bid
router.post("/", async (req, res) => {
  try {
    const bid = new CommissionBid(req.body);
    await bid.save();
    res.status(201).json(bid);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to place bid" });
  }
});

// GET Commission Bids by Client (by User.clientId)
router.get("/client/:clientId", async (req, res) => {
  try {
    const user = await User.findOne({ clientId: req.params.clientId, role: 'buyer' });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const client = await Client.findOne({ userId: user._id });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    const bids = await CommissionBid.find({ clientId: client._id })
      .populate({
        path: 'lotId',
        select: 'title', // Only populate the title field to reduce data
      });
    res.json(bids);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch bids" });
  }
});

// GET Commission Bids by Lot
router.get("/lot/:lotId", async (req, res) => {
  try {
    const bids = await CommissionBid.find({ lotId: req.params.lotId }).populate("clientId");
    res.json(bids);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch bids" });
  }
});

export default router;