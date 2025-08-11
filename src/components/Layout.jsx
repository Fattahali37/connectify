import React from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "../contexts/AuthContext";

function Layout({ children, onLogout }) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar onLogout={handleLogout} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="main-content">{children}</div>
      </main>
    </div>
  );
}

export default Layout;
