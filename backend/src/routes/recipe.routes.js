import express from "express";
import Recipe from "../models/Recipe.js";
import { requireAuth } from "../middleware/auth.js";

const r = express.Router();

// --- PUBLIC route (no token) ---
// Public feed (no auth): newest first
r.get("/feed", async (_req, res) => {
  const recipes = await Recipe.find().sort({ createdAt: -1 }).limit(100);
  res.json(recipes);
});

// --- everything below requires auth ---
// Create
r.post("/", requireAuth, async (req, res) => {
  try {
    const { title, ingredients, imageUrl } = req.body || {};
    if (!title?.trim() || !Array.isArray(ingredients) || ingredients.length === 0 || !imageUrl?.trim()) {
      return res.status(400).json({ error: "title, ingredients[], and imageUrl are required" });
    }
    const recipe = await Recipe.create({
      title: title.trim(),
      ingredients: ingredients.map(i => ({ name: i.name?.trim(), quantity: i.quantity?.trim() })),
      imageUrl: imageUrl.trim(),
      authorId: req.user.id
    });
    res.status(201).json(recipe);
  } catch (err) {
    res.status(400).json({ error: "invalid recipe data", detail: err.message });
  }
});

// List mine
r.get("/mine", requireAuth, async (req, res) => {
  const recipes = await Recipe.find({ authorId: req.user.id }).sort({ createdAt: -1 });
  res.json(recipes);
});

// Get one (owner only)
r.get("/:id", requireAuth, async (req, res) => {
  const rec = await Recipe.findById(req.params.id);
  if (!rec) return res.status(404).json({ error: "not found" });
  if (rec.authorId.toString() !== req.user.id) return res.status(403).json({ error: "forbidden" });
  res.json(rec);
});

// Update (owner only)
r.put("/:id", requireAuth, async (req, res) => {
  const rec = await Recipe.findById(req.params.id);
  if (!rec) return res.status(404).json({ error: "not found" });
  if (rec.authorId.toString() !== req.user.id) return res.status(403).json({ error: "forbidden" });

  const { title, ingredients, imageUrl } = req.body || {};
  if (title !== undefined) rec.title = title;
  if (ingredients !== undefined) rec.ingredients = ingredients;
  if (imageUrl !== undefined) rec.imageUrl = imageUrl;

  try {
    await rec.save();
    res.json(rec);
  } catch (err) {
    res.status(400).json({ error: "invalid recipe data", detail: err.message });
  }
});

// Delete (owner only)
r.delete("/:id", requireAuth, async (req, res) => {
  const rec = await Recipe.findById(req.params.id);
  if (!rec) return res.status(404).json({ error: "not found" });
  if (rec.authorId.toString() !== req.user.id) return res.status(403).json({ error: "forbidden" });
  await rec.deleteOne();
  res.json({ ok: true });
});


export default r;