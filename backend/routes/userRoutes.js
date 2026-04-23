const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
  toggleBanUser,
  deleteUser,
  getAnalytics,
  createUser,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// All routes below require at least SUBADMIN role
router.get("/", protect, authorizeRoles("ADMIN", "SUBADMIN"), getAllUsers);
router.get("/analytics", protect, authorizeRoles("ADMIN", "SUBADMIN"), getAnalytics);
router.get("/:id", protect, authorizeRoles("ADMIN", "SUBADMIN"), getUserById);
router.put("/:id", protect, authorizeRoles("ADMIN", "SUBADMIN"), updateUser);

// Routes below require ADMIN role
router.post("/", protect, authorizeRoles("ADMIN"), createUser);
router.put("/:id/role", protect, authorizeRoles("ADMIN"), updateUserRole);
router.put("/:id/ban", protect, authorizeRoles("ADMIN"), toggleBanUser);
router.delete("/:id", protect, authorizeRoles("ADMIN"), deleteUser);

module.exports = router;
