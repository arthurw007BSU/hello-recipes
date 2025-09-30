import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

// middleware
app.use(cors({ origin: "*" })); // we'll tighten this later
app.use(express.json());

// simple routes
app.get("/", (_req, res) => res.send("Recipes API is running"));
app.get("/healthz", (_req, res) => res.send("ok"));

// --- MongoDB connect ---
const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error("Missing MONGO_URL in .env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Mongo connection error:", err.message);
    process.exit(1);
  });
