import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI not defined');
  process.exit(1);
}

mongoose.connect(MONGO_URI).then(() => {
  console.log('Connected to MongoDB Atlas');
  mongoose.connection.close();
}).catch(err => {
  console.error('Connection error:', err.message);
  process.exit(1);
});