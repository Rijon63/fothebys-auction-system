// connectTest.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ MongoDB connected successfully!");
  process.exit(0);
})
.catch((err) => {
  console.error("❌ MongoDB connection failed:", err.message);
  process.exit(1);
});
