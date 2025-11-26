'use client';

import { useEffect, useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { useAuthStorage } from '@/app/[locale]/auth/hooks/useAuthStorage';
import { toast } from '@/hooks/use-toast';
import { NotificationSettings } from '@/types/profile';

interface NotificationData {
  id: string;
  type: 'achievement' | 'reminder' | 'progress' | 'system';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: Date | string;
  read: boolean;
}

interface UseWebSocketOptions {
  enabled?: boolean;
  onNotification?: (data: NotificationData) => void;
  autoReconnect?: boolean;
  reconnectDelay?: number;
  notificationSettings?: NotificationSettings;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    enabled = true,
    onNotification,
    autoReconnect = true,
    reconnectDelay = 3000,
    notificationSettings,
  } = options;

  // Default settings if not provided
  const defaultSettings: NotificationSettings = {
    dailyReminders: true,
    weeklyReports: true,
    achievementNotifications: true,
    emailNotifications: true,
    pushNotifications: true,
  };

  const settings = notificationSettings || defaultSettings;
  
  // Use ref to always access latest settings in socket event handlers
  const settingsRef = useRef(settings);
  
  // Update ref when settings change
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Helper function to check if notification should be shown
  const shouldShowNotification = (type: NotificationData['type']): boolean => {
    const currentSettings = settingsRef.current;
    switch (type) {
      case 'achievement':
        return currentSettings.achievementNotifications;
      case 'reminder':
        return currentSettings.dailyReminders;
      case 'progress':
        return currentSettings.weeklyReports;
      case 'system':
        return currentSettings.pushNotifications || currentSettings.emailNotifications;
      default:
        return true;
    }
  };

  const { user, isAuthenticated } = useAuthStorage();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const currentUserIdRef = useRef<string | null>(null); // Track current connected userId
  
  // Use ref for callback to avoid re-creating connection on every callback change
  const onNotificationRef = useRef(onNotification);
  
  // Update ref when callback changes
  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    // Get userId once to avoid checking user object repeatedly
    const userId = user?.userId ? String(user.userId) : null;
    
    // Debug logging (only log when actual values change)
    if (process.env.NODE_ENV === 'development') {
      console.log('[WebSocket] Hook triggered:', {
        enabled,
        isAuthenticated,
        hasUser: !!user,
        userId,
      });
    }

    // Only connect if enabled, user is authenticated, and userId exists
    if (!enabled || !isAuthenticated || !userId) {
      // Only disconnect if we have an active connection
      if (socketRef.current?.connected) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[WebSocket] Conditions not met, disconnecting:', {
            enabled,
            isAuthenticated,
            hasUserId: !!userId,
          });
        }
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Prevent reconnection if already connected with same userId
    if (socketRef.current?.connected && currentUserIdRef.current === userId) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[WebSocket] Already connected with same userId, skipping reconnection');
      }
      return;
    }

    // Disconnect existing connection if userId changed
    if (socketRef.current) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[WebSocket] Disconnecting existing connection before new connection');
      }
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

    if (process.env.NODE_ENV === 'development') {
      console.log('[WebSocket] Initializing connection:', { apiUrl, userId });
    }

    // Create socket connection
    const socket = io(apiUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: autoReconnect,
      reconnectionDelay: reconnectDelay,
      reconnectionAttempts: maxReconnectAttempts,
      // Pass userId in handshake to track it
      auth: {
        userId: userId,
      },
    });

    // Connection events
    socket.on('connect', () => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      currentUserIdRef.current = userId; // Track connected userId

      // Register user for notifications after connection
      socket.emit('register-user', userId);
    });

    // Listen for registration confirmation from server
    socket.on('user-registered', (data: { userId: string; socketId: string }) => {
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      currentUserIdRef.current = null; // Clear userId on disconnect
      // Auto reconnect if not manually disconnected
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          setTimeout(() => {
            socket.connect();
          }, reconnectDelay);
        }
      }
    });

    socket.on('connect_error', (error: Error) => {
      console.error('[WebSocket] Connection error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      setIsConnected(false);

      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        console.error('[WebSocket] Max reconnection attempts reached');
        toast({
          title: 'Connection Error',
          description: `Unable to connect to notification service: ${error.message}. Please refresh the page.`,
          variant: 'destructive',
        });
      } else {
        reconnectAttemptsRef.current++;
        console.log(`[WebSocket] Retrying connection (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
      }
    });

    // Notification events
    socket.on('notification', (data: NotificationData) => {

      // Check if notification should be shown based on user settings
      if (shouldShowNotification(data.type)) {
        // Show toast notification
        toast({
          title: data.title,
          description: data.message,
          variant: data.type === 'system' ? 'default' : 'default',
        });
      }

      // Always call custom handler if provided (use ref to avoid stale closure)
      // This allows components to handle notifications even if toast is disabled
      if (onNotificationRef.current) {
        onNotificationRef.current(data);
      }
    });

    socketRef.current = socket;

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      currentUserIdRef.current = null;
    };
    // Only depend on values that should trigger reconnection, not callbacks
    // Note: notificationSettings changes don't require reconnection, only affect toast display
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, isAuthenticated, user?.userId, autoReconnect, reconnectDelay]);

  // Re-register user if userId changes
  useEffect(() => {
    if (socketRef.current?.connected && user?.userId) {
      socketRef.current.emit('register-user', user.userId.toString());
    }
  }, [user?.userId]);

  return {
    socket: socketRef.current,
    isConnected,
    disconnect: () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    },
    connect: () => {
      if (socketRef.current) {
        socketRef.current.connect();
      }
    },
  };
}

