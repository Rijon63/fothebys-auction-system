import mongoose from "mongoose";

const AuctionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startDate: Date,
  endDate: Date,
  biddingEndTime: { type: Date, required: true },
  image: String,
  salePrice: { type: Number, default: null },
  highestBid: { type: Number, default: null },
  winnerId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", default: null },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", default: null },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  category: {
    type: String,
    enum: ['Drawings', 'Paintings', 'Photographic Images', 'Sculptures', 'Carvings'],
    required: true
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

AuctionSchema.virtual("lots", {
  ref: "Lot",
  localField: "_id",
  foreignField: "auctionId",
});

const Auction = mongoose.model("Auction", AuctionSchema);

export default Auction;