const express = require("express");
const router = express.Router();
const {
  addComment,
  getComments,
  deleteComment,
} = require("../controllers/commentController");
const { protect } = require("../middlewares/authMiddleware");

router.get("/:recipeId", getComments);
router.post("/:recipeId", protect, addComment);
router.delete("/:id", protect, deleteComment);

module.exports = router;
