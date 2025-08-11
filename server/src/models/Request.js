const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["follow", "friend", "group"],
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.type === "follow" || this.type === "friend";
      },
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: function () {
        return this.type === "group";
      },
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      default: function () {
        // Requests expire after 30 days
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
requestSchema.index({ type: 1, recipient: 1, status: 1 });
requestSchema.index({ type: 1, sender: 1, status: 1 });
requestSchema.index({ type: 1, chat: 1, status: 1 });
requestSchema.index({ status: 1, expiresAt: 1 });

// Virtual for checking if request is expired
requestSchema.virtual("isExpired").get(function () {
  return this.expiresAt && this.expiresAt < new Date();
});

// Method to check if request can be processed
requestSchema.methods.canProcess = function () {
  return this.status === "pending" && !this.isExpired;
};

// Pre-save middleware to handle request logic
requestSchema.pre("save", async function (next) {
  if (this.isNew) {
    // For follow requests, check if already following
    if (this.type === "follow") {
      const existingFollow = await mongoose.model("User").findOne({
        _id: this.recipient,
        followers: this.sender,
      });

      if (existingFollow) {
        const error = new Error("Already following this user");
        error.status = 400;
        return next(error);
      }
    }

    // For friend requests, check if already friends
    if (this.type === "friend") {
      const existingFriend = await mongoose.model("User").findOne({
        _id: this.recipient,
        friends: this.sender,
      });

      if (existingFriend) {
        const error = new Error("Already friends with this user");
        error.status = 400;
        return next(error);
      }
    }

    // For group invites, check if already a member
    if (this.type === "group") {
      const existingMember = await mongoose.model("Chat").findOne({
        _id: this.chat,
        participants: this.recipient,
      });

      if (existingMember) {
        const error = new Error("User is already a member of this group");
        error.status = 400;
        return next(error);
      }
    }
  }

  next();
});

// Static method to get requests for a user
requestSchema.statics.getRequestsForUser = function (
  userId,
  type = null,
  status = null
) {
  const query = {
    $or: [{ recipient: userId }, { sender: userId }],
  };

  if (type) query.type = type;
  if (status) query.status = status;

  return this.find(query)
    .populate("sender", "firstName lastName username profilePicture")
    .populate("recipient", "firstName lastName username profilePicture")
    .populate("chat", "name description")
    .sort({ createdAt: -1 });
};

// Static method to clean up expired requests
requestSchema.statics.cleanupExpired = function () {
  return this.deleteMany({
    status: "pending",
    expiresAt: { $lt: new Date() },
  });
};

module.exports = mongoose.model("Request", requestSchema);
