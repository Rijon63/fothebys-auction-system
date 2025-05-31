import express from "express";
import Lot from "../models/lot.model.js";

const router = express.Router();

// Create a new Lot
router.post("/", async (req, res) => {
  try {
    const newLot = new Lot(req.body);
    await newLot.save();
    res.status(201).json(newLot);
  } catch (error) {
    console.error("Error creating lot:", error);
    res.status(500).json({ message: "Failed to create lot", error });
  }
});

// Get all Lots
router.get("/", async (req, res) => {
  try {
    const lots = await Lot.find();
    res.json(lots);
  } catch (error) {
    console.error("Error fetching lots:", error);
    res.status(500).json({ message: "Failed to fetch lots", error });
  }
});

// Get a Lot by ID
router.get("/:id", async (req, res) => {
  try {
    const lot = await Lot.findById(req.params.id);
    res.json(lot);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch lot", error });
  }
});

// Update a Lot
router.put("/:id", async (req, res) => {
  try {
    const updatedLot = await Lot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedLot);
  } catch (error) {
    res.status(500).json({ message: "Failed to update lot", error });
  }
});

// Delete a Lot
router.delete("/:id", async (req, res) => {
  try {
    await Lot.findByIdAndDelete(req.params.id);
    res.json({ message: "Lot deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete lot", error });
  }
});

export default router;
