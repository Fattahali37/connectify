import React, { useState } from "react";
import { Link } from "react-router-dom";
import loginLogo from "./Login.png";

interface SignupProps {
  onSignup: () => void;
}

function Signup({ onSignup }: SignupProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignup();
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-gray-900 p-10 rounded-2xl shadow-xl">
        {/* Logo Section */}
        <div className="flex justify-center mb-6">
          <img src={loginLogo} alt="Logo" className="h-24 w-auto" />
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="name"
              className="block text-base font-medium text-gray-300 mb-2"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-5 py-4 rounded-xl bg-gray-800 border-2 border-gray-700 focus:border-purple-500 focus:ring-purple-500 text-white text-lg transition-colors duration-200"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-base font-medium text-gray-300 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-5 py-4 rounded-xl bg-gray-800 border-2 border-gray-700 focus:border-purple-500 focus:ring-purple-500 text-white text-lg transition-colors duration-200"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-base font-medium text-gray-300 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-5 py-4 rounded-xl bg-gray-800 border-2 border-gray-700 focus:border-purple-500 focus:ring-purple-500 text-white text-lg transition-colors duration-200"
              placeholder="Create a password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-4 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-gray-400 text-lg">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-purple-500 hover:text-purple-400 font-medium transition-colors duration-200"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
