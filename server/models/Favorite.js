import mongoose from 'mongoose';

const FavoriteSchema = new mongoose.Schema({
  clientId: {
    type: String,
    required: true,
  },
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure unique favorite per client and auction
FavoriteSchema.index({ clientId: 1, auctionId: 1 }, { unique: true });

export default mongoose.model('Favorite', FavoriteSchema);