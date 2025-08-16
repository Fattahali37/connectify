import React, { useState } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { useAuth } from "../contexts/AuthContext";
import { Menu, X } from "lucide-react";

function Layout({ children, onLogout }) {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    if (onLogout) {
      onLogout();
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-black">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          onLogout={handleLogout}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden bg-black border-b border-gray-800 px-4 py-3 flex items-center justify-between">
          <button
            onClick={toggleSidebar}
            className="text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-800 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-white font-semibold">Connectify</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        <div className="main-content-instagram flex-1 overflow-hidden">
          {children}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}

export default Layout;
