import mongoose from "mongoose";

//ingredients
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
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }]
  },
  { timestamps: true }
);

// virtual like count for easy display
recipeSchema.virtual("likeCount").get(function () {
  return this.likedBy?.length || 0;
});

// ensure virtuals are sent to the client
recipeSchema.set("toJSON", { virtuals: true });
recipeSchema.set("toObject", { virtuals: true });

recipeSchema.index({ authorId: 1, createdAt: -1 });

export default mongoose.model("Recipe", recipeSchema);
