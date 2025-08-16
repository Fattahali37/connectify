import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Image,
  Send,
  X,
  Loader2,
  Camera,
  MapPin,
  Tag,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";
import api from "../services/api";

function CreatePost() {
  const [formData, setFormData] = useState({
    caption: "",
    image: "",
    tags: "",
    location: "",
    privacy: "public", // Added privacy field
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    if (error) setError("");
    if (name === "image" && imageError) setImageError("");
  };

  const validateImage = (url) => {
    if (!url) return true; // Optional field
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleImageChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, image: url }));

    if (url && !validateImage(url)) {
      setImageError("Please enter a valid URL");
      setImagePreview(null);
    } else {
      setImageError("");
      if (url) {
        setImagePreview(url);
      } else {
        setImagePreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.caption.trim() && !formData.image.trim()) {
      setError("Please add a caption or image to create a post");
      return;
    }

    if (formData.image && !validateImage(formData.image)) {
      setError("Please enter a valid image URL");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Prepare post data
      const postData = {
        caption: formData.caption.trim(),
        image: formData.image.trim(),
        tags: formData.tags.trim(),
        location: formData.location.trim(),
        privacy: formData.privacy, // Include privacy
      };

      // Remove empty fields
      Object.keys(postData).forEach((key) => {
        if (!postData[key]) delete postData[key];
      });

      await api.createPost(postData);

      // Redirect to home page
      navigate("/");
    } catch (error) {
      console.error("Error creating post:", error);
      setError(error.message || "Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({
      caption: "",
      image: "",
      tags: "",
      location: "",
      privacy: "public", // Reset privacy
    });
    setError("");
    setImageError("");
    setImagePreview(null);
  };

  const isFormValid =
    (formData.caption.trim() || formData.image.trim()) && !imageError;

  return (
    <div className="flex-1 bg-black page-content">
      {/* Header */}
      <div className="nav-instagram px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl lg:text-2xl font-semibold text-white">
            Create Post
          </h1>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.caption.trim()}
            className="btn-instagram disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <Loader2 size={18} className="animate-spin" />
                <span>Posting...</span>
              </div>
            ) : (
              "Share"
            )}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto p-4 lg:p-6">
        <div className="card-instagram p-6">
          {/* Image Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <div className="flex items-center space-x-2">
                <Camera size={20} className="text-gray-400" />
                <span>Post Image (Optional)</span>
              </div>
            </label>
            <div className="space-y-3">
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleImageChange}
                placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                className="input-instagram"
                aria-label="Image URL"
              />
              {imageError && (
                <p className="text-red-400 text-sm">{imageError}</p>
              )}
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-96 object-cover rounded-lg border border-gray-600"
                    onError={() => setImageError("Failed to load image")}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, image: "" }));
                      setImagePreview(null);
                      setImageError("");
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    aria-label="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Caption Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <div className="flex items-center space-x-2">
                <MessageCircle size={20} className="text-gray-400" />
                <span>Caption</span>
              </div>
            </label>
            <textarea
              name="caption"
              value={formData.caption}
              onChange={handleChange}
              placeholder="What's on your mind?"
              rows={4}
              maxLength={500}
              className="input-instagram resize-none"
              aria-label="Post caption"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-400">
                {formData.caption.length}/500 characters
              </span>
              {formData.caption.length > 450 && (
                <span className="text-xs text-yellow-400">
                  {formData.caption.length > 480 ? "⚠️" : "⚠️"}
                </span>
              )}
            </div>
          </div>

          {/* Location Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <div className="flex items-center space-x-2">
                <MapPin size={20} className="text-gray-400" />
                <span>Location (Optional)</span>
              </div>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Add location"
              className="input-instagram"
              aria-label="Location"
            />
          </div>

          {/* Tags Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <div className="flex items-center space-x-2">
                <Tag size={20} className="text-gray-400" />
                <span>Tags (Optional)</span>
              </div>
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Add tags separated by commas (e.g., #fun, #life, #friends)"
              className="input-instagram"
              aria-label="Tags"
            />
            <p className="text-xs text-gray-400 mt-1">
              Use hashtags to help others discover your post
            </p>
          </div>

          {/* Privacy Settings */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Privacy
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="privacy"
                  value="public"
                  checked={formData.privacy === "public"}
                  onChange={handleChange}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-300">
                  Public - Anyone can see this post
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="privacy"
                  value="friends"
                  checked={formData.privacy === "friends"}
                  onChange={handleChange}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-300">
                  Friends only - Only your friends can see this post
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.caption.trim()}
              className="btn-instagram px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <Loader2 size={20} className="animate-spin" />
                  <span>Creating Post...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send size={20} />
                  <span>Share Post</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatePost;
