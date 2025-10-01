import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const r = express.Router();

// POST /api/v1/auth/signup
r.post("/signup", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username?.trim() || !password) {
    return res.status(400).json({ error: "username and password are required" });
  }
  try {
    const user = new User({ username: username.trim() });
    await user.setPassword(password);
    await user.save();
    return res.status(201).json({ username: user.username });
  } catch {
    return res.status(409).json({ error: "username already exists" });
  }
});

// POST /api/v1/auth/login
r.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  const user = await User.findOne({ username: username?.trim() });
  if (!user || !(await user.validatePassword(password))) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  const token = jwt.sign(
    { sub: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token, username: user.username });
});

export default r;
