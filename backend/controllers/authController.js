const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const userExists = await User.findOne({ email: normalizedEmail });
  if (userExists) {
    res.status(400);
    throw new Error("User with this email already exists");
  }

  const userRole = role && ["ADMIN", "SUBADMIN", "USER"].includes(role) ? role : "USER";
  const user = await User.create({ name, email: normalizedEmail, password, role: userRole });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (user && (await user.matchPassword(password))) {
    if (user.isBanned) {
      res.status(403);
      throw new Error("Your account has been banned. Contact admin.");
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password")
    .populate("savedRecipes", "title image category averageRating");

  res.json(user);
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.name = req.body.name || user.name;
  user.bio = req.body.bio || user.bio;

  // If a new avatar was uploaded via Cloudinary
  if (req.file) {
    user.avatar = req.file.path;
  }

  // Only update password if provided
  if (req.body.password) {
    user.password = req.body.password;
  }

  const updated = await user.save();

  res.json({
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    avatar: updated.avatar,
    bio: updated.bio,
    token: generateToken(updated._id),
  });
});

// @desc    Mark notification as read
// @route   PUT /api/auth/notifications/:id/read
// @access  Private
const markNotificationRead = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const notif = user.notifications.id(req.params.id);
  if (notif) {
    notif.read = true;
    await user.save();
  }
  res.json({ message: "Notification marked as read" });
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  markNotificationRead,
};
