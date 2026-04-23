const asyncHandler = require("express-async-handler");
const Comment = require("../models/Comment");
const Recipe = require("../models/Recipe");

// @desc    Add a comment to a recipe
// @route   POST /api/comments/:recipeId
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) {
    res.status(400);
    throw new Error("Comment text is required");
  }

  const recipe = await Recipe.findById(req.params.recipeId);
  if (!recipe) {
    res.status(404);
    throw new Error("Recipe not found");
  }

  const comment = await Comment.create({
    recipe: req.params.recipeId,
    user: req.user._id,
    text,
  });

  const populated = await comment.populate("user", "name avatar");
  res.status(201).json(populated);
});

// @desc    Get comments for a recipe
// @route   GET /api/comments/:recipeId
// @access  Public
const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({
    recipe: req.params.recipeId,
    isDeleted: false,
  })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 });

  res.json(comments);
});

// @desc    Delete a comment (owner, SUBADMIN, ADMIN)
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  const isOwner = comment.user.toString() === req.user._id.toString();
  const isPrivileged = ["ADMIN", "SUBADMIN"].includes(req.user.role);

  if (!isOwner && !isPrivileged) {
    res.status(403);
    throw new Error("Not authorized to delete this comment");
  }

  comment.isDeleted = true;
  await comment.save();

  res.json({ message: "Comment deleted" });
});

module.exports = { addComment, getComments, deleteComment };
