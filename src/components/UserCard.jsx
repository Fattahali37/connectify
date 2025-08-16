import React from "react";
import { MessageCircle, UserPlus, UserCheck } from "lucide-react";
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
    <div className="card-instagram p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between">
        {/* User Avatar and Info */}
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-medium text-xl">
                  {user.firstName?.charAt(0) || "U"}
                </span>
              )}
            </div>
          </div>

          <div>
            <Link
              to={`/user/${user.username}`}
              className="text-white font-semibold text-lg hover:text-blue-400 transition-colors"
            >
              {user.firstName} {user.lastName}
            </Link>
            <p className="text-gray-400 text-sm">@{user.username}</p>
          </div>
        </div>

        {/* Follow Button */}
        {showFollowButton && onFollow && (
          <button
            onClick={() => onFollow(user._id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
              isFollowed
                ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
                : "btn-instagram"
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
  );
}

export default UserCard;
