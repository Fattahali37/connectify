const Notification = require("../models/Notification");
const User = require("../models/User");

class NotificationService {
  // Create and send notification for new message
  static async notifyNewMessage(chatId, messageId, senderId, recipientIds) {
    try {
      const sender = await User.findById(senderId).select(
        "username firstName lastName"
      );
      if (!sender) return;

      const notifications = [];

      for (const recipientId of recipientIds) {
        if (recipientId.toString() === senderId.toString()) continue;

        const notification = await Notification.createNotification({
          recipient: recipientId,
          sender: senderId,
          type: "message",
          title: `New message from ${sender.firstName} ${sender.lastName}`,
          body: "You have a new message",
          data: {
            chatId,
            messageId,
            userId: senderId,
          },
          priority: "high",
        });

        notifications.push(notification);

        // Send push notification (implement with your preferred service)
        await this.sendPushNotification(notification);
      }

      return notifications;
    } catch (error) {
      console.error("Error creating message notification:", error);
    }
  }

  // Create and send notification for message reaction
  static async notifyReaction(messageId, senderId, recipientId, emoji) {
    try {
      const sender = await User.findById(senderId).select(
        "username firstName lastName"
      );
      if (!sender) return;

      const notification = await Notification.createNotification({
        recipient: recipientId,
        sender: senderId,
        type: "reaction",
        title: `${sender.firstName} reacted to your message`,
        body: `Reacted with ${emoji}`,
        data: {
          messageId,
          userId: senderId,
        },
        priority: "normal",
      });

      await this.sendPushNotification(notification);
      return notification;
    } catch (error) {
      console.error("Error creating reaction notification:", error);
    }
  }

  // Create and send notification for mention
  static async notifyMention(chatId, messageId, senderId, mentionedUserIds) {
    try {
      const sender = await User.findById(senderId).select(
        "username firstName lastName"
      );
      if (!sender) return;

      const notifications = [];

      for (const mentionedUserId of mentionedUserIds) {
        if (mentionedUserId.toString() === senderId.toString()) continue;

        const notification = await Notification.createNotification({
          recipient: mentionedUserId,
          sender: senderId,
          type: "mention",
          title: `${sender.firstName} mentioned you`,
          body: "You were mentioned in a message",
          data: {
            chatId,
            messageId,
            userId: senderId,
          },
          priority: "high",
        });

        notifications.push(notification);
        await this.sendPushNotification(notification);
      }

      return notifications;
    } catch (error) {
      console.error("Error creating mention notification:", error);
    }
  }

  // Create and send notification for group invite
  static async notifyGroupInvite(groupId, inviterId, inviteeIds) {
    try {
      const inviter = await User.findById(inviterId).select(
        "username firstName lastName"
      );
      if (!inviter) return;

      const notifications = [];

      for (const inviteeId of inviteeIds) {
        const notification = await Notification.createNotification({
          recipient: inviteeId,
          sender: inviterId,
          type: "group_invite",
          title: `${inviter.firstName} invited you to a group`,
          body: "You have a new group invitation",
          data: {
            groupId,
            userId: inviterId,
          },
          priority: "normal",
        });

        notifications.push(notification);
        await this.sendPushNotification(notification);
      }

      return notifications;
    } catch (error) {
      console.error("Error creating group invite notification:", error);
    }
  }

  // Create and send notification for follow
  static async notifyFollow(followerId, followedId) {
    try {
      const follower = await User.findById(followerId).select(
        "username firstName lastName"
      );
      if (!follower) return;

      const notification = await Notification.createNotification({
        recipient: followedId,
        sender: followerId,
        type: "follow",
        title: `${follower.firstName} started following you`,
        body: "You have a new follower",
        data: {
          userId: followerId,
        },
        priority: "normal",
      });

      await this.sendPushNotification(notification);
      return notification;
    } catch (error) {
      console.error("Error creating follow notification:", error);
    }
  }

  // Create and send notification for like
  static async notifyLike(postId, likerId, postOwnerId) {
    try {
      if (likerId.toString() === postOwnerId.toString()) return;

      const liker = await User.findById(likerId).select(
        "username firstName lastName"
      );
      if (!liker) return;

      const notification = await Notification.createNotification({
        recipient: postOwnerId,
        sender: likerId,
        type: "like",
        title: `${liker.firstName} liked your post`,
        body: "Someone liked your post",
        data: {
          postId,
          userId: likerId,
        },
        priority: "normal",
      });

      await this.sendPushNotification(notification);
      return notification;
    } catch (error) {
      console.error("Error creating like notification:", error);
    }
  }

  // Create and send notification for comment
  static async notifyComment(postId, commenterId, postOwnerId) {
    try {
      if (commenterId.toString() === postOwnerId.toString()) return;

      const commenter = await User.findById(commenterId).select(
        "username firstName lastName"
      );
      if (!commenter) return;

      const notification = await Notification.createNotification({
        recipient: postOwnerId,
        sender: commenterId,
        type: "comment",
        title: `${commenter.firstName} commented on your post`,
        body: "Someone commented on your post",
        data: {
          postId,
          userId: commenterId,
        },
        priority: "normal",
      });

      await this.sendPushNotification(notification);
      return notification;
    } catch (error) {
      console.error("Error creating comment notification:", error);
    }
  }

  // Send push notification (implement with your preferred service)
  static async sendPushNotification(notification) {
    try {
      // This is a placeholder for push notification implementation
      // You can integrate with services like:
      // - Firebase Cloud Messaging (FCM)
      // - OneSignal
      // - Pusher
      // - WebSockets for real-time web notifications

      console.log(
        `Sending push notification: ${notification.title} to ${notification.recipient}`
      );

      // Example WebSocket implementation:
      // if (global.io) {
      //   global.io.to(notification.recipient.toString()).emit('notification', {
      //     id: notification._id,
      //     title: notification.title,
      //     body: notification.body,
      //     type: notification.type,
      //     data: notification.data,
      //     createdAt: notification.createdAt
      //   });
      // }

      // Mark as delivered
      await notification.markAsDelivered();
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  }

  // Get user's notifications
  static async getUserNotifications(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const notifications = await Notification.find({
        recipient: userId,
        expiresAt: { $gt: new Date() },
      })
        .populate("sender", "username firstName lastName profilePicture")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const total = await Notification.countDocuments({
        recipient: userId,
        expiresAt: { $gt: new Date() },
      });

      return {
        notifications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalNotifications: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      console.error("Error getting user notifications:", error);
      throw error;
    }
  }

  // Mark notification as read
  static async markNotificationAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        recipient: userId,
      });

      if (notification) {
        await notification.markAsRead();
      }

      return notification;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // Mark all notifications as read for user
  static async markAllNotificationsAsRead(userId) {
    try {
      return await Notification.markAllAsRead(userId);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  // Clean up expired notifications
  static async cleanupExpiredNotifications() {
    try {
      return await Notification.cleanupExpired();
    } catch (error) {
      console.error("Error cleaning up expired notifications:", error);
      throw error;
    }
  }
}

module.exports = NotificationService;
