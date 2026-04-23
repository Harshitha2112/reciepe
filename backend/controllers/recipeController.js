const asyncHandler = require("express-async-handler");
const Recipe = require("../models/Recipe");
const User = require("../models/User");
const Comment = require("../models/Comment");
const { cloudinary } = require("../utils/cloudinary");

// @desc    Create a new recipe
// @route   POST /api/recipes
// @access  Private (USER, SUBADMIN, ADMIN)
const createRecipe = asyncHandler(async (req, res) => {
  const { title, description, ingredients, steps, category, cookingTime, servings, difficulty, tags } = req.body;

  const recipe = await Recipe.create({
    title,
    description,
    ingredients: JSON.parse(ingredients),
    steps: JSON.parse(steps),
    category,
    cookingTime,
    servings,
    difficulty,
    tags: tags ? JSON.parse(tags) : [],
    image: req.file ? req.file.path : "",
    imagePublicId: req.file ? req.file.filename : "",
    createdBy: req.user._id,
    // Admins/SubAdmins auto-approve their own recipes
    status: ["ADMIN", "SUBADMIN"].includes(req.user.role) ? "approved" : "pending",
  });

  res.status(201).json(recipe);
});

// @desc    Get all approved recipes with pagination, search & filter
// @route   GET /api/recipes
// @access  Public
const getRecipes = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  // Build query filters
  const query = { status: "approved" };

  if (req.query.category) query.category = req.query.category;
  if (req.query.difficulty) query.difficulty = req.query.difficulty;
  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: "i" } },
      { description: { $regex: req.query.search, $options: "i" } },
      { tags: { $in: [new RegExp(req.query.search, "i")] } },
    ];
  }

  // Sort options
  let sort = { createdAt: -1 };
  if (req.query.sort === "popular") sort = { likesCount: -1 };
  if (req.query.sort === "rating") sort = { averageRating: -1 };
  if (req.query.sort === "trending") sort = { views: -1 };

  const total = await Recipe.countDocuments(query);
  const recipes = await Recipe.find(query)
    .populate("createdBy", "name avatar")
    .sort(sort)
    .skip(skip)
    .limit(limit);

  res.json({
    recipes,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Get trending recipes (top viewed)
// @route   GET /api/recipes/trending
// @access  Public
const getTrendingRecipes = asyncHandler(async (req, res) => {
  const recipes = await Recipe.find({ status: "approved" })
    .populate("createdBy", "name avatar")
    .sort({ views: -1 })
    .limit(6);
  res.json(recipes);
});

// @desc    Get single recipe by ID
// @route   GET /api/recipes/:id
// @access  Public
const getRecipeById = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id)
    .populate("createdBy", "name avatar email")
    .populate("ratings.user", "name");

  if (!recipe) {
    res.status(404);
    throw new Error("Recipe not found");
  }

  // Increment view count
  recipe.views += 1;
  await recipe.save();

  res.json(recipe);
});

// @desc    Update a recipe
// @route   PUT /api/recipes/:id
// @access  Private (owner, SUBADMIN, ADMIN)
const updateRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    res.status(404);
    throw new Error("Recipe not found");
  }

  const isOwner = recipe.createdBy.toString() === req.user._id.toString();
  const isPrivileged = ["ADMIN", "SUBADMIN"].includes(req.user.role);

  if (!isOwner && !isPrivileged) {
    res.status(403);
    throw new Error("Not authorized to update this recipe");
  }

  const { title, description, ingredients, steps, category, cookingTime, servings, difficulty, tags } = req.body;

  recipe.title = title || recipe.title;
  recipe.description = description || recipe.description;
  recipe.category = category || recipe.category;
  recipe.cookingTime = cookingTime || recipe.cookingTime;
  recipe.servings = servings || recipe.servings;
  recipe.difficulty = difficulty || recipe.difficulty;
  if (ingredients) recipe.ingredients = JSON.parse(ingredients);
  if (steps) recipe.steps = JSON.parse(steps);
  if (tags) recipe.tags = JSON.parse(tags);

  // Handle new image upload
  if (req.file) {
    // Delete old image from Cloudinary
    if (recipe.imagePublicId) {
      await cloudinary.uploader.destroy(recipe.imagePublicId);
    }
    recipe.image = req.file.path;
    recipe.imagePublicId = req.file.filename;
  }

  // Owners re-submitting set status back to pending
  if (isOwner && !isPrivileged) {
    recipe.status = "pending";
  }

  const updated = await recipe.save();
  res.json(updated);
});

// @desc    Delete a recipe
// @route   DELETE /api/recipes/:id
// @access  Private (owner, SUBADMIN, ADMIN)
const deleteRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    res.status(404);
    throw new Error("Recipe not found");
  }

  const isOwner = recipe.createdBy.toString() === req.user._id.toString();
  const isPrivileged = ["ADMIN", "SUBADMIN"].includes(req.user.role);

  if (!isOwner && !isPrivileged) {
    res.status(403);
    throw new Error("Not authorized to delete this recipe");
  }

  // Remove image from Cloudinary
  if (recipe.imagePublicId) {
    await cloudinary.uploader.destroy(recipe.imagePublicId);
  }

  await Recipe.findByIdAndDelete(req.params.id);
  await Comment.deleteMany({ recipe: req.params.id });

  res.json({ message: "Recipe deleted successfully" });
});

// @desc    Like / Unlike a recipe
// @route   PUT /api/recipes/:id/like
// @access  Private
const toggleLike = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) {
    res.status(404);
    throw new Error("Recipe not found");
  }

  const userId = req.user._id;
  const alreadyLiked = recipe.likes.includes(userId);

  if (alreadyLiked) {
    recipe.likes = recipe.likes.filter((id) => id.toString() !== userId.toString());
  } else {
    recipe.likes.push(userId);
  }

  await recipe.save();

  // Also update user's likedRecipes
  const user = await User.findById(userId);
  if (alreadyLiked) {
    user.likedRecipes = user.likedRecipes.filter((id) => id.toString() !== recipe._id.toString());
  } else {
    user.likedRecipes.push(recipe._id);
  }
  await user.save();

  res.json({ liked: !alreadyLiked, likesCount: recipe.likes.length });
});

// @desc    Save / Unsave (bookmark) a recipe
// @route   PUT /api/recipes/:id/save
// @access  Private
const toggleSave = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const recipeId = req.params.id;

  const alreadySaved = user.savedRecipes.includes(recipeId);
  if (alreadySaved) {
    user.savedRecipes = user.savedRecipes.filter((id) => id.toString() !== recipeId);
  } else {
    user.savedRecipes.push(recipeId);
  }

  await user.save();
  res.json({ saved: !alreadySaved });
});

// @desc    Rate a recipe (1-5)
// @route   PUT /api/recipes/:id/rate
// @access  Private
const rateRecipe = asyncHandler(async (req, res) => {
  const { value } = req.body;
  if (!value || value < 1 || value > 5) {
    res.status(400);
    throw new Error("Rating must be between 1 and 5");
  }

  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) {
    res.status(404);
    throw new Error("Recipe not found");
  }

  const existingRating = recipe.ratings.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (existingRating) {
    existingRating.value = value;
  } else {
    recipe.ratings.push({ user: req.user._id, value });
  }

  await recipe.save();
  res.json({ averageRating: recipe.averageRating, totalRatings: recipe.ratings.length });
});

// @desc    Approve or Reject a recipe (SUBADMIN, ADMIN)
// @route   PUT /api/recipes/:id/status
// @access  Private (SUBADMIN, ADMIN)
const updateRecipeStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Status must be 'approved' or 'rejected'");
  }

  const recipe = await Recipe.findById(req.params.id).populate("createdBy");
  if (!recipe) {
    res.status(404);
    throw new Error("Recipe not found");
  }

  recipe.status = status;
  await recipe.save();

  // Send notification to recipe author
  const author = await User.findById(recipe.createdBy._id);
  author.notifications.push({
    message: `Your recipe "${recipe.title}" has been ${status}.`,
  });
  await author.save();

  res.json({ message: `Recipe ${status} successfully`, recipe });
});

// @desc    Get all pending recipes (SUBADMIN, ADMIN)
// @route   GET /api/recipes/pending
// @access  Private (SUBADMIN, ADMIN)
const getPendingRecipes = asyncHandler(async (req, res) => {
  const recipes = await Recipe.find({ status: "pending" })
    .populate("createdBy", "name email avatar")
    .sort({ createdAt: -1 });
  res.json(recipes);
});

// @desc    Get user's own recipes
// @route   GET /api/recipes/myrecipes
// @access  Private
const getMyRecipes = asyncHandler(async (req, res) => {
  const recipes = await Recipe.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
  res.json(recipes);
});

module.exports = {
  createRecipe,
  getRecipes,
  getTrendingRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  toggleLike,
  toggleSave,
  rateRecipe,
  updateRecipeStatus,
  getPendingRecipes,
  getMyRecipes,
};
