import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FilterProvider } from './context/FilterContext';
import LoginPage from './components/Auth/LoginPage';
import JobFeed from './components/JobFeed/JobFeed';
import Dashboard from './components/Applications/Dashboard';
import Header from './components/Layout/Header';
import AIAssistant from './components/AIAssistant/AIAssistant';
import './index.css';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Main App Layout
function AppLayout() {
  return (
    <FilterProvider>
      <div className="app-layout">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<JobFeed />} />
            <Route path="/applications" element={<Dashboard />} />
          </Routes>
        </main>
        <AIAssistant />
      </div>
    </FilterProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
