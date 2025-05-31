import express from "express";
import Lot from "../models/Lot.js";
import Auction from "../models/Auction.js";
import Client from "../models/Client.js";

const router = express.Router();

router.get("/sales", async (req, res) => {
  try {
    const soldLots = await Lot.find({ salePrice: { $exists: true } });
    res.json(soldLots);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sales report" });
  }
});

router.get("/clients", async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch clients report" });
  }
});

router.get("/auctions", async (req, res) => {
  try {
    const auctions = await Auction.find().populate("buyerId", "fullName email");
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch auctions report" });
  }
});


export default router;
