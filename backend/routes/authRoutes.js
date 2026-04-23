const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  markNotificationRead,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { upload } = require("../utils/cloudinary");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes (require JWT)
router.get("/me", protect, getMe);
router.put("/profile", protect, upload.single("avatar"), updateProfile);
router.put("/notifications/:id/read", protect, markNotificationRead);

module.exports = router;
