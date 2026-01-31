import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DynamicModuleListView from './pages/dynamic-module-list-view';
import TenantAdminDashboard from './pages/tenant-admin-dashboard';
import RecordDetailManagement from './pages/record-detail-management';
import DashboardBuilderStudio from './pages/dashboard-builder-studio';
import DashboardViewer from './pages/dashboard-viewer';
import DashboardManagement from './pages/dashboard-management';
import UserManagementConsole from './pages/user-management-console';
import SchemaBuilderInterface from './pages/schema-builder-interface';
import { useAuth } from './contexts/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth/login" replace />;
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Public Routes */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <TenantAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dynamic-module-list-view"
            element={
              <ProtectedRoute>
                <DynamicModuleListView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenant-admin-dashboard"
            element={
              <ProtectedRoute>
                <TenantAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/record-detail-management"
            element={
              <ProtectedRoute>
                <RecordDetailManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-builder-studio"
            element={
              <ProtectedRoute>
                <DashboardBuilderStudio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-viewer"
            element={
              <ProtectedRoute>
                <DashboardViewer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-management"
            element={
              <ProtectedRoute>
                <DashboardManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-management-console"
            element={
              <ProtectedRoute>
                <UserManagementConsole />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schema-builder-interface"
            element={
              <ProtectedRoute>
                <SchemaBuilderInterface />
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
