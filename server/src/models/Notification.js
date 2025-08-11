const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: [
        "message",
        "mention",
        "reaction",
        "follow",
        "like",
        "comment",
        "group_invite",
        "group_join",
        "group_leave",
        "admin_promotion",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    data: {
      chatId: mongoose.Schema.Types.ObjectId,
      messageId: mongoose.Schema.Types.ObjectId,
      postId: mongoose.Schema.Types.ObjectId,
      userId: mongoose.Schema.Types.ObjectId,
      groupId: mongoose.Schema.Types.ObjectId,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },
    scheduledFor: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      default: function () {
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      },
    },
    deviceTokens: [
      {
        token: String,
        platform: {
          type: String,
          enum: ["web", "ios", "android"],
          default: "web",
        },
        lastUsed: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 });

// Method to mark as read
notificationSchema.methods.markAsRead = async function () {
  this.isRead = true;
  await this.save();
};

// Method to mark as delivered
notificationSchema.methods.markAsDelivered = async function () {
  this.isDelivered = true;
  await this.save();
};

// Method to add device token
notificationSchema.methods.addDeviceToken = async function (
  token,
  platform = "web"
) {
  const existingToken = this.deviceTokens.find((dt) => dt.token === token);
  if (existingToken) {
    existingToken.lastUsed = new Date();
    existingToken.platform = platform;
  } else {
    this.deviceTokens.push({
      token,
      platform,
      lastUsed: new Date(),
    });
  }
  await this.save();
};

// Method to remove device token
notificationSchema.methods.removeDeviceToken = async function (token) {
  this.deviceTokens = this.deviceTokens.filter((dt) => dt.token !== token);
  await this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function (data) {
  const notification = new this(data);
  await notification.save();
  return notification;
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = async function (userId) {
  return await this.countDocuments({
    recipient: userId,
    isRead: false,
    expiresAt: { $gt: new Date() },
  });
};

// Static method to mark all notifications as read for user
notificationSchema.statics.markAllAsRead = async function (userId) {
  return await this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
};

// Static method to clean up expired notifications
notificationSchema.statics.cleanupExpired = async function () {
  return await this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
};

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
