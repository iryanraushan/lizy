import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (isAuthenticated && user) {
      initializeNotifications();
    }

    return () => {
      notificationService.removeNotificationListeners();
    };
  }, [isAuthenticated, user]);

  const initializeNotifications = async () => {
    try {
      await notificationService.registerForPushNotifications();
      
      notificationService.setupNotificationListeners(navigation);
      
      await fetchUnreadCount();
      
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(page);
      
      if (page === 1) {
        setNotifications(response.results);
      } else {
        setNotifications(prev => [...prev, ...response.results]);
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      
      setUnreadCount(0);
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  };

  const sendCustomNotification = async (userId, title, body, data = {}) => {
    try {
      await notificationService.sendCustomNotification(userId, title, body, data);
    } catch (error) {
      console.error('Error sending custom notification:', error);
      throw error;
    }
  };

  const value = {
    unreadCount,
    notifications,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    sendCustomNotification,
    initializeNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};