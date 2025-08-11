const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const requestController = require("../controllers/requestController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

// Validation rules
const createRequestValidation = [
  body("userId").isMongoId().withMessage("Valid user ID is required"),
  body("message")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Message cannot exceed 500 characters"),
];

const groupInviteValidation = [
  body("chatId").isMongoId().withMessage("Valid chat ID is required"),
  body("userId").isMongoId().withMessage("Valid user ID is required"),
  body("message")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Message cannot exceed 500 characters"),
];

// Follow request routes
router.get("/follow", protect, requestController.getFollowRequests);
router.post(
  "/follow",
  protect,
  createRequestValidation,
  validate,
  requestController.createFollowRequest
);
router.put(
  "/follow/:requestId/accept",
  protect,
  requestController.acceptFollowRequest
);
router.put(
  "/follow/:requestId/reject",
  protect,
  requestController.rejectFollowRequest
);
router.delete(
  "/follow/:userId",
  protect,
  requestController.cancelFollowRequest
);

// Friend request routes
router.get("/friend", protect, requestController.getFriendRequests);
router.post(
  "/friend",
  protect,
  createRequestValidation,
  validate,
  requestController.createFriendRequest
);
router.put(
  "/friend/:requestId/accept",
  protect,
  requestController.acceptFriendRequest
);
router.put(
  "/friend/:requestId/reject",
  protect,
  requestController.rejectFriendRequest
);
router.delete(
  "/friend/:userId",
  protect,
  requestController.cancelFriendRequest
);

// Group invite routes
router.get("/group", protect, requestController.getGroupInvites);
router.post(
  "/group",
  protect,
  groupInviteValidation,
  validate,
  requestController.createGroupInvite
);
router.put(
  "/group/:requestId/accept",
  protect,
  requestController.acceptGroupInvite
);
router.put(
  "/group/:requestId/reject",
  protect,
  requestController.rejectGroupInvite
);
router.delete(
  "/group/:requestId",
  protect,
  requestController.cancelGroupInvite
);

module.exports = router;
