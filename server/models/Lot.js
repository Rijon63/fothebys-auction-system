import mongoose from 'mongoose';

const dimensionSchema = new mongoose.Schema({
  height: Number,
  length: Number,
  width: Number,
});

const lotSchema = new mongoose.Schema({
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true,
  },
  lotNumber: { 
    type: String, 
    required: true, 
    unique: true,
  },
  title: { 
    type: String, 
    required: true,
  },
  artist: { 
    type: String, 
    required: true,
  },
  yearProduced: { 
    type: Number, 
    required: true,
  },
  subjectClassification: { 
    type: String, 
    required: true,
  },
  description: { 
    type: String, 
    required: true,
  },
  auctionDate: { 
    type: Date,
  },
  startingPrice: { 
    type: Number, 
    required: true,
  },
  estimatedPrice: { 
    type: Number,
    required: true,
  },
  category: { 
    type: String, 
    enum: ['Painting', 'Drawing', 'Photographic Image', 'Sculpture', 'Carving'],
    required: true,
  },
  salePrice: { 
    type: Number,
    default: null,
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    default: null,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  dimensions: dimensionSchema,
  weight: Number,
  framed: Boolean,
  mediumOrMaterial: String,
  image: String,
}, { timestamps: true });

const Lot = mongoose.model('Lot', lotSchema);

export default Lot;