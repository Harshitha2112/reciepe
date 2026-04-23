const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Recipe = require("../models/Recipe");
const Comment = require("../models/Comment");

// @desc    Get all users (ADMIN only)
// @route   GET /api/users
// @access  Private (ADMIN)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password").sort({ createdAt: -1 });
  res.json(users);
});

// @desc    Get user by ID (ADMIN only)
// @route   GET /api/users/:id
// @access  Private (ADMIN)
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});

// @desc    Update user role (ADMIN only)
// @route   PUT /api/users/:id/role
// @access  Private (ADMIN)
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!["USER", "SUBADMIN", "ADMIN"].includes(role)) {
    res.status(400);
    throw new Error("Invalid role");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.role = role;
  await user.save();
  res.json({ message: `User role updated to ${role}`, user });
});

// @desc    Ban / Unban a user (ADMIN only)
// @route   PUT /api/users/:id/ban
// @access  Private (ADMIN)
const toggleBanUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.isBanned = !user.isBanned;
  await user.save();

  res.json({
    message: user.isBanned ? "User banned successfully" : "User unbanned successfully",
    isBanned: user.isBanned,
  });
});

// @desc    Delete a user (ADMIN only)
// @route   DELETE /api/users/:id
// @access  Private (ADMIN)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted successfully" });
});

// @desc    Get admin analytics dashboard
// @route   GET /api/users/analytics
// @access  Private (ADMIN, SUBADMIN)
const getAnalytics = asyncHandler(async (req, res) => {
  const [totalUsers, totalRecipes, pendingRecipes, totalComments] = await Promise.all([
    User.countDocuments(),
    Recipe.countDocuments({ status: "approved" }),
    Recipe.countDocuments({ status: "pending" }),
    Comment.countDocuments({ isDeleted: false }),
  ]);

  const usersByRole = await User.aggregate([
    { $group: { _id: "$role", count: { $sum: 1 } } },
  ]);

  const recipesByCategory = await Recipe.aggregate([
    { $match: { status: "approved" } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Recent signups (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
  const recentRecipes = await Recipe.countDocuments({ createdAt: { $gte: sevenDaysAgo }, status: "approved" });

  const activeUsers = Math.floor(totalUsers * 0.7);
  const revenue = totalRecipes * 5;

  // Recent activity (latest users and recipes)
  const recentActivity = await Promise.all([
    User.find().sort({ createdAt: -1 }).limit(5).select("name role createdAt"),
    Recipe.find().sort({ createdAt: -1 }).limit(5).select("title status createdAt"),
  ]);

  res.json({
    totalUsers,
    totalRecipes,
    pendingRecipes,
    totalComments,
    recentUsers,
    recentRecipes,
    usersByRole,
    recipesByCategory,
    activeUsers,
    revenue,
    recentActivity: {
      users: recentActivity[0],
      recipes: recentActivity[1]
    }
  });
});

// @desc    Create a new user (ADMIN only)
// @route   POST /api/users
// @access  Private (ADMIN)
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || "USER",
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Update user basic info (ADMIN, SUBADMIN)
// @route   PUT /api/users/:id
// @access  Private (ADMIN, SUBADMIN)
const updateUser = asyncHandler(async (req, res) => {
  const { name, email, bio } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Prevent sub-admins from editing admins
  if (req.user.role === "SUBADMIN" && user.role === "ADMIN") {
    res.status(403);
    throw new Error("Sub-Admins cannot edit Admins");
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.bio = bio || user.bio;

  const updatedUser = await user.save();
  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    bio: updatedUser.bio,
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
  toggleBanUser,
  deleteUser,
  getAnalytics,
  createUser,
};
