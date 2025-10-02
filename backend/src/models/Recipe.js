import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    ingredients: {
      type: [ingredientSchema],
      validate: v => Array.isArray(v) && v.length > 0
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
      match: /^https?:\/\/.+/i
    },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

recipeSchema.index({ authorId: 1, createdAt: -1 });

export default mongoose.model("Recipe", recipeSchema);