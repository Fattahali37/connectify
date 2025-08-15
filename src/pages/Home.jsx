import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2, RefreshCw, Users, Search, TrendingUp } from "lucide-react";
import Post from "../components/Post";
import LoadingSkeleton from "../components/LoadingSkeleton";
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
  const [error, setError] = useState("");
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
      setError("");
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
      setError("Failed to load posts. Please try again.");
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

  return (
    <div className="flex-1 bg-gray-900 page-content">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 lg:px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-xl lg:text-2xl font-semibold">Home</h1>
            <p className="text-gray-400 text-sm hidden sm:block">Discover what's happening in your network</p>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSearchUsers}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors lg:hidden"
              aria-label="Search users"
            >
              <Search size={20} />
            </button>
            <button
              onClick={handleCreatePost}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2 text-sm"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Create Post</span>
            </button>
          </div>
        </div>
      </div>

      {/* Posts Container */}
      <div className="posts-container p-4 lg:p-6">
        {/* Error state */}
        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={refreshPosts}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && !refreshing ? (
          <LoadingSkeleton type="post" count={3} />
        ) : posts.length === 0 ? (
          /* Empty state */
          <div className="text-center py-12">
            <div className="text-gray-400 mx-auto mb-4">
              <TrendingUp className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Be the first to share something! Start connecting with others by creating your first post.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleCreatePost}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105"
              >
                Create Post
              </button>
              <button
                onClick={handleSearchUsers}
                className="border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105"
              >
                Find People
              </button>
            </div>
          </div>
        ) : (
          /* Posts list */
          <div className="space-y-6">
            {/* Refresh button */}
            <div className="flex justify-center">
              <button
                onClick={refreshPosts}
                disabled={refreshing}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
              </button>
            </div>

            {/* Posts */}
            {posts.map((post) => (
              <Post
                key={post._id}
                post={post}
                currentUser={currentUser}
                onPostUpdate={handlePostUpdate}
                onPostDelete={handlePostDelete}
              />
            ))}

            {/* Load more button */}
            {hasMore && (
              <div className="flex justify-center pt-6">
                <button
                  onClick={loadMorePosts}
                  disabled={loading}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp size={16} />
                      <span>Load More</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
