import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  MessageCircle,
  Clock,
  Check,
  CheckCheck,
  MoreVertical,
  Trash2,
} from "lucide-react";

function ChatItem({ chat, isActive, onClick, onDelete }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick(chat);
    } else {
      navigate(`/chat/${chat._id}`);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(chat._id);
    }
    setShowMenu(false);
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getOtherParticipant = () => {
    if (chat.chatType === "group") {
      return null;
    }

    // For direct chats, find the other participant
    const currentUserId = localStorage.getItem("currentUserId"); // You might want to get this from context
    return chat.participants.find((p) => p._id !== currentUserId);
  };

  const otherParticipant = getOtherParticipant();

  return (
    <div
      onClick={handleClick}
      className={`p-4 border-b border-gray-800 cursor-pointer transition-colors duration-200 relative ${
        isActive
          ? "bg-purple-600 bg-opacity-20 border-l-4 border-l-purple-500"
          : "hover:bg-gray-900"
      }`}
    >
      <div className="flex items-center space-x-3">
        {/* Profile Picture */}
        <div className="flex-shrink-0 relative">
          {chat.chatType === "group" ? (
            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
              <MessageCircle size={20} className="text-white" />
            </div>
          ) : otherParticipant?.profilePicture ? (
            <img
              src={otherParticipant.profilePicture}
              alt={otherParticipant.firstName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
              <User size={20} className="text-gray-400" />
            </div>
          )}

          {/* Online indicator */}
          {chat.chatType === "direct" && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full"></div>
          )}
        </div>

        {/* Chat Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-white truncate">
              {chat.displayName ||
                (chat.chatType === "group"
                  ? chat.chatName
                  : `${otherParticipant?.firstName} ${otherParticipant?.lastName}`)}
            </h3>
            <div className="flex items-center space-x-2">
              {chat.unreadCount > 0 && (
                <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                  {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                </span>
              )}
              <span className="text-gray-400 text-xs flex items-center">
                <Clock size={12} className="mr-1" />
                {formatLastMessageTime(chat.lastMessageAt)}
              </span>
            </div>
          </div>

          {/* Last Message */}
          {chat.lastMessage ? (
            <div className="flex items-center space-x-2">
              {/* Message status indicators */}
              {chat.lastMessage.sender?._id ===
                localStorage.getItem("currentUserId") && (
                <div className="flex items-center space-x-1">
                  {chat.lastMessage.isRead ? (
                    <CheckCheck size={14} className="text-blue-400" />
                  ) : (
                    <Check size={14} className="text-gray-400" />
                  )}
                </div>
              )}

              <span className="text-gray-400 text-sm truncate">
                {chat.lastMessage.sender?.firstName}: {chat.lastMessage.content}
              </span>
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">No messages yet</p>
          )}
        </div>

        {/* Three Dots Menu */}
        <div className="flex-shrink-0 relative">
          <button
            onClick={toggleMenu}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <MoreVertical size={16} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-8 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10 min-w-[120px]">
              <button
                onClick={handleDelete}
                className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors rounded-t-lg"
              >
                <Trash2 size={14} />
                <span>Delete Chat</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatItem;
