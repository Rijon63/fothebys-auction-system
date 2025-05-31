import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'seller', 'buyer'], required: true },
  clientId: { 
    type: String, 
    unique: true,
    default: function() {
      return this.role === 'buyer' ? uuidv4() : null;
    }
  },
}, { timestamps: true });

export default mongoose.model('User', userSchema);