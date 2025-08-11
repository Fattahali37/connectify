const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const postController = require("../controllers/postController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

// Validation rules
const createPostValidation = [
  body("caption")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Caption cannot exceed 1000 characters"),
  body("image")
    .optional()
    .isURL()
    .withMessage("Please provide a valid image URL"),
  body("tags")
    .optional()
    .isString()
    .withMessage("Tags must be a comma-separated string"),
  body("location")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Location cannot exceed 100 characters"),
];

const commentValidation = [
  body("text")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Comment must be between 1 and 500 characters"),
];

// Routes
router.get("/", protect, postController.getPosts);
router.get("/user/:userId", protect, postController.getUserPosts);
router.get("/:id", protect, postController.getPost);

router.post(
  "/",
  protect,
  createPostValidation,
  validate,
  postController.createPost
);
router.post("/:id/like", protect, postController.toggleLike);
router.post(
  "/:id/comment",
  protect,
  commentValidation,
  validate,
  postController.addComment
);

router.delete("/:id", protect, postController.deletePost);

module.exports = router;
