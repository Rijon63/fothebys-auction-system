// server/server.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

// Routes
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import auctionRoutes from "./routes/auction.js";
import lotRoutes from './routes/lot.js';
import clientRoutes from "./routes/client.js";
import commissionBidRoutes from "./routes/commissionBid.js";
import searchRoutes from "./routes/search.js";
import reportRoutes from "./routes/report.js";
import './models/Favorite.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// server.js

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("MongoDB connected");
  
  // Start server only after DB connected
  app.listen(8081, () => console.log("Server running on port 8081"));
})
.catch(err => console.error("MongoDB connection error:", err));


// File handling (uploads)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auctions", auctionRoutes);
app.use('/api/lots', lotRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/commission-bids", commissionBidRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/reports", reportRoutes);



