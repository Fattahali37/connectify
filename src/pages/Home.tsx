import React, { useState } from "react";
import {
  Share2,
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const posts = [
  {
    id: 1,
    user: {
      name: "Emma Watson",
      username: "emma_watson",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80",
    },
    image:
      "https://images.unsplash.com/photo-1516245834210-c4c142787335?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    likes: 1234,
    caption: "Beautiful sunset at the beach! 🌅",
    comments: 89,
  },
  {
    id: 2,
    user: {
      name: "Tom Holland",
      username: "tom_holland",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80",
    },
    image:
      "https://images.unsplash.com/photo-1682687220198-88e9bdea9931?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    likes: 2567,
    caption: "Just another day in New York City 🗽",
    comments: 156,
  },
];

function Home() {
  const navigate = useNavigate();
  const [activeShareMenu, setActiveShareMenu] = useState<number | null>(null);
  const [activeOptionsMenu, setActiveOptionsMenu] = useState<number | null>(
    null
  );
  const [following, setFollowing] = useState<Record<string, boolean>>({});

  const handleProfileClick = (username: string) => {
    navigate(`/user/${username}`);
  };

  const ShareMenu = ({ postId }: { postId: number }) => (
    <div className="absolute right-0 bottom-full mb-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
      <div className="py-1" role="menu">
        <button
          onClick={() => navigate("/chat")}
          className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700"
          role="menuitem"
        >
          Share to Chat
        </button>
        <button
          className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700"
          role="menuitem"
        >
          Copy Link
        </button>
        <button
          className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700"
          role="menuitem"
        >
          Share to Story
        </button>
      </div>
    </div>
  );

  const OptionsMenu = ({ post }: { post: (typeof posts)[0] }) => (
    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
      <div className="py-1" role="menu">
        <button
          onClick={() =>
            setFollowing((prev) => ({
              ...prev,
              [post.user.username]: !prev[post.user.username],
            }))
          }
          className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700"
        >
          {following[post.user.username] ? "Unfollow" : "Follow"} @
          {post.user.username}
        </button>
        <button className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700">
          Add to favorites
        </button>
        <button className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-700">
          Report
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-gray-900 rounded-xl mb-6 overflow-hidden"
        >
          <div className="p-4 flex items-center justify-between">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => handleProfileClick(post.user.username)}
            >
              <img
                src={post.user.avatar}
                alt={post.user.name}
                className="w-10 h-10 rounded-full hover:opacity-80 transition-opacity duration-200"
              />
              <span className="ml-3 font-medium hover:underline">
                {post.user.name}
              </span>
            </div>
            <div className="relative">
              <button
                className="text-gray-400 hover:text-white"
                onClick={() =>
                  setActiveOptionsMenu(
                    activeOptionsMenu === post.id ? null : post.id
                  )
                }
              >
                <MoreHorizontal size={20} />
              </button>
              {activeOptionsMenu === post.id && <OptionsMenu post={post} />}
            </div>
          </div>

          <img
            src={post.image}
            alt=""
            className="w-full aspect-square object-cover"
          />

          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <button className="text-white hover:text-red-500 transition-colors duration-200">
                  <Heart size={24} />
                </button>
                <button
                  onClick={() => navigate(`/chat/${post.id}`)}
                  className="text-white hover:text-gray-300 transition-colors duration-200"
                >
                  <MessageCircle size={24} />
                </button>
                <div className="relative">
                  <button
                    className="text-white hover:text-gray-300 transition-colors duration-200"
                    onClick={() =>
                      setActiveShareMenu(
                        activeShareMenu === post.id ? null : post.id
                      )
                    }
                  >
                    <Share2 size={24} />
                  </button>
                  {activeShareMenu === post.id && (
                    <ShareMenu postId={post.id} />
                  )}
                </div>
              </div>
              <button className="text-white hover:text-yellow-500 transition-colors duration-200">
                <Bookmark size={24} />
              </button>
            </div>

            <div className="text-sm">
              <span className="font-bold">{post.likes.toLocaleString()}</span>{" "}
              likes
            </div>

            <p className="mt-2">
              <span
                className="font-bold mr-2 cursor-pointer hover:underline"
                onClick={() => handleProfileClick(post.user.username)}
              >
                {post.user.name}
              </span>
              {post.caption}
            </p>

            <button className="text-gray-400 text-sm mt-2">
              View all {post.comments} comments
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Home;
