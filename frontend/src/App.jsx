import React, { Suspense, lazy } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import LoadingSpinner from './components/LoadingSpinner';
import { AuthProvider, useAuth } from "./components/AuthContext";
import { Navigate } from "react-router-dom";
import SalesProjectionConfig from './components/SalesProjectionConfig';
import ClosurePlannerComponent from "./components/ClosurePlannerComponent";
import ClosurePlanList from "./components/ClosurePlanList";
import Instructions from "./components/InstructionsComponent";
import PrepAllocations from "./components/PrepAllocations";
import HowToUse from "./components/HowToUse";
import MessageFormComponent from "./components/MessageFormComponent";
import MessageListPage from "./components/MessageListPage";
import ErrorBoundary from './components/ErrorBoundary';
import { SWRConfig } from 'swr';
import AllocationsDashboard from './components/AllocationsDashboard';
// 
// Lazy load components
const HomePage = lazy(() => import('./components/HomePage'));
const ThawingCabinet = lazy(() => import('./components/ThawingCabinet'));
const UpdateUPTs = lazy(() => import('./components/UpdateUPTs'));
const UpdateSalesProjection = lazy(() => import('./components/UpdateSalesProjection'));
const LoginPage = lazy(() => import('./components/LoginPage'));
const FutureProjectionsCalendar = lazy(() => import('./components/FutureProjectionsCalendar'));
const DeveloperInfo = lazy(() => import('./components/DeveloperInfo'));
const TruckItems = lazy(() => import('./components/TruckItems.jsx'));

const App = () => {

  const fetcher = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
      const error = new Error('An error occurred while fetching the data.');
      error.info = await res.json().catch(() => ({ message: 'Failed to parse error JSON' }));
      error.status = res.status;
      throw error;
    }
    return res.json();
  };

  const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user } = useAuth();

    if (!user) {
      return <Navigate to="/login" />;
    }

    if (adminOnly && !user.isAdmin) {
      return <Navigate to="/" />;
    }

    return children;
  };

  return (
    <SWRConfig value={{ fetcher }}>
        <AuthProvider>
        <Router>
            <Layout>
              <Suspense fallback={
                <div className="flex items-center justify-center h-screen">
                  <LoadingSpinner />
                </div>
              }>
                <ErrorBoundary >
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/dev-info" element={<DeveloperInfo />} />
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
                  <Route path="/how-to" element={
                    <ProtectedRoute adminOnly>
                      <HowToUse />
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
                  <Route path="/prep-allocations" element={
                    <ProtectedRoute>
                      <PrepAllocations />
                    </ProtectedRoute>
                  } />
                  <Route path="/allocations-dashboard" element={
                    <ProtectedRoute>
                      <AllocationsDashboard />
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
                  <Route path="/thawing-cabinet/config" element={
                    <ProtectedRoute adminOnly>
                      <SalesProjectionConfig />
                    </ProtectedRoute>
                  } />
                  <Route path="/truck-items" element={
                    <ProtectedRoute adminOnly>
                      <TruckItems />
                    </ProtectedRoute>
                  } />
                  <Route path="/future-projections" element={<FutureProjectionsCalendar />} />
                </Routes>
                </ErrorBoundary >
              </Suspense>
            </Layout>
          </Router>
        </AuthProvider>
      </SWRConfig>
  );
};

export default App;