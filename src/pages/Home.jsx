import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Loader2,
  RefreshCw,
  Users,
  Search,
  TrendingUp,
  Heart,
  MessageCircle,
  Bookmark,
  Share,
} from "lucide-react";
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
    try {
      setRefreshing(true);
      setError(""); // Clear any existing errors
      setCurrentPage(1); // Reset to first page
      setHasMore(true); // Reset pagination

      // Fetch fresh posts from the beginning
      const response = await api.getPosts(1);

      setPosts(response.data.posts);
      setCurrentPage(response.data.pagination.currentPage);
      setHasMore(response.data.pagination.hasNextPage);
      setIsNewUser(response.data.isNewUser || false);
    } catch (error) {
      console.error("Error refreshing posts:", error);
      setError("Failed to refresh posts. Please try again.");
      if (error.status === 401) {
        api.removeToken();
        navigate("/login");
      }
    } finally {
      setRefreshing(false);
    }
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
    <div className="flex-1 bg-black page-content">
      {/* Header */}
      <div className="nav-instagram px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-xl lg:text-2xl font-semibold">
              Home
            </h1>
            <p className="text-gray-400 text-sm hidden sm:block">
              Discover what's happening in your network
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshPosts}
              disabled={refreshing}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Refresh posts"
              title="Refresh posts"
            >
              <RefreshCw
                size={20}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
            <button
              onClick={handleSearchUsers}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors lg:hidden"
              aria-label="Search users"
            >
              <Search size={20} />
            </button>
            <button
              onClick={handleCreatePost}
              className="btn-instagram px-3 py-2 flex items-center space-x-2 text-sm"
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
          <div className="notification-instagram mb-6 flex items-center justify-between">
            <span className="text-red-400">{error}</span>
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
          <div className="max-w-2xl mx-auto">
            <LoadingSkeleton type="post" count={3} />
          </div>
        ) : posts.length === 0 ? (
          /* Empty state */
          <div className="empty-state-instagram max-w-2xl mx-auto">
            <div className="empty-state-icon">
              <TrendingUp className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="empty-state-title">No posts yet</h3>
            <p className="empty-state-description">
              Be the first to share something! Start connecting with others by
              creating your first post.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleCreatePost}
                className="btn-instagram px-6 py-3"
              >
                Create Post
              </button>
              <button
                onClick={handleSearchUsers}
                className="btn-instagram-outline px-6 py-3"
              >
                Find People
              </button>
            </div>
          </div>
        ) : (
          /* Posts list */
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Refresh button */}
            <div className="flex justify-center mb-4">
              <button
                onClick={refreshPosts}
                disabled={refreshing}
                className="btn-instagram-outline px-4 py-2 flex items-center space-x-2 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Refresh posts"
              >
                <RefreshCw
                  size={18}
                  className={`${refreshing ? "animate-spin" : ""}`}
                />
                <span className="font-medium">
                  {refreshing ? "Refreshing..." : "Refresh Posts"}
                </span>
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
                  className="btn-instagram-secondary disabled:opacity-50 flex items-center space-x-2"
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
