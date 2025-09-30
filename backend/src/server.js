import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();

// middleware
app.use(cors({ origin: "*" })); // we'll tighten this later
app.use(express.json());

// simple routes
app.get("/", (_req, res) => res.send("Recipes API is running"));
app.get("/healthz", (_req, res) => res.send("ok"));

// env/port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
