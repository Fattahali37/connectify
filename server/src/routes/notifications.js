const express = require("express");
const router = express.Router();

const NotificationService = require("../services/notificationService");
const { protect } = require("../middleware/auth");

// Routes
router.get("/", protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await NotificationService.getUserNotifications(
      req.user._id,
      page,
      limit
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

router.post("/:notificationId/read", protect, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await NotificationService.markNotificationAsRead(
      notificationId,
      req.user._id
    );

    res.json({
      success: true,
      message: "Notification marked as read",
      data: {
        notification,
      },
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({
      success: false,
      message: "Error marking notification as read",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

router.post("/read-all", protect, async (req, res) => {
  try {
    await NotificationService.markAllNotificationsAsRead(req.user._id);

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    res.status(500).json({
      success: false,
      message: "Error marking all notifications as read",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

module.exports = router;
