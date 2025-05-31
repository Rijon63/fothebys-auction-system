import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './.env' });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Error: MONGO_URI is not defined in .env file');
  process.exit(1);
}

// Validate MongoDB URI format
if (!MONGO_URI.startsWith('mongodb+srv://') && !MONGO_URI.startsWith('mongodb://')) {
  console.error('Error: MONGO_URI must start with "mongodb+srv://" or "mongodb://"');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(MONGO_URI).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch(err => {
  console.error('MongoDB connection error:', err.message);
  if (err.message.includes('Authentication failed')) {
    console.error('Check your MongoDB Atlas username and password in MONGO_URI');
  } else if (err.message.includes('network')) {
    console.error('Ensure your IP is whitelisted in MongoDB Atlas and you have internet access');
  }
  process.exit(1);
});

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  clientId: String,
});

const User = mongoose.model('User', userSchema);

async function migrateClientIds() {
  try {
    // Find buyers without clientId
    const buyers = await User.find({ role: 'buyer', clientId: { $exists: false } });
    console.log(`Found ${buyers.length} buyers without clientId`);

    if (buyers.length === 0) {
      console.log('No buyers need migration');
      return;
    }

    // Update each buyer with a clientId
    for (const buyer of buyers) {
      buyer.clientId = uuidv4();
      await buyer.save();
      const displayName = buyer.username || buyer.email || 'unknown';
      console.log(`Updated clientId for user ${displayName} (${buyer._id})`);
    }

    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Migration error:', err.message);
    if (err.name === 'MongoServerError' && err.code === 11000) {
      console.error('Duplicate clientId detected. Ensure clientId is unique in User schema');
    }
    throw err;
  } finally {
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    } catch (closeErr) {
      console.error('Error closing MongoDB connection:', closeErr.message);
    }
  }
}

migrateClientIds().catch(err => {
  console.error('Script failed:', err.message);
  process.exit(1);
});