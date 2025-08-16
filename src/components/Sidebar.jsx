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
  X,
  Heart,
  Compass,
  Play,
  Bookmark,
  Settings,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

function Sidebar({ onLogout, onClose }) {
  const location = useLocation();
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState(0);

  // Load pending requests count
  useEffect(() => {
    const loadPendingRequests = async () => {
      try {
        const [followResponse, friendResponse, groupResponse] =
          await Promise.all([
            api.getFollowRequests(),
            api.getFriendRequests(),
            api.getGroupInvites(),
          ]);

        const totalPending =
          (followResponse.data.requests?.filter((r) => r.status === "pending")
            .length || 0) +
          (friendResponse.data.requests?.filter((r) => r.status === "pending")
            .length || 0) +
          (groupResponse.data.requests?.filter((r) => r.status === "pending")
            .length || 0);

        setPendingRequests(totalPending);
      } catch (error) {
        console.error("Error loading pending requests:", error);
      }
    };

    loadPendingRequests();
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleNavClick = () => {
    // Close sidebar on mobile when navigation item is clicked
    if (onClose) {
      onClose();
    }
  };

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/search", icon: Search, label: "Search" },
    { path: "/chat", icon: MessageCircle, label: "Messages" },
    { path: "/create-post", icon: Plus, label: "Create" },
    { path: "/profile", icon: User, label: "Profile" },
    {
      path: "/requests",
      icon: Bell,
      label: "Requests",
      badge: pendingRequests > 0 ? pendingRequests : null,
    },
  ];

  return (
    <div className="w-64 bg-black border-r border-gray-800 flex flex-col h-full">
      {/* Header with close button for mobile */}
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          {/* Instagram-style logo */}
          <div className="w-8 h-8 gradient-instagram rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold truncate">Connectify</h3>
            <p className="text-gray-400 text-sm truncate">@{user?.username}</p>
          </div>
        </div>

        {/* Close button for mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? "bg-gray-800 text-white font-semibold"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
              aria-label={item.label}
            >
              <Icon size={20} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center animate-pulse">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-all duration-200"
          aria-label="Logout"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
