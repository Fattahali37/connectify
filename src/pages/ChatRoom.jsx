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
  Phone,
  Video,
  Info,
  Search,
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

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    if (socketInitializedRef.current) return;

    try {
      const token = localStorage.getItem("token");
      if (token && user?._id) {
        socketService.connect(token, user._id);
        socketService.joinChat(chatId);

        socketService.on("message-received", (newMessage) => {
          setMessages((prev) => [...prev, newMessage]);
          scrollToBottom();
        });

        socketService.on("user-typing", ({ userId, type }) => {
          if (type === "start") {
            setTypingUsers((prev) => [...prev, userId]);
          } else if (type === "stop") {
            setTypingUsers((prev) => prev.filter((id) => id !== userId));
          }
        });

        socketInitializedRef.current = true;
      }
    } catch (error) {
      console.error("Socket initialization error:", error);
    }
  }, [chatId, user?._id]);

  // Load data on mount
  useEffect(() => {
    loadChat();
    loadMessages();
    initializeSocket();

    return () => {
      if (socketInitializedRef.current) {
        socketService.leaveChat(chatId);
        // Clean up event listeners
        socketService.off("message-received");
        socketService.off("user-typing");
      }
    };
  }, [loadChat, loadMessages, initializeSocket, chatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle typing
  const handleTyping = useCallback(() => {
    socketService.startTyping(chatId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping(chatId);
    }, 1000);
  }, [chatId]);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await api.sendMessage(chatId, {
        content: newMessage,
        replyTo: replyTo?._id,
      });

      const messageData = {
        ...response.data.message,
        sender: user,
      };

      setMessages((prev) => [...prev, messageData]);
      setNewMessage("");
      setReplyTo(null);
      scrollToBottom();

      // Emit typing stop
      socketService.stopTyping(chatId);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsSending(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("chatId", chatId);

      const response = await api.uploadFile(formData);
      const messageData = {
        ...response.data.message,
        sender: user,
      };

      setMessages((prev) => [...prev, messageData]);
      scrollToBottom();
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle message update
  const handleMessageUpdate = (messageId, updates) => {
    setMessages((prev) =>
      prev.map((msg) => (msg._id === messageId ? { ...msg, ...updates } : msg))
    );
  };

  // Handle message delete
  const handleMessageDelete = (messageId) => {
    setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
  };

  // Handle reply
  const handleReply = (message) => {
    setReplyTo(message);
    messageInputRef.current?.focus();
  };

  // Get other participant for direct chats
  const getOtherParticipant = () => {
    if (!chat || chat.chatType === "group") return null;
    return chat.participants.find((p) => p._id !== user._id);
  };

  const otherParticipant = getOtherParticipant();

  if (isLoading) {
    return (
      <div className="flex h-full bg-gray-900 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex h-full bg-gray-900 items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Chat not found</p>
          <button
            onClick={() => navigate("/chat")}
            className="mt-4 text-purple-400 hover:text-purple-300"
          >
            Back to chats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-900">
      {/* Left Sidebar - Navigation */}
      <div className="w-16 bg-black flex flex-col items-center py-4 space-y-6">
        {/* Instagram Logo */}
        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">C</span>
        </div>

        {/* Navigation Icons */}
        <div className="flex flex-col items-center space-y-6">
          <button
            onClick={() => navigate("/chat")}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <button className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors">
            <MessageCircle size={24} />
          </button>
          <button className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors">
            <Search size={24} />
          </button>
          <button className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors">
            <Users size={24} />
          </button>
        </div>
      </div>

      {/* Chat List Panel */}
      <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h1 className="text-white font-semibold text-lg">Connectify</h1>
              <button className="text-gray-400 hover:text-white">
                <MoreVertical size={16} />
              </button>
            </div>
            <button className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors">
              <Edit size={20} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {/* This would show the list of chats */}
          <div className="p-4 text-center">
            <p className="text-gray-400 text-sm">Chat list would go here</p>
          </div>
        </div>
      </div>

      {/* Message Display Area */}
      <div className="flex-1 bg-gray-900 flex flex-col">
        {/* Chat Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Profile Picture */}
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
              {chat.chatType === "group" ? (
                <Users size={20} className="text-gray-400" />
              ) : otherParticipant?.profilePicture ? (
                <img
                  src={otherParticipant.profilePicture}
                  alt={otherParticipant.firstName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-medium">
                  {otherParticipant?.firstName?.charAt(0) || "U"}
                </span>
              )}
            </div>

            {/* Chat Info */}
            <div>
              <h2 className="text-white font-semibold">
                {chat.chatType === "group"
                  ? chat.name
                  : `${otherParticipant?.firstName} ${otherParticipant?.lastName}`}
              </h2>
              {chat.chatType === "direct" && (
                <p className="text-gray-400 text-sm">
                  {typingUsers.length > 0 ? "typing..." : "online"}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors">
              <Phone size={20} />
            </button>
            <button className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors">
              <Video size={20} />
            </button>
            <button className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors">
              <Info size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoadingMore && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
            </div>
          )}

          {messages.map((message) => (
            <Message
              key={message._id}
              message={message}
              isOwnMessage={message.sender?._id === user._id}
              onMessageUpdate={handleMessageUpdate}
              onMessageDelete={handleMessageDelete}
              onReply={handleReply}
              currentUser={user}
            />
          ))}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-white px-4 py-2 rounded-lg">
                <span className="text-sm">typing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          {/* Reply preview */}
          {replyTo && (
            <div className="bg-gray-700 rounded-lg p-3 mb-3 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">
                  Replying to {replyTo.sender?.firstName}
                </p>
                <p className="text-white text-sm truncate">{replyTo.content}</p>
              </div>
              <button
                onClick={() => setReplyTo(null)}
                className="text-gray-400 hover:text-white ml-2"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <form onSubmit={sendMessage} className="flex items-center space-x-3">
            {/* File upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Image size={20} />
            </button>

            {/* Message input */}
            <input
              ref={messageInputRef}
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Message..."
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isSending}
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </form>

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
    </div>
  );
}

export default ChatRoom;
