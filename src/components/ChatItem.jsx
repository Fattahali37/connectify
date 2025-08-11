import React from "react";
import { useNavigate } from "react-router-dom";
import { User, MessageCircle, Clock } from "lucide-react";

function ChatItem({ chat, isActive, onClick }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(chat);
    } else {
      navigate(`/chat/${chat._id}`);
    }
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
      className={`p-4 border-b border-gray-800 cursor-pointer transition-colors duration-200 ${
        isActive
          ? "bg-purple-600 bg-opacity-20 border-l-4 border-l-purple-500"
          : "hover:bg-gray-800"
      }`}
    >
      <div className="flex items-center space-x-3">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
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
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
              <User size={20} className="text-gray-400" />
            </div>
          )}
        </div>

        {/* Chat Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-white truncate">
              {chat.displayName ||
                (chat.chatType === "group" ? chat.chatName : "Unknown User")}
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
              <span className="text-gray-400 text-sm truncate">
                {chat.lastMessage.sender?.firstName}: {chat.lastMessage.content}
              </span>
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">No messages yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatItem;
