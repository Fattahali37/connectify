import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, MapPin, Users, MessageCircle } from "lucide-react";
import api from "../services/api";

function UserCard({ user, onFollowUpdate }) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const navigate = useNavigate();

  const handleFollowToggle = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isFollowing) {
        await api.unfollowUser(user._id);
        setIsFollowing(false);
      } else {
        await api.followUser(user._id);
        setIsFollowing(true);
      }

      // Update parent component
      if (onFollowUpdate) {
        onFollowUpdate(user._id, !isFollowing);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (isStartingChat) return;

    setIsStartingChat(true);
    try {
      const response = await api.getOrCreateDirectChat(user._id);
      navigate(`/chat/${response.data.chat._id}`);
    } catch (error) {
      console.error("Error starting chat:", error);
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleProfileClick = () => {
    navigate(`/user/${user.username}`);
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 hover:bg-gray-800 transition-colors duration-200">
      <div className="flex items-start space-x-4">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          <div onClick={handleProfileClick} className="cursor-pointer">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.firstName}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-700 hover:border-purple-500 transition-colors"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600 hover:border-purple-500 transition-colors">
                <User size={24} className="text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3
                onClick={handleProfileClick}
                className="text-lg font-semibold text-white hover:text-purple-400 cursor-pointer transition-colors"
              >
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-gray-400 text-sm">@{user.username}</p>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-gray-300 mb-3 line-clamp-2">{user.bio}</p>
          )}

          {/* Stats */}
          <div className="flex items-center space-x-6 text-sm text-gray-400 mb-4">
            <div className="flex items-center space-x-1">
              <Users size={14} />
              <span>{user.followersCount || 0} followers</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users size={14} />
              <span>{user.followingCount || 0} following</span>
            </div>
          </div>

          {/* Follow Status */}
          {user.isFollowedBy && (
            <div className="mb-4">
              <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                Follows you
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleFollowToggle}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isFollowing
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>...</span>
                </div>
              ) : isFollowing ? (
                "Following"
              ) : (
                "Follow"
              )}
            </button>

            <button
              onClick={handleStartChat}
              disabled={isStartingChat}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isStartingChat ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <MessageCircle size={16} />
                  <span>Message</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserCard;
