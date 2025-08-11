import React, { useState, useEffect } from "react";
import {
  Search as SearchIcon,
  Filter,
  Users,
  Loader2,
  RefreshCw,
  X,
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
    }
  }, [debouncedQuery, filter]);

  const performSearch = async (query, page = 1, append = false) => {
    if (!query.trim()) return;

    setSearching(true);
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
  };

  const filterOptions = [
    { value: "all", label: "All Users", icon: Users },
    { value: "following", label: "Following", icon: Users },
    { value: "followers", label: "Followers", icon: Users },
    { value: "not-following", label: "Not Following", icon: Users },
  ];

  return (
    <div className="flex-1 bg-gray-900 page-content">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-white text-xl font-semibold">Search Users</h1>
          <button
            onClick={clearSearch}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
            title="Clear search"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-gray-700">
        <div className="relative">
          <SearchIcon
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search users by name, username, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Search Results */}
      <div className="search-results p-4">
        {searching && users.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
              <p className="text-gray-400">Searching...</p>
            </div>
          </div>
        )}

        {!searching && users.length === 0 && debouncedQuery && (
          <div className="text-center py-12">
            <SearchIcon className="text-gray-400 mx-auto mb-4" size={48} />
            <p className="text-gray-400 text-lg">No users found</p>
            <p className="text-gray-500 text-sm">
              Try adjusting your search terms
            </p>
          </div>
        )}

        {!searching && !debouncedQuery && (
          <div className="text-center py-12">
            <SearchIcon className="text-gray-400 mx-auto mb-4" size={48} />
            <p className="text-gray-400 text-lg">Search for users</p>
            <p className="text-gray-500 text-sm">
              Enter a name, username, or location to find users
            </p>
          </div>
        )}

        {users.length > 0 && (
          <div className="space-y-4">
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
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
