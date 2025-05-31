import express from 'express';
import Auction from '../models/Auction.js';
import Lot from '../models/Lot.js';
import upload from '../middleware/upload.js';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';
import Bid from '../models/Bid.js';
import Favorite from '../models/Favorite.js';
import multer from 'multer';

const router = express.Router();

// Create Auction
router.post('/', verifyToken, checkRole(['admin', 'seller']), upload.single('image'), async (req, res) => {
  try {
    const { title, description, startDate, endDate, biddingEndTime, creatorId, category } = req.body;
    console.log('Received POST /api/auctions:', { title, creatorId, category });
    if (!title || !startDate || !endDate || !biddingEndTime || !creatorId || !category) {
      return res.status(400).json({ error: 'All fields are required', missingFields: { title, startDate, endDate, biddingEndTime, creatorId, category } });
    }

    const existingAuction = await Auction.findOne({ title, creatorId });
    if (existingAuction) {
      return res.status(400).json({ error: 'An auction with this title already exists for this user' });
    }

    const newAuction = new Auction({
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      biddingEndTime: new Date(biddingEndTime),
      image: req.file ? req.file.filename : null,
      creatorId,
      category,
    });
    const savedAuction = await newAuction.save();
    res.status(201).json(savedAuction);
  } catch (err) {
    console.error('Error creating auction:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: `Validation failed: ${err.message}`, details: err.errors });
    }
    if (err instanceof multer.MulterError || err.message === 'Only JPEG/PNG images are allowed') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to create auction. Please try again.', details: err.message });
  }
});

// Get All Auctions
router.get('/', verifyToken, async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const auctions = await Auction.find(query).populate('lots', 'title salePrice image').populate('winnerId', 'fullName');
    res.status(200).json(auctions);
  } catch (err) {
    console.error('Error fetching auctions:', err);
    res.status(500).json({ error: 'Failed to fetch auctions. Please try again.' });
  }
});

// Place a Bid
router.post('/:id/bid', verifyToken, checkRole(['buyer']), async (req, res) => {
  try {
    const { amount } = req.body;
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ error: 'Auction not found' });
    if (new Date() > auction.biddingEndTime) return res.status(400).json({ error: 'Bidding has ended' });
    if (amount <= (auction.highestBid || 0)) return res.status(400).json({ error: 'Bid must be higher than current highest bid' });

    const bid = new Bid({
      auctionId: auction._id,
      clientId: req.user.clientId,
      amount,
    });
    await bid.save();

    auction.highestBid = amount;
    auction.winnerId = req.user.clientId;
    await auction.save();

    res.status(200).json({ message: 'Bid placed successfully', highestBid: amount });
  } catch (err) {
    console.error('Error placing bid:', err);
    res.status(500).json({ error: 'Failed to place bid. Please try again.' });
  }
});

// Buy Auction
router.put('/buy/:id', verifyToken, checkRole(['buyer']), async (req, res) => {
  try {
    const { salePrice, buyerId } = req.body;
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(400).json({ error: 'Auction not found' });
    }
    if (!salePrice || salePrice <= 0) {
      return res.status(400).json({ error: 'Valid sale price is required' });
    }
    if (new Date() > auction.biddingEndTime) {
      return res.status(400).json({ error: 'Bidding has ended. Purchase not allowed.' });
    }
    auction.salePrice = salePrice;
    auction.buyerId = buyerId || req.user.clientId;
    await auction.save();
    await Lot.updateMany({ auctionId: req.params.id }, { buyerId: auction.buyerId, salePrice });
    res.status(200).json({ message: 'Auction purchased successfully' });
  } catch (err) {
    console.error('Error buying auction:', err);
    res.status(500).json({ error: 'Failed to buy auction. Please try again.', details: err.message });
  }
});

// Get Single Auction (with its lots)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id).populate('lots', 'title salePrice image');
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    res.status(200).json(auction);
  } catch (err) {
    console.error('Error fetching auction:', err);
    res.status(500).json({ error: 'Failed to fetch auction. Please try again.' });
  }
});

// Update Auction
router.put('/:id', verifyToken, checkRole(['admin', 'seller']), upload.single('image'), async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    if (req.user.role !== 'admin' && auction.creatorId.toString() !== req.user.clientId) {
      return res.status(403).json({ error: 'Unauthorized to update this auction' });
    }
    const updatedData = {
      title: req.body.title || auction.title,
      description: req.body.description || auction.description,
      startDate: req.body.startDate ? new Date(req.body.startDate) : auction.startDate,
      endDate: req.body.endDate ? new Date(req.body.endDate) : auction.endDate,
      image: req.file ? req.file.filename : auction.image,
      category: req.body.category || auction.category,
    };
    const updatedAuction = await Auction.findByIdAndUpdate(req.params.id, updatedData, { new: true, runValidators: true });
    res.status(200).json(updatedAuction);
  } catch (err) {
    console.error('Error updating auction:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: `Validation failed: ${err.message}`, details: err.errors });
    }
    if (err instanceof multer.MulterError || err.message === 'Only JPEG/PNG images are allowed') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to update auction. Please try again.' });
  }
});

// Delete Auction
router.delete('/:id', verifyToken, checkRole(['admin', 'seller']), async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    if (req.user.role !== 'admin' && auction.creatorId.toString() !== req.user.clientId) {
      return res.status(403).json({ error: 'Unauthorized to delete this auction' });
    }
    await Auction.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Auction deleted successfully' });
  } catch (err) {
    console.error('Error deleting auction:', err);
    res.status(500).json({ error: 'Failed to delete auction. Please try again.' });
  }
});

// Search Auctions
router.get('/search', verifyToken, async (req, res) => {
  try {
    const { title, startDate, endDate, creatorId, category } = req.query;
    const query = {};
    if (title) query.title = { $regex: title, $options: 'i' };
    if (startDate) query.startDate = { $gte: new Date(startDate) };
    if (endDate) query.endDate = { $lte: new Date(endDate) };
    if (creatorId) query.creatorId = creatorId;
    if (category) query.category = category;
    const auctions = await Auction.find(query).populate('lots', 'title salePrice image');
    res.status(200).json(auctions);
  } catch (err) {
    console.error('Error searching auctions:', err);
    res.status(500).json({ error: 'Failed to search auctions. Please try again.' });
  }
});

// Get Auctions with Bought Lots for a Client
router.get('/bought/:clientId', verifyToken, async (req, res) => {
  try {
    const { clientId } = req.params;
    if (req.user.role !== 'admin' && req.user.clientId !== clientId) {
      return res.status(403).json({ error: 'Unauthorized to view this client’s purchased auctions' });
    }
    const boughtLots = await Lot.find({ buyerId: clientId }).select('auctionId title salePrice image');
    if (!boughtLots.length) {
      return res.status(200).json([]);
    }
    const auctionIds = [...new Set(boughtLots.map(lot => lot.auctionId.toString()))];
    const auctions = await Auction.find({ _id: { $in: auctionIds } }).select('title createdAt');
    const auctionsWithLots = auctions.map(auction => ({
      _id: auction._id,
      title: auction.title,
      date: auction.createdAt,
      lots: boughtLots.filter(lot => lot.auctionId.toString() === auction._id.toString()),
    }));
    res.status(200).json(auctionsWithLots);
  } catch (err) {
    console.error('Error fetching purchased auctions:', err);
    res.status(500).json({ error: 'Failed to fetch purchased auctions. Please try again.' });
  }
});

// Add Auction to Favorites
router.post('/:id/favorite', verifyToken, checkRole(['buyer']), async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    if (auction.salePrice) {
      return res.status(400).json({ error: 'Cannot favorite a sold auction' });
    }

    const existingFavorite = await Favorite.findOne({
      clientId: req.user.clientId,
      auctionId: req.params.id,
    });
    if (existingFavorite) {
      return res.status(400).json({ error: 'Auction is already in favorites' });
    }

    const favorite = new Favorite({
      clientId: req.user.clientId,
      auctionId: req.params.id,
    });
    await favorite.save();

    res.status(200).json({ message: 'Auction added to favorites' });
  } catch (err) {
    console.error('Error adding to favorites:', err);
    res.status(500).json({ error: 'Failed to add to favorites. Please try again.' });
  }
});

// Remove Auction from Favorites
router.delete('/:id/favorite', verifyToken, checkRole(['buyer']), async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      clientId: req.user.clientId,
      auctionId: req.params.id,
    });
    if (!favorite) {
      return res.status(404).json({ error: 'Auction not found in favorites' });
    }

    res.status(200).json({ message: 'Auction removed from favorites' });
  } catch (err) {
    console.error('Error removing from favorites:', err);
    res.status(500).json({ error: 'Failed to remove from favorites. Please try again.' });
  }
});

// Get User's Favorite Auctions
router.get('/favorites/:clientId', verifyToken, async (req, res) => {
  try {
    const { clientId } = req.params;
    console.log('Favorites request:', { user: req.user, clientId }); // Debug log
    if (!req.user.clientId) {
      return res.status(403).json({ error: 'User clientId is missing in token' });
    }
    if (req.user.role !== 'admin' && req.user.clientId !== clientId) {
      return res.status(403).json({ error: 'Unauthorized to view this client’s favorites' });
    }
    const favorites = await Favorite.find({ clientId }).populate({
      path: 'auctionId',
      select: 'title description startDate endDate image salePrice category',
      populate: { path: 'lots', select: 'title salePrice image' },
    });
    const favoriteAuctions = favorites.map(fav => fav.auctionId);
    res.status(200).json(favoriteAuctions);
  } catch (err) {
    console.error('Error fetching favorite auctions:', err);
    res.status(500).json({ error: 'Failed to fetch favorite auctions. Please try again.' });
  }
});

export default router;