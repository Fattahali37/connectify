import React, { useState, useEffect } from "react";
import {
  Search as SearchIcon,
  Filter,
  Users,
  Loader2,
  RefreshCw,
  X,
  MapPin,
  User,
  MessageCircle,
  Heart,
} from "lucide-react";
import UserCard from "../components/UserCard";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilter] = useState("all");
  const [totalUsers, setTotalUsers] = useState(0);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [followedUsers, setFollowedUsers] = useState(new Set());
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery, 1, false);
    } else {
      setUsers([]);
      setCurrentPage(1);
      setHasMore(false);
      setTotalUsers(0);
      setError("");
    }
  }, [debouncedQuery, filter]);

  const performSearch = async (query, page = 1, append = false) => {
    if (!query.trim()) return;

    setSearching(true);
    setError("");
    try {
      const response = await api.searchUsers(query, page, 20, filter);

      if (append) {
        setUsers((prev) => [...prev, ...response.data.users]);
      } else {
        setUsers(response.data.users);
      }

      setCurrentPage(response.data.pagination.currentPage);
      setHasMore(response.data.pagination.hasNextPage);
      setTotalUsers(response.data.pagination.totalUsers);
    } catch (error) {
      console.error("Search error:", error);
      setError("Failed to search users. Please try again.");
      if (error.status === 401) {
        // Handle unauthorized
        return;
      }
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery, 1, false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const loadMore = async () => {
    if (hasMore && !searching) {
      await performSearch(debouncedQuery, currentPage + 1, true);
    }
  };

  const handleFollowUpdate = (userId, isFollowing) => {
    setUsers((prev) =>
      prev.map((user) =>
        user._id === userId
          ? {
              ...user,
              isFollowing,
              followersCount: isFollowing
                ? user.followersCount + 1
                : user.followersCount - 1,
            }
          : user
      )
    );
  };

  const handleFollow = async (userId) => {
    try {
      if (followedUsers.has(userId)) {
        await api.unfollowUser(userId);
        setFollowedUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      } else {
        await api.followUser(userId);
        setFollowedUsers((prev) => new Set([...prev, userId]));
      }
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
    }
  };

  const handleStartChat = async (userId) => {
    try {
      const response = await api.getOrCreateDirectChat(userId);
      navigate(`/chat/${response.data.chat._id}`);
    } catch (error) {
      console.error("Error starting chat:", error);
      alert("Failed to start chat");
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setUsers([]);
    setCurrentPage(1);
    setHasMore(false);
    setTotalUsers(0);
    setFilter("all");
    setError("");
  };

  const filterOptions = [
    { value: "all", label: "All Users", icon: Users },
    { value: "following", label: "Following", icon: Heart },
    { value: "followers", label: "Followers", icon: Users },
    { value: "not-following", label: "Not Following", icon: User },
  ];

  return (
    <div className="flex-1 bg-black page-content">
      {/* Header */}
      <div className="nav-instagram px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-xl lg:text-2xl font-semibold">
              Search Users
            </h1>
            <p className="text-gray-400 text-sm hidden sm:block">
              Find and connect with people
            </p>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="px-4 lg:px-6 pb-4">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search users by name, username, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-instagram px-4 w-full bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            aria-label="Search users"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </form>
      </div>

      {/* Filter Options - REMOVED */}

      {/* Error Display */}
      {error && (
        <div className="notification-instagram mx-4 lg:mx-6 mb-4 flex items-center justify-between">
          <span className="text-red-400">{error}</span>
          <button
            onClick={() => setError("")}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search Results */}
      <div className="px-4 lg:px-6">
        {/* Results Count */}
        {users.length > 0 && (
          <div className="mb-4">
            <p className="text-gray-400 text-sm">
              Found {totalUsers} user{totalUsers !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {/* Loading State */}
        {searching && users.length === 0 && (
          <div className="loading-instagram">
            <div className="loading-spinner-instagram"></div>
            <p className="text-gray-400 mt-2">Searching...</p>
          </div>
        )}

        {/* No Results */}
        {!searching && users.length === 0 && debouncedQuery && (
          <div className="empty-state-instagram">
            <div className="empty-state-icon">
              <SearchIcon size={64} />
            </div>
            <h3 className="empty-state-title">No users found</h3>
            <p className="empty-state-description">
              Try adjusting your search terms or check the spelling
            </p>
          </div>
        )}

        {/* Initial State */}
        {!searching && !debouncedQuery && (
          <div className="empty-state-instagram">
            <div className="empty-state-icon">
              <SearchIcon size={64} />
            </div>
            <h3 className="empty-state-title">Search for users</h3>
            <p className="empty-state-description">
              Enter a name, username, or location to find users
            </p>
            <div className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
                  <User className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h4 className="text-white font-medium mb-1">Find Friends</h4>
                  <p className="text-gray-400 text-sm">
                    Search by name or username
                  </p>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
                  <MapPin className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <h4 className="text-white font-medium mb-1">
                    Location Search
                  </h4>
                  <p className="text-gray-400 text-sm">
                    Find users in your area
                  </p>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
                  <MessageCircle className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <h4 className="text-white font-medium mb-1">
                    Start Conversations
                  </h4>
                  <p className="text-gray-400 text-sm">
                    Connect and chat with new people
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users List */}
        {users.length > 0 && (
          <div className="space-y-4 max-w-2xl mx-auto">
            {users.map((user) => (
              <UserCard
                key={user._id}
                user={user}
                onFollowUpdate={handleFollowUpdate}
                onFollow={handleFollow}
                onStartChat={handleStartChat}
                followedUsers={followedUsers}
              />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-6">
                <button
                  onClick={loadMore}
                  disabled={searching}
                  className="btn-instagram-secondary disabled:opacity-50 flex items-center space-x-2"
                >
                  {searching ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <Users size={16} />
                      <span>Load More Users</span>
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

export default Search;
