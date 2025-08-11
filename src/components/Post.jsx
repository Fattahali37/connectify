import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Send,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Post({ post, onPostUpdate, onPostDelete, currentUser }) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [commentCount, setCommentCount] = useState(post.comments?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const navigate = useNavigate();

  const handleLike = async () => {
    try {
      const response = await api.toggleLike(post._id);
      setIsLiked(response.data.isLiked);
      setLikeCount(response.data.likeCount);

      // Update the post in parent component
      if (onPostUpdate) {
        onPostUpdate(post._id, {
          isLiked: response.data.isLiked,
          likes: response.data.likeCount,
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await api.addComment(post._id, commentText);
      setCommentText("");
      setCommentCount(response.data.commentCount);

      // Update the post in parent component
      if (onPostUpdate) {
        onPostUpdate(post._id, {
          comments: [...(post.comments || []), response.data.comment],
          commentCount: response.data.commentCount,
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await api.deletePost(post._id);
        if (onPostDelete) {
          onPostDelete(post._id);
        }
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
    setShowOptions(false);
  };

  const handleProfileClick = () => {
    navigate(`/user/${post.user.username}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-gray-900 rounded-xl mb-6 overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div
          className="flex items-center cursor-pointer"
          onClick={handleProfileClick}
        >
          <img
            src={post.user.profilePicture || "https://via.placeholder.com/40"}
            alt={post.user.firstName}
            className="w-10 h-10 rounded-full hover:opacity-80 transition-opacity duration-200"
          />
          <div className="ml-3">
            <span className="font-medium hover:underline">
              {post.user.firstName} {post.user.lastName}
            </span>
            <p className="text-gray-400 text-sm">@{post.user.username}</p>
          </div>
        </div>

        <div className="relative">
          <button
            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
            onClick={() => setShowOptions(!showOptions)}
          >
            <MoreHorizontal size={20} />
          </button>

          {showOptions && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
              <div className="py-1">
                {currentUser && currentUser._id === post.user._id && (
                  <button
                    onClick={handleDelete}
                    className="flex items-center w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-700"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete Post
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Post Image */}
      {post.image && (
        <img
          src={post.image}
          alt=""
          className="w-full aspect-square object-cover"
        />
      )}

      {/* Post Content */}
      <div className="p-4">
        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`transition-colors duration-200 ${
                isLiked ? "text-red-500" : "text-white hover:text-red-500"
              }`}
            >
              <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="text-white hover:text-gray-300 transition-colors duration-200"
            >
              <MessageCircle size={24} />
            </button>

            <button className="text-white hover:text-gray-300 transition-colors duration-200">
              <Share2 size={24} />
            </button>
          </div>
        </div>

        {/* Like Count */}
        <div className="text-sm mb-2">
          <span className="font-bold">{likeCount.toLocaleString()}</span> likes
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="mb-2">
            <span
              className="font-bold mr-2 cursor-pointer hover:underline"
              onClick={handleProfileClick}
            >
              {post.user.firstName} {post.user.lastName}
            </span>
            {post.caption}
          </p>
        )}

        {/* Comments Preview */}
        {post.comments && post.comments.length > 0 && (
          <div className="mb-2">
            {post.comments.slice(0, 2).map((comment, index) => (
              <p key={index} className="text-sm">
                <span
                  className="font-bold cursor-pointer hover:underline"
                  onClick={() => navigate(`/user/${comment.user.username}`)}
                >
                  {comment.user.firstName} {comment.user.lastName}
                </span>
                <span className="ml-2">{comment.text}</span>
              </p>
            ))}
            {post.comments.length > 2 && (
              <button
                onClick={() => setShowComments(!showComments)}
                className="text-gray-400 text-sm hover:text-white"
              >
                View all {post.comments.length} comments
              </button>
            )}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-gray-400 text-xs mt-2">
          {formatDate(post.createdAt)}
        </p>

        {/* Comment Input */}
        <div className="mt-4 border-t border-gray-800 pt-4">
          <form onSubmit={handleComment} className="flex space-x-3">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 text-sm"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={!commentText.trim() || isSubmitting}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Post;
