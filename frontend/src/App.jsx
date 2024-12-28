import React from "react";
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import UpdateUPTs from "./components/UpdateUPTs";
import UpdateSalesProjection from "./components/UpdateSalesProjection";
import ThawingCabinet from "./components/ThawingCabinet";
import PrivateRoute from "./components/PrivateRoute";
import LoginPage from "./components/LoginPage";
import MessageFormComponent from "./components/MessageFormComponent";
import MessageListPage from "./components/MessageListPage";
import Layout from "./components/Layout";
import ClosurePlannerComponent from "./components/ClosurePlannerComponent";
import ClosurePlanList from "./components/ClosurePlanList";
import Instructions from "./components/InstructionsComponent";
import { useEffect } from "react";

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

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          } />
          <Route path="/update-upt" element={
            <PrivateRoute>
              <UpdateUPTs />
            </PrivateRoute>
          } />
          <Route path="/update-sales-projection" element={
            <PrivateRoute>
              <UpdateSalesProjection />
            </PrivateRoute>
          } />
          <Route path="/thawing-cabinet" element={
            <PrivateRoute>
              <ThawingCabinet />
            </PrivateRoute>
          } />
          <Route path="/data/message/add" element={
            <PrivateRoute>
              <MessageFormComponent />
            </PrivateRoute>
          } />
          <Route path="/data/message/all" element={
            <PrivateRoute>
              <MessageListPage />
            </PrivateRoute>
          } />
          <Route path="/closure/plan/add" element={
            <PrivateRoute>
              <ClosurePlannerComponent />
            </PrivateRoute>
          } />
          <Route path="/closure/plans" element={
            <PrivateRoute>
              <ClosurePlanList />
            </PrivateRoute>
          } />
          <Route path="/instructions" element={
            <PrivateRoute>
              <Instructions />
            </PrivateRoute>
          } />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;