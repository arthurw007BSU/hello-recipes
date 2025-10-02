import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes.js";
import recipeRoutes from "./routes/recipe.routes.js";


const app = express();

app.use(express.json());            // <- must be before routes
app.use(cors({ origin: "*" }));
app.use("/api/v1/recipes", recipeRoutes);
app.use("/api/v1/auth", authRoutes);

//app.get("/healthz", (_req, res) => res.send("ok"));
app.get("/api/v1/healthz", (_req, res) => res.send("ok"));
app.post("/echo", (req, res) => res.json({ got: req.body }));



// DB connect (unchanged)
const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error("Missing MONGO_URL");
  process.exit(1);
}

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log(`API listening on :${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Mongo connection error:", err.message);
    process.exit(1);
  });