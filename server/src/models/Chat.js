const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "audio", "video"],
      default: "text",
    },
    mediaUrl: {
      type: String,
      default: "",
    },
    fileName: {
      type: String,
      default: "",
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    fileType: {
      type: String,
      default: "",
    },
    thumbnail: {
      type: String,
      default: "",
    },
    duration: {
      type: Number, // For audio/video in seconds
      default: 0,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        emoji: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const groupMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    enum: ["member", "admin", "owner"],
    default: "member",
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    chatType: {
      type: String,
      enum: ["direct", "group"],
      default: "direct",
    },
    chatName: {
      type: String,
      trim: true,
      maxlength: [50, "Chat name cannot exceed 50 characters"],
    },
    chatDescription: {
      type: String,
      trim: true,
      maxlength: [200, "Chat description cannot exceed 200 characters"],
    },
    chatAvatar: {
      type: String,
      default: "",
    },
    groupSettings: {
      isPrivate: {
        type: Boolean,
        default: false,
      },
      allowMemberInvites: {
        type: Boolean,
        default: true,
      },
      requireAdminApproval: {
        type: Boolean,
        default: false,
      },
      maxMembers: {
        type: Number,
        default: 100,
      },
    },
    members: [groupMemberSchema],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    typingUsers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        startedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
chatSchema.index({ participants: 1, lastMessageAt: -1 });
chatSchema.index({ "unreadCount.userId": 1 });
chatSchema.index({ chatType: 1, lastMessageAt: -1 });

// Virtual for message count
chatSchema.virtual("messageCount", {
  ref: "Message",
  localField: "_id",
  foreignField: "chat",
  count: true,
});

// Virtual for member count
chatSchema.virtual("memberCount").get(function () {
  return this.members.filter((member) => member.isActive).length;
});

// Method to get chat display name
chatSchema.methods.getDisplayName = function (currentUserId) {
  if (this.chatType === "group" && this.chatName) {
    return this.chatName;
  }

  if (this.chatType === "direct") {
    const otherParticipant = this.participants.find(
      (p) => p.toString() !== currentUserId.toString()
    );
    return otherParticipant ? otherParticipant.username : "Unknown User";
  }

  return this.chatName || "Group Chat";
};

// Method to check if user is admin
chatSchema.methods.isAdmin = function (userId) {
  if (this.owner && this.owner.toString() === userId.toString()) return true;
  return this.admins.some((admin) => admin.toString() === userId.toString());
};

// Method to check if user is owner
chatSchema.methods.isOwner = function (userId) {
  return this.owner && this.owner.toString() === userId.toString();
};

// Method to add member to group
chatSchema.methods.addMember = function (userId, role = "member") {
  if (this.chatType !== "group") return false;

  const existingMember = this.members.find(
    (m) => m.user.toString() === userId.toString()
  );
  if (existingMember) {
    existingMember.isActive = true;
    existingMember.role = role;
  } else {
    this.members.push({
      user: userId,
      role: role,
      joinedAt: new Date(),
    });
  }

  this.participants.push(userId);
  return true;
};

// Method to remove member from group
chatSchema.methods.removeMember = function (userId) {
  if (this.chatType !== "group") return false;

  const memberIndex = this.members.findIndex(
    (m) => m.user.toString() === userId.toString()
  );
  if (memberIndex > -1) {
    this.members[memberIndex].isActive = false;
  }

  this.participants = this.participants.filter(
    (p) => p.toString() !== userId.toString()
  );
  return true;
};

// Method to mark messages as read
chatSchema.methods.markAsRead = async function (userId) {
  const Message = mongoose.model("Message");

  // Update unread count
  this.unreadCount.set(userId.toString(), 0);
  await this.save();

  // Mark messages as read
  await Message.updateMany(
    {
      chat: this._id,
      sender: { $ne: userId },
      "readBy.user": { $ne: userId },
    },
    {
      $push: {
        readBy: {
          user: userId,
          readAt: new Date(),
        },
      },
      $set: { isRead: true },
    }
  );
};

// Method to get unread count for a user
chatSchema.methods.getUnreadCount = function (userId) {
  return this.unreadCount.get(userId.toString()) || 0;
};

// Method to increment unread count
chatSchema.methods.incrementUnreadCount = async function (userId) {
  const currentCount = this.unreadCount.get(userId.toString()) || 0;
  this.unreadCount.set(userId.toString(), currentCount + 1);
  await this.save();
};

// Method to add typing user
chatSchema.methods.addTypingUser = function (userId) {
  const existingIndex = this.typingUsers.findIndex(
    (t) => t.user.toString() === userId.toString()
  );
  if (existingIndex > -1) {
    this.typingUsers[existingIndex].startedAt = new Date();
  } else {
    this.typingUsers.push({
      user: userId,
      startedAt: new Date(),
    });
  }
};

// Method to remove typing user
chatSchema.methods.removeTypingUser = function (userId) {
  this.typingUsers = this.typingUsers.filter(
    (t) => t.user.toString() !== userId.toString()
  );
};

// Method to clean up old typing indicators
chatSchema.methods.cleanupTypingUsers = function () {
  const fiveSecondsAgo = new Date(Date.now() - 5000);
  this.typingUsers = this.typingUsers.filter(
    (t) => t.startedAt > fiveSecondsAgo
  );
};

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
