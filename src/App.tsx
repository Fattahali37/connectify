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

function App() {
  // For demo purposes, we'll use local state to manage authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to handle login
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
          <Route path="requests" element={<Requests />} />
          <Route path="create" element={<CreatePost />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;