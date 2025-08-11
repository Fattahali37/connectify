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

  return (
    <div className="flex-1 bg-gray-900 page-content">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 sticky top-0 z-10">
        <h1 className="text-white text-xl font-semibold">Home</h1>
      </div>

      {/* Posts Container */}
      <div className="posts-container p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading posts...</p>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mx-auto mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-500 mb-4">
              Be the first to share something!
            </p>
            <button
              onClick={() => navigate("/create-post")}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Post
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Post
                key={post._id}
                post={post}
                onPostUpdate={handlePostUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
