// server/models/Client.js
import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true,
  },
  fullName: { 
    type: String, 
    required: true,
  },
  email: { 
    type: String, 
    required: true,
  },
  phone: { 
    type: String,
  },
  address: { 
    type: String,
  },
  type: { 
    type: String, 
    enum: ["buyer", "seller"],
    required: true,
  },
}, { timestamps: true });

export default mongoose.model("Client", clientSchema);
