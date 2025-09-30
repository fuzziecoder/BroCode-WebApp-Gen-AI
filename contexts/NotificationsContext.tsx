import React, { createContext, useState, useEffect, useContext, ReactNode, useMemo } from 'react';
import { Notification } from '../types';

// Initial mock data
const initialNotifications: Notification[] = [
    { id: 'n-5', title: 'New Invitation', message: 'Admin Bro has invited you to The Downtown Pub.', timestamp: new Date(Date.now() - 60000).toISOString(), read: false },
    { id: 'n-1', title: 'Payment Confirmed', message: 'Admin Bro has confirmed your payment for The Downtown Pub.', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false },
    { id: 'n-2', title: 'Spot Updated', message: 'The budget for The Downtown Pub has been updated to $50.', timestamp: new Date(Date.now() - 86400000).toISOString(), read: false },
    { id: 'n-3', title: 'You Confirmed!', message: 'You have confirmed your attendance for The Downtown Pub.', timestamp: new Date(Date.now() - 172800000).toISOString(), read: true },
    { id: 'n-4', title: 'New Spot Added', message: 'Admin Bro created a new spot: The Downtown Pub.', timestamp: new Date(Date.now() - 259200000).toISOString(), read: true },
];

// Mock notifications to be pushed in "real-time"
const MOCK_REALTIME_NOTIFICATIONS: Partial<Notification>[] = [
    { title: 'New Drink Suggestion', message: 'Chad suggested "Whiskey Sour". Vote now!' },
    { title: 'Payment Reminder', message: 'Don\'t forget to pay for the upcoming spot.' },
    { title: 'New Invitation', message: 'Admin Bro invited Brenda to the spot.' },
    { title: 'Spot Feedback Added', message: 'Admin Bro left feedback for "The Old Cellar".' },
];

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  // Simulate receiving real-time notifications from a service like Supabase Realtime
  useEffect(() => {
    const interval = setInterval(() => {
      const randomNotification = MOCK_REALTIME_NOTIFICATIONS[Math.floor(Math.random() * MOCK_REALTIME_NOTIFICATIONS.length)];
      
      const newNotification: Notification = {
        id: `n-${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false,
        ...randomNotification
      } as Notification;

      // Add the new notification to the top of the list to simulate a real-time feed
      setNotifications(prev => [newNotification, ...prev]);
    }, 12000); // Push a new notification every 12 seconds

    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };
  
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
