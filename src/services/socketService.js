import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentUser = null;
    this.currentChatId = null;
    this.typingTimeout = null;
    this.eventListeners = new Map();
  }

  // Initialize socket connection
  connect(token, userId) {
    console.log("SocketService.connect called with:", {
      token: !!token,
      userId,
    });

    // If already connected with the same user, don't reconnect
    if (this.socket && this.isConnected && this.currentUser?.id === userId) {
      console.log(
        "Socket already connected for this user, skipping connection"
      );
      return;
    }

    // If there's an existing socket, clean it up first
    if (this.socket) {
      console.log("Cleaning up existing socket connection");
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }

    this.currentUser = { id: userId };
    console.log("Creating new socket connection for userId:", userId);

    // Create socket connection
    this.socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    // Connection events
    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket.id);
      this.isConnected = true;
      this.authenticate(token, userId);
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
      this.isConnected = false;
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    // Authentication response
    this.socket.on("authenticated", (data) => {
      console.log("Socket authenticated:", data);
    });

    // Chat events - use arrow functions to preserve 'this' context
    this.socket.on("message-received", (data) => {
      console.log("SocketService received message-received event:", data);
      this.handleMessageReceived(data);
    });

    this.socket.on("message-reaction-update", (data) => {
      console.log(
        "SocketService received message-reaction-update event:",
        data
      );
      this.handleReactionUpdate(data);
    });

    this.socket.on("message-deleted", (data) => {
      console.log("SocketService received message-deleted event:", data);
      this.handleMessageDeleted(data);
    });

    this.socket.on("user-typing", (data) => {
      console.log("SocketService received user-typing event:", data);
      this.handleUserTyping(data);
    });
  }

  // Authenticate socket connection
  authenticate(token, userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("authenticate", { token, userId });
    }
  }

  // Join chat room
  joinChat(chatId) {
    console.log("SocketService.joinChat called with chatId:", chatId);
    console.log("Current socket status:", {
      socket: !!this.socket,
      isConnected: this.isConnected,
      currentChatId: this.currentChatId,
    });

    if (this.socket && this.isConnected) {
      this.currentChatId = chatId;
      this.socket.emit("join-chat", chatId);
      console.log("Joined chat room:", chatId);

      // Verify we're in the room
      setTimeout(() => {
        console.log("Verifying chat room membership for:", chatId);
        console.log("Current socket rooms:", this.socket.rooms);
      }, 500);
    } else {
      console.log("Cannot join chat - socket not connected. Status:", {
        socket: !!this.socket,
        isConnected: this.isConnected,
      });
    }
  }

  // Leave chat room
  leaveChat(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("leave-chat", chatId);
      if (this.currentChatId === chatId) {
        this.currentChatId = null;
      }
      console.log("Left chat room:", chatId);
    } else {
      console.log("Cannot leave chat - socket not connected");
    }
  }

  // Start typing indicator
  startTyping(chatId) {
    if (this.socket && this.isConnected && this.currentUser) {
      console.log("Starting typing indicator for chat:", chatId);
      this.socket.emit("typing-start", {
        chatId,
        userId: this.currentUser.id,
        userName: `${this.currentUser.firstName || "User"} ${
          this.currentUser.lastName || ""
        }`,
      });
    } else {
      console.log("Cannot start typing - socket not ready:", {
        socket: !!this.socket,
        isConnected: this.isConnected,
        currentUser: !!this.currentUser,
      });
    }
  }

  // Stop typing indicator
  stopTyping(chatId) {
    if (this.socket && this.isConnected && this.currentUser) {
      console.log("Stopping typing indicator for chat:", chatId);
      this.socket.emit("typing-stop", {
        chatId,
        userId: this.currentUser.id,
      });
    } else {
      console.log("Cannot stop typing - socket not ready");
    }
  }

  // Handle typing with debounce
  handleTyping(chatId, delay = 1000) {
    // Clear existing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    // Start typing
    this.startTyping(chatId);

    // Stop typing after delay
    this.typingTimeout = setTimeout(() => {
      this.stopTyping(chatId);
    }, delay);
  }

  // Send message reaction
  sendReaction(chatId, messageId, emoji, type = "add") {
    if (this.socket && this.isConnected) {
      console.log("Sending reaction:", { chatId, messageId, emoji, type });
      this.socket.emit("message-reaction", {
        chatId,
        messageId,
        userId: this.currentUser.id,
        emoji,
        type,
      });
    } else {
      console.log("Cannot send reaction - socket not connected");
    }
  }

  // Send new message
  sendNewMessage(chatId, message) {
    if (this.socket && this.isConnected) {
      console.log("Sending new message via socket:", {
        chatId,
        messageId: message._id,
      });
      this.socket.emit("new-message", {
        chatId,
        message,
      });
    } else {
      console.log("Cannot send message via socket - socket not connected");
    }
  }

  // Send message deletion
  sendMessageDeleted(chatId, messageId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("message-deleted", {
        chatId,
        messageId,
      });
    }
  }

  // Event handlers
  handleMessageReceived(data) {
    console.log("Message received:", data);
    this.emitEvent("message-received", data);
  }

  handleReactionUpdate(data) {
    console.log("Reaction update:", data);
    this.emitEvent("message-reaction-update", data);
  }

  handleMessageDeleted(data) {
    console.log("Message deleted:", data);
    this.emitEvent("message-deleted", data);
  }

  handleUserTyping(data) {
    console.log("User typing:", data);
    this.emitEvent("user-typing", data);
  }

  // Event listener management
  on(event, callback) {
    console.log(`SocketService.on called for event: ${event}`);
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
    console.log(
      `Event listeners for ${event}:`,
      this.eventListeners.get(event).length
    );
  }

  off(event, callback) {
    console.log(`SocketService.off called for event: ${event}`);
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
        console.log(
          `Removed event listener for ${event}, remaining:`,
          listeners.length
        );
      }
    }
  }

  emitEvent(event, data) {
    console.log(`SocketService emitting event: ${event}`, data);
    console.log(
      `Event listeners for ${event}:`,
      this.eventListeners.get(event)?.length || 0
    );

    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      console.log(`Calling ${listeners.length} listeners for event ${event}`);

      listeners.forEach((callback, index) => {
        try {
          console.log(
            `Calling callback ${index + 1} for event ${event}:`,
            callback
          );
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} event handler ${index + 1}:`, error);
        }
      });
    } else {
      console.log(`No event listeners found for event: ${event}`);
    }
  }

  // Update current user info
  updateUserInfo(userInfo) {
    this.currentUser = { ...this.currentUser, ...userInfo };
  }

  // Disconnect socket
  disconnect() {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnected = false;
    this.currentChatId = null;
    this.currentUser = null;
    // Don't clear event listeners - they should persist across reconnections
    // this.eventListeners.clear();
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
      currentChatId: this.currentChatId,
    };
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
