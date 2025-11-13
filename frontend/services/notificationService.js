import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

let Notifications = null;
let Device = null;
let Constants = null;

try {
  Notifications = require('expo-notifications');
  Device = require('expo-device');
  Constants = require('expo-constants');
  
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (error) {
  console.log('Expo notifications not available:', error.message);
}

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  async registerForPushNotifications() {
    if (!Notifications || !Device || !Constants) {
      console.log('Notifications not available in this environment');
      return null;
    }

    let token;

    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          Alert.alert('Permission Required', 'Push notifications permission is required for this feature.');
          return null;
        }
        
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
          console.warn('Project ID not found, using fallback');
          token = `mock-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        } else {
          token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        }
        
        this.expoPushToken = token;
        await this.registerTokenWithBackend(token);
        
      } else {
        console.log('Must use physical device for Push Notifications');
        return null;
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }

    return token;
  }

  async registerTokenWithBackend(token) {
    try {
      const platform = Platform.OS;
      await api.post('/register-token/', {
        token,
        platform
      });
      
      // Store token locally
      await AsyncStorage.setItem('pushToken', token);
    } catch (error) {
      console.error('Error registering token with backend:', error);
    }
  }

  async unregisterToken() {
    try {
      const token = await AsyncStorage.getItem('pushToken');
      if (token) {
        await api.post('/unregister-token/', { token });
        await AsyncStorage.removeItem('pushToken');
      }
    } catch (error) {
      console.error('Error unregistering token:', error);
    }
  }

  setupNotificationListeners(navigation) {
    if (!Notifications) {
      console.log('Notifications not available for listeners');
      return;
    }

    try {
      this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
      });

      this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification response:', response);
        
        const data = response.notification.request.content.data;
        
        if (data.type === 'message' && navigation) {
          navigation.navigate('screens/chat/[roomId]', { roomId: data.room_id });
        } else if (data.type === 'favorite' && navigation) {
          navigation.navigate('screens/notifications');
        }
      });
    } catch (error) {
      console.error('Error setting up notification listeners:', error);
    }
  }

  removeNotificationListeners() {
    if (!Notifications) return;
    
    try {
      if (this.notificationListener) {
        Notifications.removeNotificationSubscription(this.notificationListener);
      }
      if (this.responseListener) {
        Notifications.removeNotificationSubscription(this.responseListener);
      }
    } catch (error) {
      console.error('Error removing notification listeners:', error);
    }
  }

  async getNotifications(page = 1) {
    try {
      const response = await api.get(`/notifications/?page=${page}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      await api.post(`/notifications/${notificationId}/read/`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllNotificationsAsRead() {
    try {
      await api.post('/notifications/mark-all-read/');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count/');
      return response.data.unread_count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  async sendCustomNotification(userId, title, body, data = {}) {
    try {
      await api.post('/send-notification/', {
        user_id: userId,
        title,
        body,
        data
      });
    } catch (error) {
      console.error('Error sending custom notification:', error);
      throw error;
    }
  }

  async scheduleLocalNotification(title, body, data = {}) {
    if (!Notifications) {
      console.log('Local notifications not available');
      return;
    }
    
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title, body, data },
        trigger: { seconds: 1 },
      });
    } catch (error) {
      console.error('Error scheduling local notification:', error);
    }
  }
}

export const notificationService = new NotificationService();