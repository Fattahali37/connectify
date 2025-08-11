const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const userController = require("../controllers/userController");
const { protect, optionalAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");

// Validation rules
const updateProfileValidation = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("First name must be between 1 and 30 characters"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Last name must be between 1 and 30 characters"),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters"),
];

// Routes
router.get("/profile/:username", optionalAuth, userController.getUserProfile);
router.put(
  "/profile",
  protect,
  updateProfileValidation,
  validate,
  userController.updateProfile
);
router.get("/search", optionalAuth, userController.searchUsers);
router.post("/follow/:userId", protect, userController.followUser);
router.delete("/follow/:userId", protect, userController.unfollowUser);
router.get("/followers", protect, userController.getFollowers);
router.get("/following", protect, userController.getFollowing);

module.exports = router;
