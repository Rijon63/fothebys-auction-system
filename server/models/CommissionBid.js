// models/CommissionBid.js
import mongoose from 'mongoose';

const commissionBidSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  lotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lot',
    required: true,
  },
  bidAmount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('CommissionBid', commissionBidSchema);