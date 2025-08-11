const Request = require("../models/Request");
const User = require("../models/User");
const Chat = require("../models/Chat");
const Notification = require("../models/Notification");

// Helper function to create notification
const createNotification = async (
  recipientId,
  type,
  title,
  message,
  data = {}
) => {
  try {
    await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      data,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

// Get follow requests for the current user
const getFollowRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const requests = await Request.find({
      type: "follow",
      recipient: req.user._id,
      status: "pending",
    })
      .populate("sender", "firstName lastName username profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Request.countDocuments({
      type: "follow",
      recipient: req.user._id,
      status: "pending",
    });

    res.json({
      success: true,
      data: {
        requests,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting follow requests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get follow requests",
    });
  }
};

// Create a follow request
const createFollowRequest = async (req, res) => {
  try {
    const { userId, message } = req.body;

    // Check if request already exists
    const existingRequest = await Request.findOne({
      type: "follow",
      sender: req.user._id,
      recipient: userId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Follow request already sent",
      });
    }

    // Create the request
    const request = await Request.create({
      type: "follow",
      sender: req.user._id,
      recipient: userId,
      message,
    });

    await request.populate(
      "sender",
      "firstName lastName username profilePicture"
    );

    // Create notification
    await createNotification(
      userId,
      "follow_request",
      "New Follow Request",
      `${req.user.firstName} ${req.user.lastName} wants to follow you`,
      { requestId: request._id, senderId: req.user._id }
    );

    res.status(201).json({
      success: true,
      data: { request },
    });
  } catch (error) {
    console.error("Error creating follow request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create follow request",
    });
  }
};

// Accept follow request
const acceptFollowRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await Request.findOne({
      _id: requestId,
      type: "follow",
      recipient: req.user._id,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Follow request not found",
      });
    }

    // Update request status
    request.status = "accepted";
    await request.save();

    // Add follower relationship
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { followers: request.sender },
    });

    await User.findByIdAndUpdate(request.sender, {
      $addToSet: { following: req.user._id },
    });

    // Create notification
    await createNotification(
      request.sender,
      "follow_accepted",
      "Follow Request Accepted",
      `${req.user.firstName} ${req.user.lastName} accepted your follow request`,
      { userId: req.user._id }
    );

    res.json({
      success: true,
      message: "Follow request accepted",
    });
  } catch (error) {
    console.error("Error accepting follow request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to accept follow request",
    });
  }
};

// Reject follow request
const rejectFollowRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await Request.findOne({
      _id: requestId,
      type: "follow",
      recipient: req.user._id,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Follow request not found",
      });
    }

    // Update request status
    request.status = "rejected";
    await request.save();

    // Create notification
    await createNotification(
      request.sender,
      "follow_rejected",
      "Follow Request Rejected",
      `${req.user.firstName} ${req.user.lastName} rejected your follow request`,
      { userId: req.user._id }
    );

    res.json({
      success: true,
      message: "Follow request rejected",
    });
  } catch (error) {
    console.error("Error rejecting follow request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject follow request",
    });
  }
};

// Cancel follow request
const cancelFollowRequest = async (req, res) => {
  try {
    const { userId } = req.params;

    const request = await Request.findOneAndDelete({
      type: "follow",
      sender: req.user._id,
      recipient: userId,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Follow request not found",
      });
    }

    res.json({
      success: true,
      message: "Follow request cancelled",
    });
  } catch (error) {
    console.error("Error cancelling follow request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel follow request",
    });
  }
};

// Get friend requests for the current user
const getFriendRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const requests = await Request.find({
      type: "friend",
      recipient: req.user._id,
      status: "pending",
    })
      .populate("sender", "firstName lastName username profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Request.countDocuments({
      type: "friend",
      recipient: req.user._id,
      status: "pending",
    });

    res.json({
      success: true,
      data: {
        requests,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting friend requests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get friend requests",
    });
  }
};

// Create a friend request
const createFriendRequest = async (req, res) => {
  try {
    const { userId, message } = req.body;

    // Check if request already exists
    const existingRequest = await Request.findOne({
      type: "friend",
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id },
      ],
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Friend request already exists",
      });
    }

    // Create the request
    const request = await Request.create({
      type: "friend",
      sender: req.user._id,
      recipient: userId,
      message,
    });

    await request.populate(
      "sender",
      "firstName lastName username profilePicture"
    );

    // Create notification
    await createNotification(
      userId,
      "friend_request",
      "New Friend Request",
      `${req.user.firstName} ${req.user.lastName} wants to be your friend`,
      { requestId: request._id, senderId: req.user._id }
    );

    res.status(201).json({
      success: true,
      data: { request },
    });
  } catch (error) {
    console.error("Error creating friend request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create friend request",
    });
  }
};

// Accept friend request
const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await Request.findOne({
      _id: requestId,
      type: "friend",
      recipient: req.user._id,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found",
      });
    }

    // Update request status
    request.status = "accepted";
    await request.save();

    // Add friend relationship
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { friends: request.sender },
    });

    await User.findByIdAndUpdate(request.sender, {
      $addToSet: { friends: req.user._id },
    });

    // Create notification
    await createNotification(
      request.sender,
      "friend_accepted",
      "Friend Request Accepted",
      `${req.user.firstName} ${req.user.lastName} accepted your friend request`,
      { userId: req.user._id }
    );

    res.json({
      success: true,
      message: "Friend request accepted",
    });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to accept friend request",
    });
  }
};

// Reject friend request
const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await Request.findOne({
      _id: requestId,
      type: "friend",
      recipient: req.user._id,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found",
      });
    }

    // Update request status
    request.status = "rejected";
    await request.save();

    // Create notification
    await createNotification(
      request.sender,
      "friend_rejected",
      "Friend Request Rejected",
      `${req.user.firstName} ${req.user.lastName} rejected your friend request`,
      { userId: req.user._id }
    );

    res.json({
      success: true,
      message: "Friend request rejected",
    });
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject friend request",
    });
  }
};

// Cancel friend request
const cancelFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;

    const request = await Request.findOneAndDelete({
      type: "friend",
      sender: req.user._id,
      recipient: userId,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found",
      });
    }

    res.json({
      success: true,
      message: "Friend request cancelled",
    });
  } catch (error) {
    console.error("Error cancelling friend request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel friend request",
    });
  }
};

// Get group invites for the current user
const getGroupInvites = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const requests = await Request.find({
      type: "group",
      recipient: req.user._id,
      status: "pending",
    })
      .populate("sender", "firstName lastName username profilePicture")
      .populate("chat", "name description")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Request.countDocuments({
      type: "group",
      recipient: req.user._id,
      status: "pending",
    });

    res.json({
      success: true,
      data: {
        requests,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting group invites:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get group invites",
    });
  }
};

// Create a group invite
const createGroupInvite = async (req, res) => {
  try {
    const { chatId, userId, message } = req.body;

    // Check if user is admin of the group
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user._id,
      "participants.role": "admin",
    });

    if (!chat) {
      return res.status(403).json({
        success: false,
        message: "Only group admins can send invites",
      });
    }

    // Check if request already exists
    const existingRequest = await Request.findOne({
      type: "group",
      chat: chatId,
      recipient: userId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Group invite already sent",
      });
    }

    // Create the request
    const request = await Request.create({
      type: "group",
      sender: req.user._id,
      recipient: userId,
      chat: chatId,
      message,
    });

    await request.populate([
      { path: "sender", select: "firstName lastName username profilePicture" },
      { path: "chat", select: "name description" },
    ]);

    // Create notification
    await createNotification(
      userId,
      "group_invite",
      "Group Invite",
      `${req.user.firstName} ${req.user.lastName} invited you to join ${chat.name}`,
      { requestId: request._id, chatId, senderId: req.user._id }
    );

    res.status(201).json({
      success: true,
      data: { request },
    });
  } catch (error) {
    console.error("Error creating group invite:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create group invite",
    });
  }
};

// Accept group invite
const acceptGroupInvite = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await Request.findOne({
      _id: requestId,
      type: "group",
      recipient: req.user._id,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Group invite not found",
      });
    }

    // Update request status
    request.status = "accepted";
    await request.save();

    // Add user to group
    await Chat.findByIdAndUpdate(request.chat, {
      $addToSet: { participants: req.user._id },
    });

    // Create notification
    await createNotification(
      request.sender,
      "group_invite_accepted",
      "Group Invite Accepted",
      `${req.user.firstName} ${req.user.lastName} accepted your group invite`,
      { chatId: request.chat, userId: req.user._id }
    );

    res.json({
      success: true,
      message: "Group invite accepted",
    });
  } catch (error) {
    console.error("Error accepting group invite:", error);
    res.status(500).json({
      success: false,
      message: "Failed to accept group invite",
    });
  }
};

// Reject group invite
const rejectGroupInvite = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await Request.findOne({
      _id: requestId,
      type: "group",
      recipient: req.user._id,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Group invite not found",
      });
    }

    // Update request status
    request.status = "rejected";
    await request.save();

    // Create notification
    await createNotification(
      request.sender,
      "group_invite_rejected",
      "Group Invite Rejected",
      `${req.user.firstName} ${req.user.lastName} rejected your group invite`,
      { chatId: request.chat, userId: req.user._id }
    );

    res.json({
      success: true,
      message: "Group invite rejected",
    });
  } catch (error) {
    console.error("Error rejecting group invite:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject group invite",
    });
  }
};

// Cancel group invite
const cancelGroupInvite = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await Request.findOne({
      _id: requestId,
      type: "group",
      sender: req.user._id,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Group invite not found",
      });
    }

    await Request.findByIdAndDelete(requestId);

    res.json({
      success: true,
      message: "Group invite cancelled",
    });
  } catch (error) {
    console.error("Error cancelling group invite:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel group invite",
    });
  }
};

module.exports = {
  // Follow request methods
  getFollowRequests,
  createFollowRequest,
  acceptFollowRequest,
  rejectFollowRequest,
  cancelFollowRequest,

  // Friend request methods
  getFriendRequests,
  createFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,

  // Group invite methods
  getGroupInvites,
  createGroupInvite,
  acceptGroupInvite,
  rejectGroupInvite,
  cancelGroupInvite,
};
