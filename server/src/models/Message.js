const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'audio', 'video', 'location', 'contact'],
    default: 'text'
  },
  mediaUrl: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    default: ''
  },
  fileSize: {
    type: Number,
    default: 0
  },
  fileType: {
    type: String,
    default: ''
  },
  thumbnail: {
    type: String,
    default: ''
  },
  duration: {
    type: Number, // For audio/video in seconds
    default: 0
  },
  dimensions: {
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 }
  },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String }
  },
  contact: {
    name: { type: String },
    phone: { type: String },
    email: { type: String }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  forwardedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  forwardedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ 'reactions.user': 1 });

// Method to mark message as read
messageSchema.methods.markAsRead = async function(userId) {
  if (!this.readBy.some(read => read.user.toString() === userId.toString())) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
    this.isRead = true;
    await this.save();
  }
};

// Method to check if user has read the message
messageSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(read => read.user.toString() === userId.toString());
};

// Method to add reaction
messageSchema.methods.addReaction = async function(userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString());
  
  // Add new reaction
  this.reactions.push({
    user: userId,
    emoji: emoji,
    createdAt: new Date()
  });
  
  await this.save();
  return this.reactions;
};

// Method to remove reaction
messageSchema.methods.removeReaction = async function(userId, emoji) {
  this.reactions = this.reactions.filter(r => 
    !(r.user.toString() === userId.toString() && r.emoji === emoji)
  );
  
  await this.save();
  return this.reactions;
};

// Method to get reaction count by emoji
messageSchema.methods.getReactionCount = function(emoji) {
  return this.reactions.filter(r => r.emoji === emoji).length;
};

// Method to check if user has reacted with specific emoji
messageSchema.methods.hasUserReaction = function(userId, emoji) {
  return this.reactions.some(r => 
    r.user.toString() === userId.toString() && r.emoji === emoji
  );
};

// Method to get public message data
messageSchema.methods.getPublicData = function() {
  const messageObj = this.toObject();
  delete messageObj.__v;
  return messageObj;
};

// Pre-save middleware to update chat's last message
messageSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Chat = mongoose.model('Chat');
    await Chat.findByIdAndUpdate(this.chat, {
      lastMessage: this._id,
      lastMessageAt: this.createdAt || new Date()
    });
  }
  next();
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
