const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const chatController = require("../controllers/chatController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

// Validation rules
const sendMessageValidation = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Message must be between 1 and 1000 characters"),
  body("messageType")
    .optional()
    .isIn(["text", "image", "file", "audio", "video", "location", "contact"])
    .withMessage("Invalid message type"),
  body("mediaUrl")
    .optional()
    .isURL()
    .withMessage("Please provide a valid media URL"),
  body("fileName")
    .optional()
    .isLength({ max: 255 })
    .withMessage("File name cannot exceed 255 characters"),
  body("fileSize")
    .optional()
    .isNumeric()
    .withMessage("File size must be a number"),
  body("fileType")
    .optional()
    .isLength({ max: 100 })
    .withMessage("File type cannot exceed 100 characters"),
  body("replyTo")
    .optional()
    .isMongoId()
    .withMessage("Invalid reply message ID"),
];

const createDirectChatValidation = [
  body("userId").isMongoId().withMessage("Valid user ID is required"),
];

const createGroupChatValidation = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Group name must be between 1 and 50 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Group description cannot exceed 200 characters"),
  body("participants")
    .isArray({ min: 1 })
    .withMessage("At least one participant is required"),
  body("participants.*").isMongoId().withMessage("Invalid participant ID"),
  body("isPrivate")
    .optional()
    .isBoolean()
    .withMessage("isPrivate must be a boolean"),
  body("allowMemberInvites")
    .optional()
    .isBoolean()
    .withMessage("allowMemberInvites must be a boolean"),
];

const reactionValidation = [
  body("emoji")
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage("Emoji must be between 1 and 10 characters"),
];

// Routes
router.get("/", protect, chatController.getUserChats);
router.post(
  "/direct",
  protect,
  createDirectChatValidation,
  validate,
  chatController.getOrCreateDirectChat
);
router.post(
  "/group",
  protect,
  createGroupChatValidation,
  validate,
  chatController.createGroupChat
);
router.get("/:chatId/messages", protect, chatController.getChatMessages);
router.post(
  "/:chatId/messages",
  protect,
  sendMessageValidation,
  validate,
  chatController.sendMessage
);
router.post(
  "/:chatId/messages/:messageId/react",
  protect,
  reactionValidation,
  validate,
  chatController.reactToMessage
);
router.delete(
  "/:chatId/messages/:messageId",
  protect,
  chatController.deleteMessage
);
router.post("/:chatId/read", protect, chatController.markChatAsRead);
router.post("/:chatId/typing/start", protect, chatController.startTyping);
router.post("/:chatId/typing/stop", protect, chatController.stopTyping);
router.get("/:chatId/typing", protect, chatController.getTypingUsers);

module.exports = router;
