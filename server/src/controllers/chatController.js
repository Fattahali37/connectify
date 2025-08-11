const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/User");
const NotificationService = require("../services/notificationService");

// @desc    Get user's chats
// @route   GET /api/chat
// @access  Private
const getUserChats = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const chats = await Chat.find({
      participants: req.user._id,
      isActive: true,
    })
      .populate("participants", "username firstName lastName profilePicture")
      .populate("members.user", "username firstName lastName profilePicture")
      .populate("lastMessage")
      .populate(
        "lastMessage.sender",
        "username firstName lastName profilePicture"
      )
      .sort({ lastMessageAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Chat.countDocuments({
      participants: req.user._id,
      isActive: true,
    });

    // Add unread count and display name for each chat
    const chatsWithMetadata = chats.map((chat) => {
      const chatObj = chat.toObject();
      chatObj.unreadCount = chat.getUnreadCount(req.user._id);
      chatObj.displayName = chat.getDisplayName(req.user._id);
      chatObj.isAdmin = chat.isAdmin(req.user._id);
      chatObj.isOwner = chat.isOwner(req.user._id);
      chatObj.memberCount = chat.memberCount;
      return chatObj;
    });

    res.json({
      success: true,
      data: {
        chats: chatsWithMetadata,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalChats: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get user chats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching chats",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Create group chat
// @route   POST /api/chat/group
// @access  Private
const createGroupChat = async (req, res) => {
  try {
    const {
      name,
      description,
      participants,
      isPrivate = false,
      allowMemberInvites = true,
    } = req.body;

    if (!name || !participants || participants.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Group name and at least 2 participants are required",
      });
    }

    // Add creator to participants
    const allParticipants = [...new Set([...participants, req.user._id])];

    // Check if participants exist
    const users = await User.find({ _id: { $in: allParticipants } });
    if (users.length !== allParticipants.length) {
      return res.status(400).json({
        success: false,
        message: "Some participants not found",
      });
    }

    const chat = await Chat.create({
      participants: allParticipants,
      chatType: "group",
      chatName: name,
      chatDescription: description,
      owner: req.user._id,
      admins: [req.user._id],
      groupSettings: {
        isPrivate,
        allowMemberInvites,
        requireAdminApproval: false,
        maxMembers: 100,
      },
      createdBy: req.user._id,
    });

    // Add all participants as members
    for (const participantId of allParticipants) {
      const role =
        participantId.toString() === req.user._id.toString()
          ? "owner"
          : "member";
      chat.addMember(participantId, role);
    }
    await chat.save();

    // Populate chat data
    await chat.populate(
      "participants",
      "username firstName lastName profilePicture"
    );
    await chat.populate(
      "members.user",
      "username firstName lastName profilePicture"
    );

    const chatObj = chat.toObject();
    chatObj.unreadCount = chat.getUnreadCount(req.user._id);
    chatObj.displayName = chat.getDisplayName(req.user._id);
    chatObj.isAdmin = chat.isAdmin(req.user._id);
    chatObj.isOwner = chat.isOwner(req.user._id);
    chatObj.memberCount = chat.memberCount;

    res.status(201).json({
      success: true,
      message: "Group chat created successfully",
      data: {
        chat: chatObj,
      },
    });
  } catch (error) {
    console.error("Create group chat error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating group chat",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Get or create direct chat with user
// @route   POST /api/chat/direct
// @access  Private
const getOrCreateDirectChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot chat with yourself",
      });
    }

    // Check if user exists
    const otherUser = await User.findById(userId);
    if (!otherUser || !otherUser.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find existing direct chat
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, userId] },
      chatType: "direct",
      isActive: true,
    });

    // Create new chat if none exists
    if (!chat) {
      chat = await Chat.create({
        participants: [req.user._id, userId],
        chatType: "direct",
        createdBy: req.user._id,
      });
    }

    // Populate chat data
    await chat.populate(
      "participants",
      "username firstName lastName profilePicture"
    );
    await chat.populate("lastMessage");
    if (chat.lastMessage) {
      await chat.populate(
        "lastMessage.sender",
        "username firstName lastName profilePicture"
      );
    }

    const chatObj = chat.toObject();
    chatObj.unreadCount = chat.getUnreadCount(req.user._id);
    chatObj.displayName = chat.getDisplayName(req.user._id);

    res.json({
      success: true,
      data: {
        chat: chatObj,
      },
    });
  } catch (error) {
    console.error("Get or create direct chat error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating chat",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Get chat messages
// @route   GET /api/chat/:chatId/messages
// @access  Private
const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    // Verify user is participant in chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isActive) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Mark messages as read
    await chat.markAsRead(req.user._id);

    // Get messages
    const messages = await Message.find({
      chat: chatId,
      isDeleted: false,
    })
      .populate("sender", "username firstName lastName profilePicture")
      .populate("replyTo")
      .populate("reactions.user", "username firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Message.countDocuments({
      chat: chatId,
      isActive: true,
    });

    // Reverse messages to show oldest first
    const reversedMessages = messages.reverse();

    res.json({
      success: true,
      data: {
        messages: reversedMessages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalMessages: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get chat messages error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching messages",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Send message
// @route   POST /api/chat/:chatId/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const {
      content,
      messageType = "text",
      mediaUrl = "",
      fileName = "",
      fileSize = 0,
      fileType = "",
      replyTo,
    } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    // Verify user is participant in chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isActive) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Create message
    const message = await Message.create({
      chat: chatId,
      sender: req.user._id,
      content: content.trim(),
      messageType,
      mediaUrl,
      fileName,
      fileSize,
      fileType,
      replyTo,
    });

    // Populate message data
    await message.populate(
      "sender",
      "username firstName lastName profilePicture"
    );
    if (replyTo) {
      await message.populate("replyTo");
    }

    // Increment unread count for other participants
    for (const participantId of chat.participants) {
      if (participantId.toString() !== req.user._id.toString()) {
        await chat.incrementUnreadCount(participantId);
      }
    }

    // Send notifications
    const recipientIds = chat.participants.filter(
      (p) => p.toString() !== req.user._id.toString()
    );
    await NotificationService.notifyNewMessage(
      chatId,
      message._id,
      req.user._id,
      recipientIds
    );

    // Emit real-time event for new message
    if (global.io) {
      global.io.to(`chat:${chatId}`).emit("message-received", {
        chatId,
        message: message.getPublicData(),
      });
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: {
        message: message.getPublicData(),
      },
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending message",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    React to message
// @route   POST /api/chat/:chatId/messages/:messageId/react
// @access  Private
const reactToMessage = async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: "Emoji is required",
      });
    }

    // Verify user is participant in chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isActive) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Find message
    const message = await Message.findById(messageId);
    if (!message || message.chat.toString() !== chatId) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Add reaction
    const reactions = await message.addReaction(req.user._id, emoji);

    // Send notification if not own message
    if (message.sender.toString() !== req.user._id.toString()) {
      await NotificationService.notifyReaction(
        messageId,
        req.user._id,
        message.sender,
        emoji
      );
    }

    // Emit real-time event for reaction update
    if (global.io) {
      global.io.to(`chat:${chatId}`).emit("message-reaction-update", {
        chatId,
        messageId,
        userId: req.user._id,
        emoji,
        type: "add",
        reactions,
      });
    }

    res.json({
      success: true,
      message: "Reaction added successfully",
      data: {
        reactions,
      },
    });
  } catch (error) {
    console.error("React to message error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding reaction",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/chat/:chatId/messages/:messageId
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const { chatId, messageId } = req.params;

    // Verify user is participant in chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isActive) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Find and verify message
    const message = await Message.findById(messageId);
    if (!message || message.chat.toString() !== chatId) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if user can delete message (sender or admin)
    if (
      message.sender.toString() !== req.user._id.toString() &&
      !chat.isAdmin(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages",
      });
    }

    // Soft delete message
    message.isDeleted = true;
    await message.save();

    // Emit real-time event for message deletion
    if (global.io) {
      global.io.to(`chat:${chatId}`).emit("message-deleted", {
        chatId,
        messageId,
      });
    }

    res.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting message",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Mark chat as read
// @route   POST /api/chat/:chatId/read
// @access  Private
const markChatAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Verify user is participant in chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isActive) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Mark messages as read
    await chat.markAsRead(req.user._id);

    res.json({
      success: true,
      message: "Chat marked as read",
    });
  } catch (error) {
    console.error("Mark chat as read error:", error);
    res.status(500).json({
      success: false,
      message: "Error marking chat as read",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Start typing indicator
// @route   POST /api/chat/:chatId/typing/start
// @access  Private
const startTyping = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Verify user is participant in chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isActive) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Add typing user
    chat.addTypingUser(req.user._id);
    await chat.save();

    // Emit real-time typing event
    if (global.io) {
      global.io.to(`chat:${chatId}`).emit("user-typing", {
        chatId,
        userId: req.user._id,
        userName: `${req.user.firstName} ${req.user.lastName}`,
        type: "start",
      });
    }

    res.json({
      success: true,
      message: "Typing indicator started",
    });
  } catch (error) {
    console.error("Start typing error:", error);
    res.status(500).json({
      success: false,
      message: "Error starting typing indicator",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Stop typing indicator
// @route   POST /api/chat/:chatId/typing/stop
// @access  Private
const stopTyping = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Verify user is participant in chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isActive) {
      return res.status(403).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Remove typing user
    chat.removeTypingUser(req.user._id);
    await chat.save();

    // Emit real-time typing stop event
    if (global.io) {
      global.io.to(`chat:${chatId}`).emit("user-typing", {
        chatId,
        userId: req.user._id,
        type: "stop",
      });
    }

    res.json({
      success: true,
      message: "Typing indicator stopped",
    });
  } catch (error) {
    console.error("Stop typing error:", error);
    res.status(500).json({
      success: false,
      message: "Error stopping typing indicator",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Get typing users
// @route   GET /api/chat/:chatId/typing
// @access  Private
const getTypingUsers = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Verify user is participant in chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isActive) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Clean up old typing indicators
    chat.cleanupTypingUsers();
    await chat.save();

    // Get typing users
    const typingUsers = await User.find({
      _id: { $in: chat.typingUsers.map((t) => t.user) },
    }).select("username firstName lastName profilePicture");

    res.json({
      success: true,
      data: {
        typingUsers,
      },
    });
  } catch (error) {
    console.error("Get typing users error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting typing users",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

module.exports = {
  getUserChats,
  createGroupChat,
  getOrCreateDirectChat,
  getChatMessages,
  sendMessage,
  reactToMessage,
  deleteMessage,
  markChatAsRead,
  startTyping,
  stopTyping,
  getTypingUsers,
};
