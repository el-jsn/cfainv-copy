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

const App = () => {
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
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;