import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Search,
  UserPlus,
  PlusSquare,
  User,
  MessageSquare,
} from "lucide-react";
import cornerLogo from "./corner.png";

function Sidebar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-64 border-r border-gray-800 p-4 flex flex-col h-full">
      <Link to="/" className="mb-10 flex justify-center">
        <img src={cornerLogo} alt="Logo" className="h-20 w-auto" />
      </Link>

      <nav className="flex-1">
        <Link
          to="/"
          className={`flex items-center space-x-4 p-3 rounded-lg mb-2 ${
            isActive("/") ? "bg-gray-800" : "hover:bg-gray-800"
          }`}
        >
          <Home size={24} />
          <span>Home</span>
        </Link>

        <Link
          to="/search"
          className={`flex items-center space-x-4 p-3 rounded-lg mb-2 ${
            isActive("/search") ? "bg-gray-800" : "hover:bg-gray-800"
          }`}
        >
          <Search size={24} />
          <span>Search</span>
        </Link>

        <Link
          to="/chat"
          className={`flex items-center space-x-4 p-3 rounded-lg mb-2 ${
            isActive("/chat") ? "bg-gray-800" : "hover:bg-gray-800"
          }`}
        >
          <MessageSquare size={24} />
          <span>Messages</span>
        </Link>

        <Link
          to="/requests"
          className={`flex items-center space-x-4 p-3 rounded-lg mb-2 ${
            isActive("/requests") ? "bg-gray-800" : "hover:bg-gray-800"
          }`}
        >
          <UserPlus size={24} />
          <span>Follow Requests</span>
        </Link>

        <Link
          to="/create"
          className={`flex items-center space-x-4 p-3 rounded-lg mb-2 ${
            isActive("/create") ? "bg-gray-800" : "hover:bg-gray-800"
          }`}
        >
          <PlusSquare size={24} />
          <span>Create</span>
        </Link>

        <Link
          to="/profile"
          className={`flex items-center space-x-4 p-3 rounded-lg mb-2 ${
            isActive("/profile") ? "bg-gray-800" : "hover:bg-gray-800"
          }`}
        >
          <User size={24} />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}

export default Sidebar;
