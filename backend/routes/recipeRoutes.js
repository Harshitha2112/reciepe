const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/recipeController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const { upload } = require("../utils/cloudinary");

// Public routes
router.get("/", getRecipes);
router.get("/trending", getTrendingRecipes);

// Private routes — order matters: specific paths before :id
router.get("/user/myrecipes", protect, getMyRecipes);
router.post("/", protect, upload.single("image"), createRecipe);

// SUBADMIN + ADMIN only
router.get(
  "/admin/pending",
  protect,
  authorizeRoles("SUBADMIN", "ADMIN"),
  getPendingRecipes
);

// Parameterized routes
router.get("/:id", getRecipeById);
router.put("/:id", protect, upload.single("image"), updateRecipe);
router.delete("/:id", protect, deleteRecipe);
router.put("/:id/like", protect, toggleLike);
router.put("/:id/save", protect, toggleSave);
router.put("/:id/rate", protect, rateRecipe);
router.put(
  "/:id/status",
  protect,
  authorizeRoles("SUBADMIN", "ADMIN"),
  updateRecipeStatus
);

module.exports = router;
