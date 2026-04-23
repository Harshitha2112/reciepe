const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Recipe title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    ingredients: [
      {
        name: { type: String, required: true },
        quantity: { type: String, required: true },
      },
    ],
    steps: [
      {
        stepNumber: { type: Number, required: true },
        instruction: { type: String, required: true },
      },
    ],
    image: {
      type: String,
      default: "",
    },
    imagePublicId: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: [
        "Breakfast",
        "Lunch",
        "Dinner",
        "Snacks",
        "Desserts",
        "Beverages",
        "Vegan",
        "Vegetarian",
        "Non-Vegetarian",
        "Other",
      ],
      required: true,
    },
    cookingTime: {
      type: Number, // in minutes
      required: true,
    },
    servings: {
      type: Number,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // Ratings
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        value: { type: Number, min: 1, max: 5 },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    // Likes
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
    // Views for trending
    views: {
      type: Number,
      default: 0,
    },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Auto-calculate average rating before saving
recipeSchema.pre("save", function () {
  if (this.ratings.length > 0) {
    const total = this.ratings.reduce((acc, r) => acc + r.value, 0);
    this.averageRating = parseFloat((total / this.ratings.length).toFixed(1));
  }
  this.likesCount = this.likes.length;
});

module.exports = mongoose.model("Recipe", recipeSchema);
