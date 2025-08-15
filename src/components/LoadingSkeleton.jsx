import React from "react";

function LoadingSkeleton({ type = "post", count = 1 }) {
  const renderPostSkeleton = () => (
    <div className="bg-gray-900 rounded-xl mb-6 overflow-hidden animate-pulse">
      {/* Header */}
      <div className="p-4 flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-16"></div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  );

  const renderUserCardSkeleton = () => (
    <div className="bg-gray-800 rounded-lg p-4 animate-pulse">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-16"></div>
        </div>
        <div className="w-20 h-8 bg-gray-700 rounded"></div>
      </div>
    </div>
  );

  const renderChatItemSkeleton = () => (
    <div className="flex items-center space-x-3 p-3 animate-pulse">
      <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
        <div className="h-3 bg-gray-700 rounded w-32"></div>
      </div>
    </div>
  );

  const renderProfileSkeleton = () => (
    <div className="bg-gray-900 rounded-xl p-6 animate-pulse">
      {/* Cover and Profile Picture */}
      <div className="relative mb-6">
        <div className="h-32 bg-gray-700 rounded-t-xl"></div>
        <div className="absolute -bottom-8 left-6">
          <div className="w-16 h-16 bg-gray-700 rounded-full border-4 border-gray-900"></div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="ml-24 mb-6">
        <div className="h-6 bg-gray-700 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-48"></div>
      </div>

      {/* Stats */}
      <div className="flex space-x-6 mb-6">
        <div className="text-center">
          <div className="h-6 bg-gray-700 rounded w-8 mb-1"></div>
          <div className="h-3 bg-gray-700 rounded w-12"></div>
        </div>
        <div className="text-center">
          <div className="h-6 bg-gray-700 rounded w-8 mb-1"></div>
          <div className="h-3 bg-gray-700 rounded w-12"></div>
        </div>
        <div className="text-center">
          <div className="h-6 bg-gray-700 rounded w-8 mb-1"></div>
          <div className="h-3 bg-gray-700 rounded w-12"></div>
        </div>
      </div>
    </div>
  );

  const renderSearchSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      {[...Array(count)].map((_, index) => (
        <div key={index} className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-16"></div>
            </div>
            <div className="w-20 h-8 bg-gray-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case "post":
        return [...Array(count)].map((_, index) => (
          <div key={index}>{renderPostSkeleton()}</div>
        ));
      case "userCard":
        return [...Array(count)].map((_, index) => (
          <div key={index}>{renderUserCardSkeleton()}</div>
        ));
      case "chatItem":
        return [...Array(count)].map((_, index) => (
          <div key={index}>{renderChatItemSkeleton()}</div>
        ));
      case "profile":
        return renderProfileSkeleton();
      case "search":
        return renderSearchSkeleton();
      case "spinner":
        return renderSpinner();
      default:
        return renderPostSkeleton();
    }
  };

  return <>{renderContent()}</>;
}

export default LoadingSkeleton;
