'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket, io } from 'socket.io-client';
import { useAuthStorage } from '@/app/[locale]/auth/hooks/useAuthStorage';

export interface QuizActivityEventData {
  classQuizId: number;
  userId: number;
  attemptId?: number;
  questionIndex?: number;
  answerIndex?: number | null;
  isCorrect?: boolean | null;
  score?: number;
  activityType?: 'focus' | 'blur' | 'time-update' | 'question-change';
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

export interface UseQuizActivityWebSocketOptions {
  enabled?: boolean;
  classQuizId?: number;
  attemptId?: number;
  onActivityUpdate?: (eventType: string, data: QuizActivityEventData) => void;
  onStudentJoined?: (data: { classQuizId: number; userId: number; socketId: string }) => void;
  onStudentLeft?: (data: { classQuizId: number; userId: number; socketId: string }) => void;
  autoReconnect?: boolean;
  reconnectDelay?: number;
}

/**
 * Hook for managing quiz activity WebSocket connections
 * Supports both student (emit events) and teacher (listen events) modes
 */
export function useQuizActivityWebSocket(options: UseQuizActivityWebSocketOptions = {}) {
  const {
    enabled = true,
    classQuizId,
    attemptId,
    onActivityUpdate,
    onStudentJoined,
    onStudentLeft,
    autoReconnect = true,
    reconnectDelay = 3000,
  } = options;

  const { user, isAuthenticated } = useAuthStorage();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Use refs for callbacks to avoid re-creating connection
  const onActivityUpdateRef = useRef(onActivityUpdate);
  const onStudentJoinedRef = useRef(onStudentJoined);
  const onStudentLeftRef = useRef(onStudentLeft);

  useEffect(() => {
    onActivityUpdateRef.current = onActivityUpdate;
    onStudentJoinedRef.current = onStudentJoined;
    onStudentLeftRef.current = onStudentLeft;
  }, [onActivityUpdate, onStudentJoined, onStudentLeft]);

  // Get API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
  const userId = user?.userId ? Number(user.userId) : null;

  useEffect(() => {
    // Don't connect if disabled, not authenticated, or no classQuizId
    if (!enabled || !isAuthenticated || !userId || !classQuizId) {
      return;
    }

    // Cleanup existing connection
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[QuizActivityWebSocket] Initializing connection:', { apiUrl, userId, classQuizId });
    }

    // Create socket connection
    const socket = io(apiUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: autoReconnect,
      reconnectionDelay: reconnectDelay,
      reconnectionAttempts: maxReconnectAttempts,
      auth: {
        userId: userId.toString(),
      },
    });

    // Connection events
    socket.on('connect', () => {
      console.log('[QuizActivityWebSocket] Connected:', socket.id);
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;

      // Join quiz room
      if (classQuizId) {
        socket.emit('join-quiz-room', { 
          classQuizId, 
          userId,
        });
      }
    });

    // Listen for room join confirmation
    socket.on('quiz-room-joined', (data: { classQuizId: number; userId: number }) => {
      console.log('[QuizActivityWebSocket] Joined quiz room:', data);
      setIsInRoom(true);
    });

    // Listen for student join/leave events (for teacher monitoring)
    socket.on('student-joined', (data: { classQuizId: number; userId: number; socketId: string }) => {
      console.log('[QuizActivityWebSocket] Student joined:', data);
      if (onStudentJoinedRef.current) {
        onStudentJoinedRef.current(data);
      }
    });

    socket.on('student-left', (data: { classQuizId: number; userId: number; socketId: string }) => {
      console.log('[QuizActivityWebSocket] Student left:', data);
      if (onStudentLeftRef.current) {
        onStudentLeftRef.current(data);
      }
    });

    // Listen for quiz activity events
    socket.on('quiz-attempt-started', (data: QuizActivityEventData) => {
      console.log('[QuizActivityWebSocket] Quiz attempt started:', data);
      if (onActivityUpdateRef.current) {
        onActivityUpdateRef.current('quiz-attempt-started', data);
      }
    });

    socket.on('quiz-answer-saved', (data: QuizActivityEventData) => {
      console.log('[QuizActivityWebSocket] Answer saved:', data);
      if (onActivityUpdateRef.current) {
        onActivityUpdateRef.current('quiz-answer-saved', data);
      }
    });

    socket.on('quiz-attempt-submitted', (data: QuizActivityEventData) => {
      console.log('[QuizActivityWebSocket] Quiz submitted:', data);
      if (onActivityUpdateRef.current) {
        onActivityUpdateRef.current('quiz-attempt-submitted', data);
      }
    });

    socket.on('quiz-activity', (data: QuizActivityEventData) => {
      console.log('[QuizActivityWebSocket] Quiz activity:', data);
      if (onActivityUpdateRef.current) {
        onActivityUpdateRef.current('quiz-activity', data);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('[QuizActivityWebSocket] Disconnected:', reason);
      setIsConnected(false);
      setIsInRoom(false);
    });

    socket.on('connect_error', (error: Error) => {
      console.error('[QuizActivityWebSocket] Connection error:', error);
      setIsConnected(false);
      setIsInRoom(false);

      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        console.error('[QuizActivityWebSocket] Max reconnection attempts reached');
      } else {
        reconnectAttemptsRef.current++;
      }
    });

    socketRef.current = socket;

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        // Leave room before disconnecting
        if (classQuizId && isInRoom) {
          socketRef.current.emit('leave-quiz-room', { classQuizId });
        }
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      setIsInRoom(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, isAuthenticated, userId, classQuizId, attemptId, autoReconnect, reconnectDelay]);

  // Emit quiz activity events (for student side)
  const emitQuizActivity = useCallback((
    eventType: 'quiz-attempt-started' | 'quiz-answer-saved' | 'quiz-attempt-submitted' | 'quiz-activity',
    data: Partial<QuizActivityEventData>
  ) => {
    if (!socketRef.current?.connected || !classQuizId || !userId) {
      console.warn('[QuizActivityWebSocket] Cannot emit: not connected or missing data');
      return;
    }

    // Use attemptId from data first, then from hook option, then from current attempt
    const currentAttemptId = data.attemptId || attemptId;

    const payload: any = {
      classQuizId,
      userId,
      ...data,
    };

    // Include attemptId if available (required for most events)
    if (currentAttemptId !== undefined) {
      payload.attemptId = currentAttemptId;
    }

    console.log(`[QuizActivityWebSocket] Emitting ${eventType}:`, payload);
    socketRef.current.emit(eventType, payload);
  }, [classQuizId, userId, attemptId]);

  // Helper functions for common events
  const emitAttemptStarted = useCallback((attemptId: number) => {
    emitQuizActivity('quiz-attempt-started', { attemptId });
  }, [emitQuizActivity]);

  const emitAnswerSaved = useCallback((questionIndex: number, answerIndex: number | null) => {
    emitQuizActivity('quiz-answer-saved', { 
      questionIndex, 
      answerIndex,
    });
  }, [emitQuizActivity]);

  const emitAttemptSubmitted = useCallback((score?: number) => {
    emitQuizActivity('quiz-attempt-submitted', { score });
  }, [emitQuizActivity]);

  const emitActivity = useCallback((
    activityType: 'focus' | 'blur' | 'time-update' | 'question-change',
    metadata?: Record<string, unknown>
  ) => {
    emitQuizActivity('quiz-activity', { activityType, metadata });
  }, [emitQuizActivity]);

  // Join/leave room manually
  const joinRoom = useCallback((quizId: number) => {
    if (!socketRef.current?.connected || !userId) {
      console.warn('[QuizActivityWebSocket] Cannot join room: not connected');
      return;
    }
    socketRef.current.emit('join-quiz-room', { classQuizId: quizId, userId });
  }, [userId]);

  const leaveRoom = useCallback((quizId: number) => {
    if (!socketRef.current?.connected) {
      return;
    }
    socketRef.current.emit('leave-quiz-room', { classQuizId: quizId });
    setIsInRoom(false);
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    isInRoom,
    // Emit functions (for student side)
    emitAttemptStarted,
    emitAnswerSaved,
    emitAttemptSubmitted,
    emitActivity,
    emitQuizActivity,
    // Room management
    joinRoom,
    leaveRoom,
    // Manual disconnect/connect
    disconnect: () => {
      if (socketRef.current) {
        if (classQuizId) {
          socketRef.current.emit('leave-quiz-room', { classQuizId });
        }
        socketRef.current.disconnect();
      }
    },
    connect: () => {
      if (socketRef.current && !socketRef.current.connected) {
        socketRef.current.connect();
      }
    },
  };
}

