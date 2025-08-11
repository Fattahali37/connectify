import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";

function UserProfile() {
  const { username } = useParams();
  const [isFollowing, setIsFollowing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Mock user data - in real app, fetch from backend
  const user = {
    name: "Emma Watson",
    username: "emma_watson",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80",
    bio: "Actress, activist, and UN Women Goodwill Ambassador. Passionate about gender equality and education.",
    followers: 1234,
    following: 567,
    posts: 89,
    isVerified: true,
  };

  const posts = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1516245834210-c4c142787335?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      likes: 1234,
      comments: 89,
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1682687220198-88e9bdea9931?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      likes: 2567,
      comments: 156,
    },
  ];

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // TODO: Follow/unfollow user via backend
  };

  const handleMessage = () => {
    // TODO: Navigate to chat with user
    console.log("Message user:", username);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Profile Header */}
      <div className="bg-gray-900 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-6">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 rounded-full"
            />
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                {user.isVerified && (
                  <div className="bg-blue-600 text-white p-1 rounded-full">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-gray-400 mb-2">@{user.username}</p>
              <p className="text-gray-300 mb-4">{user.bio}</p>

              <div className="flex space-x-6 text-sm">
                <div>
                  <span className="font-bold">{user.posts}</span>
                  <span className="text-gray-400"> posts</span>
                </div>
                <div>
                  <span className="font-bold">
                    {user.followers.toLocaleString()}
                  </span>
                  <span className="text-gray-400"> followers</span>
                </div>
                <div>
                  <span className="font-bold">
                    {user.following.toLocaleString()}
                  </span>
                  <span className="text-gray-400"> following</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <MoreHorizontal size={20} />
            </button>

            {showOptions && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <button className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700">
                    Report
                  </button>
                  <button className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700">
                    Block
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleFollow}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              isFollowing
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
          <button
            onClick={handleMessage}
            className="py-2 px-4 border border-gray-600 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Message
          </button>
        </div>
      </div>

      {/* Posts Grid */}
      <div>
        <h2 className="text-xl font-bold mb-4">Posts</h2>
        <div className="grid grid-cols-3 gap-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="aspect-square bg-gray-900 rounded-lg overflow-hidden relative group cursor-pointer"
            >
              <img
                src={post.image}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-center">
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="flex items-center space-x-1">
                      <Heart size={16} />
                      <span className="text-sm">
                        {post.likes.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle size={16} />
                      <span className="text-sm">{post.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
