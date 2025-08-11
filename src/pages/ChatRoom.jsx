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
  Volume2,
  VolumeX,
  Settings,
  Users,
  MoreVertical,
  MessageCircle,
  X,
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
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketInitializedRef = useRef(false);
  const messageInputRef = useRef(null);

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

  // Chat management functions
  const toggleMute = async () => {
    try {
      // This would call an API to mute/unmute the chat
      setIsMuted(!isMuted);
      // await api.toggleChatMute(chatId);
    } catch (error) {
      console.error("Error toggling mute:", error);
    }
  };

  const deleteChat = async () => {
    try {
      await api.deleteChat(chatId);
      navigate("/chat");
    } catch (error) {
      console.error("Error deleting chat:", error);
      alert("Failed to delete chat");
    }
  };

  const leaveGroup = async () => {
    if (chat?.chatType === "group") {
      try {
        await api.leaveGroup(chatId);
        navigate("/chat");
      } catch (error) {
        console.error("Error leaving group:", error);
        alert("Failed to leave group");
      }
    }
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

  // Close chat options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showChatOptions && !event.target.closest(".chat-options")) {
        setShowChatOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showChatOptions]);

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
    <div className="flex-1 bg-gray-900 page-content">
      {/* Chat Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/chat")}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                {chat?.chatType === "group" ? (
                  <Users size={20} className="text-gray-400" />
                ) : (
                  <span className="text-white font-medium text-sm">
                    {chat?.participants?.[0]?.firstName?.charAt(0) || "U"}
                  </span>
                )}
              </div>
              
              <div>
                <h2 className="text-white font-semibold">
                  {chat?.chatType === "group" 
                    ? chat.name 
                    : `${chat?.participants?.[0]?.firstName} ${chat?.participants?.[0]?.lastName}`
                  }
                </h2>
                {chat?.chatType === "group" && (
                  <p className="text-gray-400 text-sm">
                    {chat.participants?.length || 0} members
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Chat Options */}
          <div className="relative">
            <button
              onClick={() => setShowChatOptions(!showChatOptions)}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <MoreVertical size={20} />
            </button>

            {/* Chat Options Dropdown */}
            {showChatOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50 chat-options">
                <div className="py-1">
                  {chat?.chatType === "group" && (
                    <>
                      <button
                        onClick={() => {
                          setShowChatOptions(false);
                          // Navigate to group settings
                        }}
                        className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <Settings size={16} />
                        <span>Group Settings</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowChatOptions(false);
                          leaveGroup();
                        }}
                        className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <Users size={16} />
                        <span>Leave Group</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setShowChatOptions(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Trash2 size={16} />
                    <span>Delete Chat</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="chat-messages flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="text-gray-400 mx-auto mb-4" size={48} />
              <p className="text-gray-400 text-lg">No messages yet</p>
              <p className="text-gray-500 text-sm">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <Message
                key={message._id}
                message={message}
                isOwn={message.sender?._id === user?._id}
                onReaction={handleReaction}
                onReply={handleReply}
                onDelete={handleMessageDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="px-6 py-2 bg-gray-800 border-t border-gray-700">
          <p className="text-gray-400 text-sm italic">
            {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
          </p>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-end space-x-3">
          {/* Reply Preview */}
          {replyTo && (
            <div className="flex-1 bg-gray-700 rounded-lg p-3 mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-purple-400 text-sm">Replying to:</span>
                  <span className="text-gray-300 text-sm">{replyTo.content}</span>
                </div>
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
          
          <div className="flex-1 flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                ref={messageInputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                onFocus={handleTyping}
                onBlur={handleTyping}
                placeholder="Type a message..."
                rows={1}
                className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-white text-xl font-semibold mb-4">
              Delete Chat
            </h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this chat? This action cannot be
              undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteChat}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatRoom;
