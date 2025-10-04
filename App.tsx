
import React from 'react';
// FIX: Use namespace import for react-router-dom to address potential module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import SplashPage from './pages/SplashPage';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import HomePage from './pages/HomePage';
import PaymentPage from './pages/PaymentPage';
import HistoryPage from './pages/HistoryPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ChatPage from './pages/ChatPage';
import { ChatProvider } from './contexts/ChatContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <ChatProvider>
          <ReactRouterDOM.HashRouter>
            <ReactRouterDOM.Routes>
              <ReactRouterDOM.Route path="/" element={<SplashPage />} />
              <ReactRouterDOM.Route path="/login" element={<LoginPage />} />
              <ReactRouterDOM.Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <ReactRouterDOM.Route index element={<ReactRouterDOM.Navigate to="home" replace />} />
                <ReactRouterDOM.Route path="home" element={<HomePage />} />
                <ReactRouterDOM.Route path="payment" element={<PaymentPage />} />
                <ReactRouterDOM.Route path="history" element={<HistoryPage />} />
                <ReactRouterDOM.Route path="notifications" element={<NotificationsPage />} />
                <ReactRouterDOM.Route path="chat" element={<ChatPage />} />
                <ReactRouterDOM.Route path="profile" element={<ProfilePage />} />
              </ReactRouterDOM.Route>
              <ReactRouterDOM.Route path="*" element={<ReactRouterDOM.Navigate to="/" />} />
            </ReactRouterDOM.Routes>
          </ReactRouterDOM.HashRouter>
        </ChatProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
};

export default App;
