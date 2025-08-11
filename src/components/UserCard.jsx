import React from "react";
import {
  MessageCircle,
  UserPlus,
  UserCheck,
  MapPin,
  Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";

function UserCard({
  user,
  onFollow,
  onStartChat,
  followedUsers,
  showFollowButton = true,
}) {
  const isFollowed = followedUsers?.has(user._id);

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-colors">
      <div className="flex items-start space-x-4">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt=""
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-medium text-xl">
                {user.firstName?.charAt(0) || "U"}
              </span>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <Link
                to={`/user/${user.username}`}
                className="text-white font-semibold text-lg hover:text-purple-400 transition-colors"
              >
                {user.firstName} {user.lastName}
              </Link>
              <p className="text-gray-400 text-sm">@{user.username}</p>
            </div>

            <div className="flex items-center space-x-2">
              {/* Chat Button */}
              <button
                onClick={() => onStartChat?.(user._id)}
                className="text-gray-400 hover:text-purple-400 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                title="Start chat"
              >
                <MessageCircle size={20} />
              </button>

              {/* Follow Button */}
              {showFollowButton && onFollow && (
                <button
                  onClick={() => onFollow(user._id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isFollowed
                      ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                >
                  {isFollowed ? (
                    <div className="flex items-center space-x-2">
                      <UserCheck size={16} />
                      <span>Following</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <UserPlus size={16} />
                      <span>Follow</span>
                    </div>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Bio */}
          {user.bio && <p className="text-gray-300 mt-2 text-sm">{user.bio}</p>}

          {/* Location and Join Date */}
          <div className="flex items-center space-x-4 mt-3 text-gray-400 text-sm">
            {user.location && (
              <div className="flex items-center space-x-1">
                <MapPin size={14} />
                <span>{user.location}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Calendar size={14} />
              <span>
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6 mt-4 text-sm">
            <div className="text-center">
              <div className="text-white font-semibold">
                {user.postsCount || 0}
              </div>
              <div className="text-gray-400">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-white font-semibold">
                {user.followersCount || 0}
              </div>
              <div className="text-gray-400">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-white font-semibold">
                {user.followingCount || 0}
              </div>
              <div className="text-gray-400">Following</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserCard;
