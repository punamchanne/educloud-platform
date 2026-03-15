import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const profileRes = await api.get('/auth/profile');
      setUser(profileRes.data.user);

      // Fetch notifications
      try {
        const notifRes = await api.get('/notifications');
        setNotifications(notifRes.data.notifications || []);
        setUnreadCount(notifRes.data.unreadCount || 0);
      } catch (notifError) {
        console.error('Failed to fetch notifications:', notifError);
        // Don't fail the entire fetch if notifications fail
      }

    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // If token is invalid, remove it
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (token, userData = null) => {
    localStorage.setItem('token', token);
    if (userData) {
      setUser(userData);
    } else {
      await fetchUserData();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`, {});
      setNotifications(prev => prev.map(notif =>
        notif._id === notificationId ? { ...notif, read: true } : notif
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const value = {
    user,
    loading,
    notifications,
    unreadCount,
    login,
    logout,
    updateUser,
    fetchUserData,
    markNotificationAsRead,
    addNotification,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
