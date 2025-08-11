import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  User,
  Search,
  MessageCircle,
  Plus,
  Users,
  Bell,
  LogOut,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

function Sidebar({ onLogout }) {
  const location = useLocation();
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState(0);

  // Load pending requests count
  useEffect(() => {
    const loadPendingRequests = async () => {
      try {
        const [followResponse, friendResponse, groupResponse] = await Promise.all([
          api.getFollowRequests(),
          api.getFriendRequests(),
          api.getGroupInvites(),
        ]);

        const totalPending = 
          (followResponse.data.requests?.filter(r => r.status === "pending").length || 0) +
          (friendResponse.data.requests?.filter(r => r.status === "pending").length || 0) +
          (groupResponse.data.requests?.filter(r => r.status === "pending").length || 0);

        setPendingRequests(totalPending);
      } catch (error) {
        console.error("Error loading pending requests:", error);
      }
    };

    loadPendingRequests();
  }, []);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/profile", icon: User, label: "Profile" },
    { path: "/search", icon: Search, label: "Search" },
    { path: "/chat", icon: MessageCircle, label: "Messages" },
    { path: "/create-post", icon: Plus, label: "Create Post" },
    { 
      path: "/requests", 
      icon: Bell, 
      label: "Requests",
      badge: pendingRequests > 0 ? pendingRequests : null
    },
  ];

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* User Profile Section */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt=""
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-medium text-lg">
                {user?.firstName?.charAt(0) || "U"}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold truncate">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-gray-400 text-sm truncate">@{user?.username}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? "bg-purple-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
