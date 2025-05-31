import express from 'express';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import { createLot, getLotById, getAllLots, updateLot, deleteLot } from '../controllers/lot.js';
import Lot from '../models/Lot.js';
import User from '../models/User.js';
import Client from '../models/Client.js';

const router = express.Router();

// Get all lots
router.get('/', verifyToken, getAllLots);

// Get lots by auction ID
router.get('/auction/:auctionId', verifyToken, async (req, res) => {
  try {
    const lots = await Lot.find({ auctionId: req.params.auctionId })
      .select('lotNumber title artist yearProduced description estimatedPrice salePrice image')
      .populate('auctionId', 'title');
    res.status(200).json(lots);
  } catch (err) {
    console.error('Error fetching lots for auction:', err);
    res.status(500).json({ error: 'Failed to fetch lots' });
  }
});

// Create a new lot
router.post('/', verifyToken, checkRole(['admin', 'seller']), upload.single('image'), createLot);

// Get a lot by ID
router.get('/:id', verifyToken, getLotById);

// Update a lot
router.put('/:id', verifyToken, checkRole(['admin', 'seller']), upload.single('image'), updateLot);

// Buy a lot
router.put('/buy/:lotId', verifyToken, checkRole(['buyer']), async (req, res) => {
  try {
    const { salePrice } = req.body;
    const lot = await Lot.findById(req.params.lotId);
    if (!lot) {
      return res.status(404).json({ error: 'Lot not found' });
    }
    if (!salePrice || salePrice <= 0) {
      return res.status(400).json({ error: 'Valid sale price is required' });
    }
    const user = await User.findById(req.user.id); // Get user from token
    if (!user || user.role !== 'buyer') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const client = await Client.findOne({ userId: user._id });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    lot.salePrice = salePrice;
    lot.buyerId = client._id; // Set buyerId to Client._id
    await lot.save();
    res.status(200).json(lot);
  } catch (err) {
    console.error('Error buying lot:', err);
    res.status(500).json({ error: 'Failed to buy lot' });
  }
});

// Delete a lot
router.delete('/:id', verifyToken, checkRole(['admin', 'seller']), deleteLot);

// Get bought lots for a client (by User.clientId)
router.get('/bought/:clientId', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ clientId: req.params.clientId, role: 'buyer' });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const client = await Client.findOne({ userId: user._id });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    const lots = await Lot.find({ buyerId: client._id, salePrice: { $exists: true, $ne: null } })
      .populate('auctionId', 'title');
    res.json(lots);
  } catch (err) {
    console.error('Error fetching bought lots:', err);
    res.status(500).json({ error: 'Failed to fetch bought lots' });
  }
});

// Get pending sales for a client (by User.clientId)
router.get('/pending-sales/:clientId', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ clientId: req.params.clientId, role: 'buyer' });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const client = await Client.findOne({ userId: user._id });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    const lots = await Lot.find({ buyerId: client._id, salePrice: { $exists: false } })
      .populate('auctionId', 'title');
    res.json(lots);
  } catch (err) {
    console.error('Error fetching pending sales:', err);
    res.status(500).json({ error: 'Failed to fetch pending sales' });
  }
});

export default router;