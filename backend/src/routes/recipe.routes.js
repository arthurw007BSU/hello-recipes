// backend/src/routes/reciperoutes.js
import express from "express";
import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";
import { requireAuth } from "../middleware/auth.js";

const r = express.Router();

/* -------------------------- PUBLIC (no auth) -------------------------- */

// GET /recipes/feed
// - Newest first by default
// - /recipes/feed?sort=popular sorts by like count desc, then newest
r.get("/feed", async (req, res) => {
  try {
    const { sort } = req.query;

    if (sort === "popular") {
      const popular = await Recipe.aggregate([
        { $addFields: { likeCount: { $size: { $ifNull: ["$likedBy", []] } } } },
        { $sort: { likeCount: -1, createdAt: -1 } },
        { $limit: 100 },
      ]);
      return res.json(popular);
    }

    const recipes = await Recipe.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json(recipes);
  } catch (err) {
    return res.status(500).json({ error: "server_error", detail: err.message });
  }
});

/* --------------------------- AUTH REQUIRED --------------------------- */

// POST /recipes  (create)
r.post("/", requireAuth, async (req, res) => {
  try {
    const { title, ingredients, imageUrl } = req.body || {};
    if (
      !title?.trim() ||
      !Array.isArray(ingredients) ||
      ingredients.length === 0 ||
      !imageUrl?.trim()
    ) {
      return res
        .status(400)
        .json({ error: "title, ingredients[], and imageUrl are required" });
    }

    const recipe = await Recipe.create({
      title: title.trim(),
      ingredients: ingredients.map((i) => ({
        name: i.name?.trim(),
        quantity: i.quantity?.trim(),
      })),
      imageUrl: imageUrl.trim(),
      authorId: req.user.id,
    });

    return res.status(201).json(recipe);
  } catch (err) {
    return res
      .status(400)
      .json({ error: "invalid_recipe_data", detail: err.message });
  }
});

// GET /recipes/mine (list my recipes)
r.get("/mine", requireAuth, async (req, res) => {
  try {
    const recipes = await Recipe.find({ authorId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    return res.json(recipes);
  } catch (err) {
    return res.status(500).json({ error: "server_error", detail: err.message });
  }
});

// PUT /recipes/:id (update; owner only)
r.put("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "invalid_id" });
    }

    const rec = await Recipe.findById(id);
    if (!rec) return res.status(404).json({ error: "not_found" });
    if (rec.authorId.toString() !== req.user.id)
      return res.status(403).json({ error: "forbidden" });

    const { title, ingredients, imageUrl } = req.body || {};
    if (title !== undefined) rec.title = title;
    if (ingredients !== undefined) rec.ingredients = ingredients;
    if (imageUrl !== undefined) rec.imageUrl = imageUrl;

    await rec.save();
    return res.json(rec);
  } catch (err) {
    return res
      .status(400)
      .json({ error: "invalid_recipe_data", detail: err.message });
  }
});

// DELETE /recipes/:id (delete; owner only)
r.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "invalid_id" });
    }

    const rec = await Recipe.findById(id);
    if (!rec) return res.status(404).json({ error: "not_found" });
    if (rec.authorId.toString() !== req.user.id)
      return res.status(403).json({ error: "forbidden" });

    await rec.deleteOne();
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "server_error", detail: err.message });
  }
});

// POST /recipes/:id/like (add-only like; idempotent)
r.post("/:id/like", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: recipeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ error: "invalid_id" });
    }

    // verify recipe exists
    const exists = await Recipe.exists({ _id: recipeId });
    if (!exists) return res.status(404).json({ error: "not_found" });

    // check if already liked (for accurate 'added' flag)
    const alreadyLiked = await Recipe.exists({
      _id: recipeId,
      likedBy: userId,
    });

    if (!alreadyLiked) {
      await Recipe.updateOne(
        { _id: recipeId },
        { $addToSet: { likedBy: userId } }
      );
    }

    // fetch latest count
    const updated = await Recipe.findById(recipeId, { likedBy: 1 }).lean();
    const likeCount = updated?.likedBy?.length ?? 0;

    return res.json({ added: !alreadyLiked, likeCount });
  } catch (err) {
    return res.status(500).json({ error: "server_error", detail: err.message });
  }
});

/* -------------------- PUBLIC DETAIL (placed LAST) -------------------- */

// GET /recipes/:id (public detail; placed AFTER /mine and others to prevent collisions)
r.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "invalid_id" });
    }

    const rec = await Recipe.findById(id);
    if (!rec) return res.status(404).json({ error: "not_found" });

    return res.json(rec);
  } catch (err) {
    return res.status(500).json({ error: "server_error", detail: err.message });
  }
});

export default r;
