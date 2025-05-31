import mongoose from "mongoose";

const BidSchema = new mongoose.Schema({
  auctionId: { type: mongoose.Schema.Types.ObjectId, ref: "Auction", required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
  amount: { type: Number, required: true },
  placedAt: { type: Date, default: Date.now },
});

const Bid = mongoose.model("Bid", BidSchema);

export default Bid;