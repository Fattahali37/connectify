import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Send,
  Image,
  File,
  Smile,
  ArrowLeft,
  MoreHorizontal,
  Trash2,
  Edit,
  Reply,
} from "lucide-react";
import Message from "../components/Message";
import api from "../services/api";
import socketService from "../services/socketService";
import { useAuth } from "../contexts/AuthContext";

function ChatRoom() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketInitializedRef = useRef(false);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load chat details
  const loadChat = useCallback(async () => {
    try {
      const response = await api.getUserChats();
      const foundChat = response.data.chats.find((c) => c._id === chatId);
      if (foundChat) {
        setChat(foundChat);
      } else {
        // Try to get chat by ID if not in user's chat list
        // This handles direct links to chats
        try {
          const chatResponse = await api.getChatById(chatId);
          setChat(chatResponse.data.chat);
        } catch (error) {
          console.error("Chat not found:", error);
          navigate("/chat");
        }
      }
    } catch (error) {
      console.error("Error loading chat:", error);
      navigate("/chat");
    }
  }, [chatId, navigate]);

  // Load messages
  const loadMessages = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        const response = await api.getChatMessages(chatId, pageNum);
        const newMessages = response.data.messages;

        if (append) {
          setMessages((prev) => [...newMessages, ...prev]);
        } else {
          setMessages(newMessages);
        }

        setHasMore(response.data.pagination.hasNextPage);
        setPage(pageNum);
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    },
    [chatId]
  );

  // Load more messages (for pagination)
  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      await loadMessages(page + 1, true);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const messageData = {
        content: newMessage.trim(),
        messageType: "text",
      };

      if (replyTo) {
        messageData.replyTo = replyTo._id;
      }

      const response = await api.sendMessage(chatId, messageData);

      // Add new message to local state
      setMessages((prev) => [...prev, response.data.message]);

      // Clear input and reply
      setNewMessage("");
      setReplyTo(null);

      // Scroll to bottom
      setTimeout(scrollToBottom, 100);

      // Mark chat as read
      await api.markChatAsRead(chatId);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsSending(true);

      // Upload file (placeholder implementation)
      const uploadResult = await api.uploadFile(file);

      const messageData = {
        content: `Shared ${file.name}`,
        messageType: file.type.startsWith("image/") ? "image" : "file",
        mediaUrl: uploadResult.url,
        fileName: uploadResult.fileName,
        fileSize: uploadResult.fileSize,
        fileType: uploadResult.fileType,
      };

      if (replyTo) {
        messageData.replyTo = replyTo._id;
      }

      const response = await api.sendMessage(chatId, messageData);

      // Add new message to local state
      setMessages((prev) => [...prev, response.data.message]);

      // Clear reply
      setReplyTo(null);

      // Scroll to bottom
      setTimeout(scrollToBottom, 100);

      // Mark chat as read
      await api.markChatAsRead(chatId);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsSending(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Start typing
    socketService.startTyping(chatId);

    // Stop typing after 1 second of no input
    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping(chatId);
    }, 1000);
  }, [chatId]);

  // Handle message reactions
  const handleReaction = async (messageId, emoji) => {
    try {
      await api.reactToMessage(chatId, messageId, emoji);

      // Update local message state
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id === messageId) {
            // Add or update reaction
            const existingReaction = msg.reactions?.find(
              (r) => r.user._id === user._id && r.emoji === emoji
            );

            if (existingReaction) {
              // Remove reaction
              return {
                ...msg,
                reactions:
                  msg.reactions?.filter(
                    (r) => !(r.user._id === user._id && r.emoji === emoji)
                  ) || [],
              };
            } else {
              // Add reaction
              const newReaction = {
                user: {
                  _id: user._id,
                  username: user.username,
                  firstName: user.firstName,
                  lastName: user.lastName,
                },
                emoji,
                createdAt: new Date(),
              };
              return {
                ...msg,
                reactions: [...(msg.reactions || []), newReaction],
              };
            }
          }
          return msg;
        })
      );
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  // Handle message deletion
  const handleMessageDelete = async (messageId) => {
    try {
      await api.deleteMessage(chatId, messageId);

      // Remove message from local state
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  // Handle message reply
  const handleReply = (message) => {
    setReplyTo(message);
  };

  // Cancel reply
  const cancelReply = () => {
    setReplyTo(null);
  };

  // Initialize socket connection and real-time updates
  useEffect(() => {
    console.log("ChatRoom useEffect - user:", user, "chatId:", chatId);

    if (user && chatId && !socketInitializedRef.current) {
      console.log(
        "Setting up socket connection for user:",
        user._id,
        "chat:",
        chatId
      );

      // Connect to socket
      const token = localStorage.getItem("token");
      console.log("Token available:", !!token);

      socketService.connect(token, user._id);
      console.log("Socket service connect called");

      // Check socket connection status after a delay
      setTimeout(() => {
        const status = socketService.getConnectionStatus();
        console.log("Socket connection status after 1s:", status);
      }, 1000);

      // Join chat room
      socketService.joinChat(chatId);
      console.log("Socket service joinChat called");

      // Update user info in socket service
      socketService.updateUserInfo({
        firstName: user.firstName,
        lastName: user.lastName,
      });
      console.log("Socket service updateUserInfo called");

      // Mark socket as initialized
      socketInitializedRef.current = true;

      // Listen for real-time events
      const handleMessageReceived = (data) => {
        console.log("Message received event:", data);
        if (data.chatId === chatId) {
          console.log("Adding new message to chat:", data.message);
          setMessages((prev) => [...prev, data.message]);
          setTimeout(scrollToBottom, 100);
        }
      };

      const handleReactionUpdate = (data) => {
        console.log("Reaction update event:", data);
        if (data.chatId === chatId) {
          console.log(
            "Updating message reactions:",
            data.messageId,
            data.reactions
          );
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg._id === data.messageId) {
                return { ...msg, reactions: data.reactions };
              }
              return msg;
            })
          );
        }
      };

      const handleMessageDeleted = (data) => {
        console.log("Message deleted event:", data);
        if (data.chatId === chatId) {
          console.log("Removing deleted message:", data.messageId);
          setMessages((prev) =>
            prev.filter((msg) => msg._id !== data.messageId)
          );
        }
      };

      const handleUserTyping = (data) => {
        console.log("User typing event:", data);
        if (data.chatId === chatId) {
          if (data.type === "start") {
            console.log("User started typing:", data.userName);
            setTypingUsers((prev) => {
              const existing = prev.find((u) => u.userId === data.userId);
              if (!existing) {
                return [
                  ...prev,
                  { userId: data.userId, userName: data.userName },
                ];
              }
              return prev;
            });
          } else if (data.type === "stop") {
            console.log("User stopped typing:", data.userId);
            setTypingUsers((prev) =>
              prev.filter((u) => u.userId !== data.userId)
            );
          }
        }
      };

      // Register event listeners
      console.log("Registering socket event listeners");
      socketService.on("message-received", handleMessageReceived);
      socketService.on("message-reaction-update", handleReactionUpdate);
      socketService.on("message-deleted", handleMessageDeleted);
      socketService.on("user-typing", handleUserTyping);
      console.log("Socket event listeners registered");

      // Cleanup function
      return () => {
        console.log("Cleaning up socket event listeners");
        socketService.off("message-received", handleMessageReceived);
        socketService.off("message-reaction-update", handleReactionUpdate);
        socketService.off("message-deleted", handleMessageDeleted);
        socketService.off("user-typing", handleUserTyping);
        socketService.leaveChat(chatId);
        socketInitializedRef.current = false;
      };
    } else if (socketInitializedRef.current) {
      console.log("Socket already initialized, skipping setup");
    } else {
      console.log("Cannot setup socket - missing user or chatId");
    }
  }, [user?._id, chatId]); // Only depend on user ID and chatId, not the entire user object

  // Load initial data
  useEffect(() => {
    const initializeChat = async () => {
      setIsLoading(true);
      await loadChat();
      await loadMessages(1);
      setIsLoading(false);
    };

    if (chatId) {
      initializeChat();
    }
  }, [chatId, loadChat, loadMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Chat not found</p>
          <button
            onClick={() => navigate("/chat")}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Chats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* Chat Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/chat")}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex items-center space-x-3">
              {/* Chat Avatar */}
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                {chat.chatType === "group" ? (
                  <span className="text-white font-medium text-sm">
                    {chat.chatName?.charAt(0) || "G"}
                  </span>
                ) : chat.participants?.find((p) => p._id !== user._id)
                    ?.profilePicture ? (
                  <img
                    src={
                      chat.participants.find((p) => p._id !== user._id)
                        .profilePicture
                    }
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-medium text-sm">
                    {chat.participants
                      ?.find((p) => p._id !== user._id)
                      ?.firstName?.charAt(0) || "U"}
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-white font-semibold">
                  {chat.displayName || "Chat"}
                </h2>
                {chat.chatType === "group" && (
                  <p className="text-gray-400 text-sm">
                    {chat.memberCount || chat.participants?.length || 0} members
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => {
                const status = socketService.getConnectionStatus();
                console.log("Manual socket status check:", status);
                alert(`Socket Status: ${status.isConnected ? 'Connected' : 'Disconnected'}\nSocket ID: ${status.socketId}\nCurrent Chat: ${status.currentChatId}`);
              }}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
              title="Test Socket Connection"
            >
              🔌
            </button>
            <button className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Load more messages button */}
        {hasMore && (
          <div className="text-center">
            <button
              onClick={loadMoreMessages}
              disabled={isLoadingMore}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
            >
              {isLoadingMore ? "Loading..." : "Load More Messages"}
            </button>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <Message
            key={message._id}
            message={message}
            isOwnMessage={message.sender._id === user._id}
            onMessageUpdate={(messageId, updates) => {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg._id === messageId ? { ...msg, ...updates } : msg
                )
              );
            }}
            onMessageDelete={handleMessageDelete}
            onReply={handleReply}
            currentUser={user}
          />
        ))}

        {/* Typing indicators */}
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-2 text-gray-400 text-sm italic">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            <span>
              {typingUsers.map((u) => u.userName).join(", ")}{" "}
              {typingUsers.length === 1 ? "is" : "are"} typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Reply preview */}
      {replyTo && (
        <div className="bg-gray-800 border-t border-gray-700 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-gray-400 text-sm">Replying to:</span>
              <div className="bg-gray-700 rounded-lg px-3 py-2">
                <p className="text-white text-sm truncate max-w-xs">
                  {replyTo.content}
                </p>
              </div>
            </div>
            <button
              onClick={cancelReply}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows="1"
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />
          </div>

          <div className="flex items-center space-x-2">
            {/* File upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
              title="Attach file"
            >
              <File size={20} />
            </button>

            {/* Image upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
              title="Attach image"
            >
              <Image size={20} />
            </button>

            {/* Emoji picker (placeholder) */}
            <button className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors">
              <Smile size={20} />
            </button>

            {/* Send button */}
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSending}
              className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        />
      </div>
    </div>
  );
}

export default ChatRoom;
