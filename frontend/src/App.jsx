import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import { SocketProvider } from "./contexts/SocketContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/Dashboard";
import WorkspaceView from "./components/WorkspaceView";
import Layout from "./components/Layout";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <WorkspaceProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workspace/:workspaceId"
                element={
                  <ProtectedRoute>
                    <WorkspaceView />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </WorkspaceProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
