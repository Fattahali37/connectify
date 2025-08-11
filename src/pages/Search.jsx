import React, { useState, useEffect } from "react";
import {
  Search as SearchIcon,
  Filter,
  Users,
  Loader2,
  RefreshCw,
} from "lucide-react";
import UserCard from "../components/UserCard";
import api from "../services/api";

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
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search Users</h1>
        <p className="text-gray-400">
          Find and connect with other users on Connectify
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-gray-900 rounded-xl p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <SearchIcon
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username, name, or bio..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={!searchQuery.trim() || loading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="px-4 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Options */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleFilterChange(option.value)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    filter === option.value
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <Icon size={16} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </form>
      </div>

      {/* Search Results */}
      {searching && users.length === 0 && (
        <div className="text-center py-20">
          <Loader2
            className="animate-spin text-purple-500 mx-auto mb-4"
            size={48}
          />
          <p className="text-gray-400">Searching for users...</p>
        </div>
      )}

      {!searching && users.length === 0 && debouncedQuery && (
        <div className="text-center py-20">
          <div className="bg-gray-900 rounded-xl p-8">
            <Users size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No users found</h3>
            <p className="text-gray-400 mb-4">
              No users match your search for "{debouncedQuery}"
            </p>
            <button
              onClick={clearSearch}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg text-white transition-colors"
            >
              Try a different search
            </button>
          </div>
        </div>
      )}

      {users.length > 0 && (
        <div className="space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {totalUsers} user{totalUsers !== 1 ? "s" : ""} found
              </h2>
              {filter !== "all" && (
                <p className="text-gray-400 text-sm">
                  Filtered by:{" "}
                  {filterOptions.find((f) => f.value === filter)?.label}
                </p>
              )}
            </div>

            {users.length > 0 && (
              <button
                onClick={() => performSearch(debouncedQuery, 1, false)}
                disabled={searching}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <RefreshCw
                  size={16}
                  className={searching ? "animate-spin" : ""}
                />
                <span>Refresh</span>
              </button>
            )}
          </div>

          {/* User Cards */}
          <div className="grid gap-4">
            {users.map((user) => (
              <UserCard
                key={user._id}
                user={user}
                onFollowUpdate={handleFollowUpdate}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center py-6">
              <button
                onClick={loadMore}
                disabled={searching}
                className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {searching ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  "Load More Users"
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!debouncedQuery && !loading && (
        <div className="text-center py-20">
          <div className="bg-gray-900 rounded-xl p-8">
            <SearchIcon size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Start searching</h3>
            <p className="text-gray-400">
              Enter a username, name, or bio to find users on Connectify
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;
