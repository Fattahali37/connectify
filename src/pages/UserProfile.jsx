import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import {
  UserPlus,
  UserCheck,
  UserX,
  Users,
  MessageCircle,
  MapPin,
  Calendar,
  Edit,
  Settings,
  MoreVertical,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
} from "lucide-react";
import api from "../services/api";

function UserProfile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const { success, error, info } = useNotifications();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [activeTab, setActiveTab] = useState("posts");
  const [showOptions, setShowOptions] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    loadUserProfile();
  }, [username]);

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOptions && !event.target.closest(".options-menu")) {
        setShowOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showOptions]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const [
        userResponse,
        postsResponse,
        followersResponse,
        followingResponse,
      ] = await Promise.all([
        api.getUserByUsername(username),
        api.getUserPosts(userResponse?.data?.user?._id || username),
        api.getFollowers(userResponse?.data?.user?._id || username),
        api.getFollowing(userResponse?.data?.user?._id || username),
      ]);

      const userData = userResponse.data.user;
      setUser(userData);
      setPosts(postsResponse.data.posts || []);
      setFollowersCount(followersResponse.data.followers?.length || 0);
      setFollowingCount(followingResponse.data.following?.length || 0);
      setPostsCount(postsResponse.data.posts?.length || 0);

      // Check if current user is following this user
      if (currentUser && userData) {
        const isFollowingResponse = await api.checkFollowStatus(userData._id);
        setIsFollowing(isFollowingResponse.data.isFollowing);
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
      error("Error", "Failed to load user profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await api.unfollowUser(user._id);
        setIsFollowing(false);
        setFollowersCount((prev) => prev - 1);
        success("Unfollowed", `You are no longer following ${user.firstName}`);
      } else {
        await api.followUser(user._id);
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
        success("Following", `You are now following ${user.firstName}`);
      }
    } catch (err) {
      console.error("Error following/unfollowing user:", err);
      error("Error", "Failed to update follow status");
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      await api.sendFriendRequest(user._id, "I'd like to be your friend!");
      info("Friend Request Sent", "Friend request has been sent");
    } catch (err) {
      console.error("Error sending friend request:", err);
      error("Error", "Failed to send friend request");
    }
  };

  const handleStartChat = async () => {
    try {
      const response = await api.getOrCreateDirectChat(user._id);
      navigate(`/chat/${response.data.chat._id}`);
    } catch (err) {
      console.error("Error starting chat:", err);
      error("Error", "Failed to start chat");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user.firstName} ${user.lastName} on Connectify`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      success("Link Copied", "Profile link copied to clipboard");
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <UserX className="text-gray-400 mx-auto mb-4" size={48} />
          <p className="text-gray-400 text-lg">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-900">
      {/* Profile Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="px-6 py-8">
          <div className="flex items-start justify-between">
            {/* Profile Info */}
            <div className="flex items-start space-x-6">
              {/* Profile Picture */}
              <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt=""
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-medium text-3xl">
                    {user.firstName?.charAt(0) || "U"}
                  </span>
                )}
              </div>

              {/* User Details */}
              <div className="flex-1">
                <h1 className="text-white text-3xl font-bold mb-2">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-gray-400 text-lg mb-3">@{user.username}</p>

                {user.bio && (
                  <p className="text-gray-300 mb-4 max-w-2xl">{user.bio}</p>
                )}

                {/* Stats */}
                <div className="flex items-center space-x-8 text-sm">
                  <div className="text-center">
                    <div className="text-white font-semibold text-lg">
                      {postsCount}
                    </div>
                    <div className="text-gray-400">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold text-lg">
                      {followersCount}
                    </div>
                    <div className="text-gray-400">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold text-lg">
                      {followingCount}
                    </div>
                    <div className="text-gray-400">Following</div>
                  </div>
                </div>

                {/* Location and Join Date */}
                <div className="flex items-center space-x-4 mt-4 text-gray-400 text-sm">
                  {user.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin size={16} />
                      <span>{user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Calendar size={16} />
                    <span>
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {!isOwnProfile && (
                <>
                  {/* Follow/Unfollow Button */}
                  <button
                    onClick={handleFollow}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      isFollowing
                        ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    {isFollowing ? (
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

                  {/* Friend Request Button */}
                  <button
                    onClick={handleSendFriendRequest}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Users size={16} />
                    <span>Add Friend</span>
                  </button>

                  {/* Message Button */}
                  <button
                    onClick={handleStartChat}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <MessageCircle size={16} />
                    <span>Message</span>
                  </button>
                </>
              )}

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Share profile"
              >
                <Share2 size={20} />
              </button>

              {/* Options Menu */}
              <div className="relative options-menu">
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <MoreVertical size={20} />
                </button>

                {showOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
                    <div className="py-1">
                      {isOwnProfile ? (
                        <button
                          onClick={() => navigate("/profile/edit")}
                          className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <Edit size={16} />
                          <span>Edit Profile</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate("/requests")}
                          className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <Users size={16} />
                          <span>View Requests</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 border-b border-gray-700 px-6">
        <div className="flex space-x-1">
          {[
            { id: "posts", label: "Posts", count: postsCount },
            { id: "followers", label: "Followers", count: followersCount },
            { id: "following", label: "Following", count: followingCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-gray-900 text-white border-b-2 border-purple-500"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {tab.label}
              <span className="ml-2 text-gray-500">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "posts" && (
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare
                  className="text-gray-400 mx-auto mb-4"
                  size={48}
                />
                <p className="text-gray-400 text-lg">No posts yet</p>
                <p className="text-gray-500 text-sm">
                  When {user.firstName} creates posts, they'll appear here
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-medium text-sm">
                          {user.firstName?.charAt(0) || "U"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-white font-medium">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-gray-400">@{user.username}</span>
                        <span className="text-gray-500 text-sm">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-4">{post.content}</p>
                      {post.image && (
                        <img
                          src={post.image}
                          alt=""
                          className="rounded-lg max-w-full h-auto"
                        />
                      )}
                      <div className="flex items-center space-x-6 text-gray-400 text-sm">
                        <div className="flex items-center space-x-1">
                          <Heart size={16} />
                          <span>{post.likes?.length || 0} likes</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare size={16} />
                          <span>{post.comments?.length || 0} comments</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "followers" && (
          <div className="text-center py-12">
            <Users className="text-gray-400 mx-auto mb-4" size={48} />
            <p className="text-gray-400 text-lg">Followers list coming soon</p>
          </div>
        )}

        {activeTab === "following" && (
          <div className="text-center py-12">
            <Users className="text-gray-400 mx-auto mb-4" size={48} />
            <p className="text-gray-400 text-lg">Following list coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
