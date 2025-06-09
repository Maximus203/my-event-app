import { AnimatePresence } from 'framer-motion';
import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';

// Import des pages
import CreateEditEventPage from '@/pages/CreateEditEventPage';
import DashboardPage from '@/pages/DashboardPage';
import EventDetailPage from '@/pages/EventDetailPage';
import EventsPage from '@/pages/EventsPage';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import NotFoundPage from '@/pages/NotFoundPage';
import NotificationsPage from '@/pages/NotificationsPage';
import ProfilePage from '@/pages/ProfilePage';
import RegisterPage from '@/pages/RegisterPage';

// Import des providers et contextes
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { UserPreferencesProvider } from '@/providers/UserPreferencesProvider';

// Composant pour protéger les routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Composant pour les routes publiques (redirection si connecté)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/events" replace />;
  }

  return <>{children}</>;
};

// Composant principal des routes
const AppRoutes: React.FC = () => {
  const location = useLocation();

   return(<AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Page d'accueil */}
        <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />

        {/* Authentification */}
        <Route 
          path="/login" 
          element={
            <PublicRoute><MainLayout>
              <LoginPage />
            </MainLayout></PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute><MainLayout>
              <RegisterPage />
            </MainLayout></PublicRoute>
          } 
        />
        
        {/* Événements */}
        <Route path="/events" element={<MainLayout><EventsPage /></MainLayout>} />
        {/* <Route path="/search" element={<SearchPage />} /> */}
        <Route 
          path="/events/new" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreateEditEventPage />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/events/:id/edit" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreateEditEventPage />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route path="/events/:id" element={<EventDetailPage />} />
          {/* Dashboard et profil utilisateur */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <NotificationsPage />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        {/* Pages d'administration (à créer) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <div className="p-8 text-center">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Administration
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Section administration à implémenter
                  </p>
                </div>
              </MainLayout>
            </ProtectedRoute>
          } 
        />
          {/* Redirections et 404 */}
        <Route path="/404" element={<MainLayout><NotFoundPage /></MainLayout>} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <UserPreferencesProvider>
          <ToastProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </ToastProvider>
        </UserPreferencesProvider>
      </ThemeProvider>
    </Router>
  );
};

export default AppRouter;
