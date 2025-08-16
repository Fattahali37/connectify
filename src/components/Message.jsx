import React, { useState } from "react";
import {
  MoreHorizontal,
  Trash2,
  Edit,
  Reply,
  Clock,
  Download,
  Play,
  Pause,
  Heart,
  ThumbsUp,
  Smile,
} from "lucide-react";
import api from "../services/api";

function Message({
  message,
  isOwnMessage,
  onMessageUpdate,
  onMessageDelete,
  onReply,
  currentUser,
}) {
  const [showOptions, setShowOptions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReacting, setIsReacting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      setIsDeleting(true);
      try {
        await api.deleteMessage(message.chat, message._id);
        if (onMessageDelete) {
          onMessageDelete(message._id);
        }
      } catch (error) {
        console.error("Error deleting message:", error);
      } finally {
        setIsDeleting(false);
        setShowOptions(false);
      }
    }
  };

  const handleReply = () => {
    if (onReply) {
      onReply(message);
    }
    setShowOptions(false);
  };

  const handleReaction = async (emoji) => {
    if (isReacting) return;

    setIsReacting(true);
    try {
      await api.reactToMessage(message.chat, message._id, emoji);

      // The parent component will handle updating the message state
      // through the onMessageUpdate callback
    } catch (error) {
      console.error("Error adding reaction:", error);
    } finally {
      setIsReacting(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isEdited = message.edited && message.editedAt;
  const hasReactions = message.reactions && message.reactions.length > 0;

  // Get reaction counts by emoji
  const getReactionCounts = () => {
    if (!hasReactions) return {};

    const counts = {};
    message.reactions.forEach((reaction) => {
      counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
    });
    return counts;
  };

  const reactionCounts = getReactionCounts();

  // Check if current user has reacted with specific emoji
  const hasUserReaction = (emoji) => {
    return message.reactions?.some(
      (r) => r.user._id === currentUser?._id && r.emoji === emoji
    );
  };

  const renderMediaContent = () => {
    switch (message.messageType) {
      case "image":
        return (
          <div className="mt-2">
            <img
              src={message.mediaUrl}
              alt=""
              className="max-w-full max-h-48 object-cover rounded-lg"
            />
          </div>
        );

      case "video":
        return (
          <div className="mt-2">
            <video
              src={message.mediaUrl}
              controls
              className="max-w-full max-h-48 rounded-lg"
              poster={message.thumbnail}
            />
            {message.duration > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Duration: {Math.floor(message.duration / 60)}:
                {(message.duration % 60).toString().padStart(2, "0")}
              </p>
            )}
          </div>
        );

      case "audio":
        return (
          <div className="mt-2">
            <audio src={message.mediaUrl} controls className="w-full" />
            {message.duration > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Duration: {Math.floor(message.duration / 60)}:
                {(message.duration % 60).toString().padStart(2, "0")}
              </p>
            )}
          </div>
        );

      case "file":
        return (
          <div className="mt-2 p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Download size={20} className="text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {message.fileName || "File"}
                </p>
                <p className="text-xs text-gray-400">
                  {message.fileSize > 0 && formatFileSize(message.fileSize)}
                  {message.fileType && ` • ${message.fileType}`}
                </p>
              </div>
              <a
                href={message.mediaUrl}
                download={message.fileName}
                className="text-purple-400 hover:text-purple-300"
              >
                <Download size={16} />
              </a>
            </div>
          </div>
        );

      case "location":
        return (
          <div className="mt-2 p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📍</span>
              <div>
                <p className="text-sm text-white">Location shared</p>
                {message.location?.address && (
                  <p className="text-xs text-gray-400">
                    {message.location.address}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="mt-2 p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">👤</span>
              <div>
                <p className="text-sm text-white">
                  {message.contact?.name || "Contact"}
                </p>
                {message.contact?.phone && (
                  <p className="text-xs text-gray-400">
                    {message.contact.phone}
                  </p>
                )}
                {message.contact?.email && (
                  <p className="text-xs text-gray-400">
                    {message.contact.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}
    >
      {/* Sender avatar for other messages */}
      {!isOwnMessage && (
        <div className="flex-shrink-0 mr-2">
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
            {message.sender?.profilePicture ? (
              <img
                src={message.sender.profilePicture}
                alt={message.sender.firstName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-sm font-medium">
                {message.sender?.firstName?.charAt(0) || "U"}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Message Content */}
      <div
        className={`max-w-xs lg:max-w-md ${
          isOwnMessage ? "order-2" : "order-1"
        }`}
      >
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwnMessage ? "bg-purple-600 text-white" : "bg-gray-700 text-white"
          }`}
        >
          {/* Reply to message */}
          {message.replyTo && (
            <div
              className={`mb-2 p-2 rounded text-sm ${
                isOwnMessage ? "bg-purple-500 bg-opacity-50" : "bg-gray-600"
              }`}
            >
              <p className="font-medium text-xs opacity-75">
                Replying to {message.replyTo.sender?.firstName}
              </p>
              <p className="truncate">{message.replyTo.content}</p>
            </div>
          )}

          {/* Message text */}
          <p className="break-words">{message.content}</p>

          {/* Media content */}
          {renderMediaContent()}

          {/* Message metadata */}
          <div className="flex items-center justify-between mt-2 text-xs opacity-75">
            <span className="flex items-center">
              <Clock size={12} className="mr-1" />
              {formatTime(message.createdAt)}
            </span>
            {isEdited && <span className="italic">(edited)</span>}
            {message.isRead && isOwnMessage && (
              <span className="text-green-400">✓✓</span>
            )}
          </div>
        </div>

        {/* Reactions */}
        {hasReactions && (
          <div className="mt-2 flex flex-wrap gap-1">
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                disabled={isReacting}
                className={`px-2 py-1 rounded-full text-xs transition-colors ${
                  hasUserReaction(emoji)
                    ? "bg-purple-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                } disabled:opacity-50`}
              >
                {emoji} {count}
              </button>
            ))}
          </div>
        )}

        {/* Message options */}
        <div className="relative mt-1">
          <div className="flex items-center space-x-2">
            {/* Quick reaction buttons */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleReaction("❤️")}
                disabled={isReacting}
                className={`p-1 rounded-full transition-colors ${
                  hasUserReaction("❤️")
                    ? "bg-red-500 text-white"
                    : "text-gray-400 hover:text-red-500 hover:bg-red-500 hover:bg-opacity-20"
                } disabled:opacity-50`}
              >
                <Heart
                  size={14}
                  fill={hasUserReaction("❤️") ? "currentColor" : "none"}
                />
              </button>
              <button
                onClick={() => handleReaction("👍")}
                disabled={isReacting}
                className={`p-1 rounded-full transition-colors ${
                  hasUserReaction("👍")
                    ? "bg-blue-500 text-white"
                    : "text-gray-400 hover:text-blue-500 hover:bg-blue-500 hover:bg-opacity-20"
                } disabled:opacity-50`}
              >
                <ThumbsUp
                  size={14}
                  fill={hasUserReaction("👍") ? "currentColor" : "none"}
                />
              </button>
              <button
                onClick={() => handleReaction("😊")}
                disabled={isReacting}
                className={`p-1 rounded-full transition-colors ${
                  hasUserReaction("😊")
                    ? "bg-yellow-500 text-white"
                    : "text-yellow-500 hover:bg-yellow-500 hover:bg-opacity-20"
                } disabled:opacity-50`}
              >
                <Smile size={14} />
              </button>
            </div>

            {/* More options button */}
            {isOwnMessage && (
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors"
              >
                <MoreHorizontal size={14} />
              </button>
            )}
          </div>

          {/* Options dropdown */}
          {showOptions && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
              <div className="py-1">
                <button
                  onClick={handleReply}
                  className="flex items-center w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700"
                >
                  <Reply size={16} className="mr-2" />
                  Reply
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-700 disabled:opacity-50"
                >
                  <Trash2 size={16} className="mr-2" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sender avatar for own messages */}
      {isOwnMessage && (
        <div className="flex-shrink-0 ml-2">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
            {message.sender?.profilePicture ? (
              <img
                src={message.sender.profilePicture}
                alt={message.sender.firstName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-sm font-medium">
                {message.sender?.firstName?.charAt(0) || "U"}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Message;
