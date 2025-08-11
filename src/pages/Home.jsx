import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2, RefreshCw, Users, Search } from "lucide-react";
import Post from "../components/Post";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && authUser) {
      fetchCurrentUser();
      fetchPosts();
    }
  }, [isAuthenticated, authUser]);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.getCurrentUser();
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error("Error fetching current user:", error);
      // Redirect to login if token is invalid
      if (error.status === 401) {
        api.removeToken();
        navigate("/login");
      }
    }
  };

  const fetchPosts = async (page = 1, append = false) => {
    try {
      setLoading(true);
      const response = await api.getPosts(page);

      if (append) {
        setPosts((prev) => [...prev, ...response.data.posts]);
      } else {
        setPosts(response.data.posts);
      }

      setCurrentPage(response.data.pagination.currentPage);
      setHasMore(response.data.pagination.hasNextPage);
      setIsNewUser(response.data.isNewUser || false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      if (error.status === 401) {
        api.removeToken();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshPosts = async () => {
    setRefreshing(true);
    await fetchPosts(1, false);
    setRefreshing(false);
  };

  const loadMorePosts = async () => {
    if (hasMore && !loading) {
      await fetchPosts(currentPage + 1, true);
    }
  };

  const handlePostUpdate = (postId, updates) => {
    setPosts((prev) =>
      prev.map((post) => (post._id === postId ? { ...post, ...updates } : post))
    );
  };

  const handlePostDelete = (postId) => {
    setPosts((prev) => prev.filter((post) => post._id !== postId));
  };

  const handleCreatePost = () => {
    navigate("/create-post");
  };

  const handleSearchUsers = () => {
    navigate("/search");
  };

  if (loading && posts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-purple-500" size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Home</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshPosts}
            disabled={refreshing}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleCreatePost}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white transition-colors"
          >
            <Plus size={20} />
            <span>Create Post</span>
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      {posts.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-gray-900 rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
            <p className="text-gray-400 mb-6">
              {isNewUser
                ? "Welcome to Connectify! Start by creating your first post or discovering other users."
                : "Follow some users or create your first post to see content here!"}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleCreatePost}
                className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg text-white transition-colors"
              >
                Create Your First Post
              </button>
              {isNewUser && (
                <button
                  onClick={handleSearchUsers}
                  className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg text-white transition-colors flex items-center justify-center space-x-2"
                >
                  <Search size={16} />
                  <span>Discover Users</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* New User Welcome Message */}
          {isNewUser && posts.length > 0 && (
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center space-x-3 mb-3">
                <Users size={24} />
                <h3 className="text-lg font-semibold">
                  Welcome to Connectify!
                </h3>
              </div>
              <p className="text-purple-100 mb-4">
                You're seeing posts from other users to help you discover
                content. Create your own posts and follow users to personalize
                your feed!
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleCreatePost}
                  className="bg-white text-purple-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Create Post
                </button>
                <button
                  onClick={handleSearchUsers}
                  className="border border-white text-white hover:bg-white hover:text-purple-600 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Find Users
                </button>
              </div>
            </div>
          )}

          {posts.map((post) => (
            <Post
              key={post._id}
              post={post}
              currentUser={currentUser}
              onPostUpdate={handlePostUpdate}
              onPostDelete={handlePostDelete}
            />
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center py-6">
              <button
                onClick={loadMorePosts}
                disabled={loading}
                className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  "Load More Posts"
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;
