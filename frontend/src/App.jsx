import React from "react";
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import UpdateUPTs from "./components/UpdateUPTs";
import UpdateSalesProjection from "./components/UpdateSalesProjection";
import ThawingCabinet from "./components/ThawingCabinet";
import LoginPage from "./components/LoginPage";
import MessageFormComponent from "./components/MessageFormComponent";
import MessageListPage from "./components/MessageListPage";
import Layout from "./components/Layout";
import ClosurePlannerComponent from "./components/ClosurePlannerComponent";
import ClosurePlanList from "./components/ClosurePlanList";
import Instructions from "./components/InstructionsComponent";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { Navigate } from "react-router-dom";

const App = () => {

  let wakeLock = null;

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake Lock active');
      } else {
        console.warn('Wake Lock API is not supported in this browser.');
      }
    } catch (err) {
      console.error('Failed to request Wake Lock:', err);
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLock !== null) {
      try {
        await wakeLock.release();
        wakeLock = null;
        console.log('Wake Lock released');
      } catch (err) {
        console.error('Failed to release Wake Lock:', err);
      }
    }
  };

  useEffect(() => {
    // Request Wake Lock on app mount
    requestWakeLock();

    // Re-request Wake Lock on visibility change
    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on app unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, []);

  const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user } = useAuth();

    if (!user) {
      return <Navigate to="/login" />;
    }

    if (adminOnly && !user.isAdmin) {
      return <Navigate to="/thawing-cabinet" />;
    }

    return children;
  };

  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={
              <LoginPage />
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/update-upt" element={
              <ProtectedRoute adminOnly>
                <UpdateUPTs />
              </ProtectedRoute>
            } />
            <Route path="/update-sales-projection" element={
              <ProtectedRoute adminOnly>
                <UpdateSalesProjection />
              </ProtectedRoute>
            } />
            <Route path="/thawing-cabinet" element={
              <ProtectedRoute>
                <ThawingCabinet />
              </ProtectedRoute>
            } />
            <Route path="/data/message/add" element={
              <ProtectedRoute adminOnly>
                <MessageFormComponent />
              </ProtectedRoute>
            } />
            <Route path="/data/message/all" element={
              <ProtectedRoute adminOnly>
                <MessageListPage />
              </ProtectedRoute>
            } />
            <Route path="/closure/plan/add" element={
              <ProtectedRoute adminOnly>
                <ClosurePlannerComponent />
              </ProtectedRoute>
            } />
            <Route path="/closure/plans" element={
              <ProtectedRoute adminOnly>
                <ClosurePlanList />
              </ProtectedRoute>
            } />
            <Route path="/instructions" element={
              <ProtectedRoute adminOnly>
                <Instructions />
              </ProtectedRoute>
            } />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;