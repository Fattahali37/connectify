import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Layout from './components/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import Requests from './pages/Requests';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import Chat from './pages/Chat';
import ChatRoom from './pages/ChatRoom';
import UserProfile from './pages/UserProfile';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              <Navigate to="/" replace /> : 
              <Login onLogin={handleLogin} />
          } 
        />
        <Route 
          path="/signup" 
          element={
            isAuthenticated ? 
              <Navigate to="/" replace /> : 
              <Signup onSignup={handleLogin} />
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
              <Layout /> : 
              <Navigate to="/login" replace />
          }
        >
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="chat" element={<Chat />} />
          <Route path="chat/:id" element={<ChatRoom />} />
          <Route path="requests" element={<Requests />} />
          <Route path="create" element={<CreatePost />} />
          <Route path="profile" element={<Profile />} />
          <Route path="user/:username" element={<UserProfile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;