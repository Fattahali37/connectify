const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

// Validation rules
const signupValidation = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("firstName")
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("First name is required and must be less than 30 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Last name is required and must be less than 30 characters"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Routes
router.post("/signup", signupValidation, validate, authController.signup);
router.post("/login", loginValidation, validate, authController.login);
router.get("/me", protect, authController.getMe);
router.post("/refresh", protect, authController.refreshToken);
router.post("/logout", protect, authController.logout);

module.exports = router;
