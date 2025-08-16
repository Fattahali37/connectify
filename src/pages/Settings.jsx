import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function Settings() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 bg-black page-content">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-white text-2xl font-semibold">Settings</h1>
        </div>
      </div>

      {/* Settings Content */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-white text-xl font-semibold mb-4">
            Settings Page
          </h2>
          <p className="text-gray-400">
            This is the settings page. If you can see this, the routing is
            working correctly!
          </p>
        </div>
      </div>
    </div>
  );
}

export default Settings;
