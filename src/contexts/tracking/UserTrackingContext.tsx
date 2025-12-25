'use client';

import { postRequest } from '@/api/api';
import { UserActivity, useUserTracking, UseUserTrackingOptions } from '@/hooks/useUserTracking';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

// Type definitions for learning tracking
interface StudySession {
    id: string;
    topicId: string;
    startTime: number;
    endTime?: number;
    duration: number;
    itemsStudied: number;
    accuracy: number;
    status: 'active' | 'completed' | 'paused';
}

interface StudyMetrics {
    totalStudyHours: number;
    completedTopics: number;
    currentSession: {
        topic: string | undefined;
        startTime: number;
        duration: number;
    } | null;
    recentSessions: StudySession[];
    todayStudyTime: number;
}

interface LearningTrackingData {
    topicId: string;
    contentType: string;
    timeSpent: number;
    isCompleted: boolean;
    itemsStudied?: number;
    accuracy?: number;
    sessionData?: Record<string, any>;
}

interface LearningTrackingResponse {
    message?: string;
    success?: boolean;
    timeSpentMinutes?: number;
    isCompleted?: boolean;
}

interface SaveTrackingProgressParams {
    topicId: string;
    itemsStudied: number;
    correctAnswers: number;
    sessionStartTime: number;
    totalItems?: number;
    isTopicCompleted?: boolean;
    forceSync?: boolean; // Allow bypassing validation for explicit saves
}

interface TrackingData {
    // Core time tracking only
    totalTimeOnPage: number;
    activeTime: number;
    idleTime: number;
    lastActivityTime: number;
    exportTime: string;
    url: string;
    // All other fields are optional/unused
    tabSwitches?: number;
    engagementScore?: number;
    clicks?: number;
    scrollEvents?: number;
    keyboardEvents?: number;
    pageLoadTime?: number;
    clicksPerMinute?: number;
    mouseMovements?: number;
    userAgent?: string;
    screenResolution?: string;
    viewport?: string;
}

interface UserTrackingContextType {
    activity: UserActivity;
    isTracking: boolean;
    startTracking: () => void;
    stopTracking: () => void;
    clearData: () => void;
    exportData: () => void;
    sendTrackingData: () => Promise<void>;
    engagementScore: number;
    clicksPerMinute: number;
    mouseDistance: number;
    // Learning tracking methods
    startStudySession: (topicId: string, topicName?: string) => void;
    endStudySession: (itemsStudied: number, accuracy: number) => void;
    pauseStudySession: () => void;
    getStudyMetrics: () => StudyMetrics;
    sendLearningTrackingData: (sessionData: {
        topicId: string;
        contentType: string;
        timeSpent: number;
        isCompleted: boolean;
        itemsStudied?: number;
        accuracy?: number;
    }) => Promise<void>;
    // New method for saving learning progress
    handleSaveTrackingProgressLearning: (params: SaveTrackingProgressParams) => Promise<void>;
    // Learning session state
    itemsStudiedCount: number;
    correctAnswersCount: number;
    sessionStartTime: number;
    updateItemsStudied: (count: number) => void;
    updateCorrectAnswers: (count: number) => void;
    resetLearningSession: () => void;
    saveCurrentLearningSession: (topicId: string, totalItems: number, isCompleted?: boolean, forceSync?: boolean) => Promise<void>;
}

interface UserTrackingProviderProps {
    children: React.ReactNode;
    options?: UseUserTrackingOptions;
    autoStartTracking?: boolean;
    enableAutoSend?: boolean;
    minSessionTime?: number;
    apiEndpoint?: string; // For behavioral tracking
    learningApiEndpoint?: string; // For learning progress tracking
}

const UserTrackingContext = createContext<UserTrackingContextType | undefined>(undefined);

export function UserTrackingProvider({
    children,
    options = {},
    autoStartTracking = false,
    enableAutoSend = true,
    minSessionTime = 1000,
    learningApiEndpoint = '/progress/learning-tracking',
}: UserTrackingProviderProps) {
    const {
        activity,
        isTracking,
        startTracking,
        stopTracking,
        clearData,
        exportData,
        startStudySession,
        endStudySession,
        pauseStudySession,
        getStudyMetrics,
    } = useUserTracking(options);
    const activityRef = useRef(activity);
    const isTrackingRef = useRef(isTracking);
    const hasDataBeenSent = useRef(false);
    const [engagementScore, setEngagementScore] = useState(0);
    const [clicksPerMinute, setClicksPerMinute] = useState(0);
    const [mouseDistance, setMouseDistance] = useState(0);

    // Learning session state
    const [itemsStudiedCount, setItemsStudiedCount] = useState(0);
    const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
    const [sessionStartTime, setSessionStartTime] = useState(Date.now());

    // Refs for cleanup access
    const itemsStudiedRef = useRef(0);
    const correctAnswersRef = useRef(0);
    const sessionStartTimeRef = useRef(Date.now());

    // Update refs whenever activity or isTracking changes
    useEffect(() => {
        activityRef.current = activity;
        isTrackingRef.current = isTracking;
    }, [activity, isTracking]);

    // Update learning session refs
    useEffect(() => {
        itemsStudiedRef.current = itemsStudiedCount;
        correctAnswersRef.current = correctAnswersCount;
        sessionStartTimeRef.current = sessionStartTime;
    }, [itemsStudiedCount, correctAnswersCount, sessionStartTime]);

    // Learning session methods
    const updateItemsStudied = (count: number) => {
        setItemsStudiedCount(count);
    };

    const updateCorrectAnswers = (count: number) => {
        setCorrectAnswersCount(count);
    };

    const resetLearningSession = () => {
        const newStartTime = Date.now();
        setItemsStudiedCount(0);
        setCorrectAnswersCount(0);
        setSessionStartTime(newStartTime);
    };

    // Calculate derived metrics
    useEffect(() => {
        const newEngagementScore = Math.min(
            100,
            Math.round((activity.activeTime / Math.max(activity.totalTimeOnPage, 1)) * 100),
        );

        const newClicksPerMinute =
            activity.totalTimeOnPage > 0 ? activity.clicks.length / (activity.totalTimeOnPage / 60000) || 0 : 0;

        const newMouseDistance = activity.mouseMovements.reduce((total, movement, index) => {
            if (index === 0) return 0;
            const prev = activity.mouseMovements[index - 1];
            return total + Math.sqrt(Math.pow(movement.x - prev.x, 2) + Math.pow(movement.y - prev.y, 2));
        }, 0);

        setEngagementScore(newEngagementScore);
        setClicksPerMinute(newClicksPerMinute);
        setMouseDistance(newMouseDistance);
    }, [activity]);


    const sendTrackingData = async (): Promise<void> => {
        const latestActivity = activityRef.current;
        const wasTracking = isTrackingRef.current;

        if (!wasTracking || latestActivity.totalTimeOnPage <= minSessionTime) {
            return;
        }

        const finalEngagementScore = Math.min(
            100,
            Math.round((latestActivity.activeTime / Math.max(latestActivity.totalTimeOnPage, 1)) * 100),
        );

        const finalClicksPerMinute =
            latestActivity.totalTimeOnPage > 0
                ? latestActivity.clicks.length / (latestActivity.totalTimeOnPage / 60000) || 0
                : 0;

        // Send only core time tracking data for learning analytics
        const data = {
            totalTimeOnPage: latestActivity.totalTimeOnPage,
            activeTime: latestActivity.activeTime,
            idleTime: latestActivity.idleTime,
            lastActivityTime: Date.now(),
            exportTime: new Date().toISOString(),
            url: window.location.href, // Keep URL for page identification
        };

    };

    // Send learning tracking data to progress API
    const sendLearningTrackingData = async (sessionData: {
        topicId: string;
        contentType: string;
        timeSpent: number;
        isCompleted: boolean;
        cardsStudied?: number;
        accuracy?: number;
    }) => {
        try {
            await postRequest(learningApiEndpoint, sessionData);
        } catch (error) {
            throw error;
        }
    };

    // Handle save tracking progress learning - reusable method with validation
    const handleSaveTrackingProgressLearning = async (params: {
        topicId: string;
        itemsStudied: number;
        correctAnswers: number;
        sessionStartTime: number;
        totalItems?: number;
        isTopicCompleted?: boolean;
        forceSync?: boolean; // Allow bypassing validation for explicit saves
    }) => {
        try {
            const {
                topicId,
                itemsStudied,
                correctAnswers,
                sessionStartTime,
                totalItems = 0,
                isTopicCompleted = false,
                forceSync = false,
            } = params;

            // Apply same validation logic as sendTrackingData
            const latestActivity = activityRef.current;
            const wasTracking = isTrackingRef.current;
            const timeSpent = Date.now() - sessionStartTime;

            // Skip API call if conditions not met (unless forced)
            if (!forceSync) {
                if (!wasTracking || timeSpent <= minSessionTime) {
                    return;
                }

                // Only skip if BOTH no items studied AND no explicit completion AND very short session
                // This allows progress updates for study time even without items completed
                if (itemsStudied === 0 && !isTopicCompleted && timeSpent < (minSessionTime * 2)) {
                    return;
                }
            }

            const accuracy = itemsStudied > 0 ? (correctAnswers / itemsStudied) * 100 : 0;

            // Ensure minimum time if items were studied (simulate realistic study time)
            const minTimePerItem = 10000; // 10 seconds per item minimum
            const simulatedTime = itemsStudied > 0 ? Math.max(timeSpent, itemsStudied * minTimePerItem) : timeSpent;


            const response = await postRequest(learningApiEndpoint, {
                topicId: topicId,
                contentType: 'flashcard',
                timeSpent: simulatedTime, // in milliseconds
                isCompleted: isTopicCompleted,
                itemsStudied: itemsStudied,
                accuracy: accuracy,
                sessionData: {
                    startTime: sessionStartTime,
                    endTime: Date.now(),
                    totalItems: totalItems,
                    actualTimeSpent: timeSpent,
                    simulatedTimeSpent: simulatedTime,
                    isTopicCompleted: isTopicCompleted,
                },
            });

           

            // Optional: Trigger a data refresh on the progress page
            if (typeof window !== 'undefined') {
                // Add a small delay to ensure event handlers are ready
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('progressUpdated'));
                }, 100);
            }
        } catch (error) {
            throw error;
        }
    };

    // Save current learning session using refs (for cleanup/unmount)
    const saveCurrentLearningSession = async (topicId: string, totalItems: number, isCompleted: boolean = false, forceSync: boolean = false) => {
        // Check if there was meaningful session activity
        const currentItems = itemsStudiedRef.current;
        const sessionTime = Date.now() - sessionStartTimeRef.current;
        
        // Skip API call ONLY if no activity at all (just opened and immediately closed)
        if (!isCompleted && !forceSync && currentItems === 0 && sessionTime < minSessionTime) {
            return;
        }
   
        return handleSaveTrackingProgressLearning({
            topicId,
            itemsStudied: itemsStudiedRef.current,
            correctAnswers: correctAnswersRef.current,
            sessionStartTime: sessionStartTimeRef.current,
            totalItems,
            isTopicCompleted: isCompleted,
            forceSync,
        });
    };

    // Function to send final tracking data (with duplicate prevention)
    const sendFinalData = async () => {
        if (hasDataBeenSent.current) {
            return;
        }

        const latestActivity = activityRef.current;
        const wasTracking = isTrackingRef.current;

        if (!wasTracking || latestActivity.totalTimeOnPage <= minSessionTime) {
            return;
        }

        // Mark as sent to prevent duplicates
        hasDataBeenSent.current = true;

        try {
            await sendTrackingData();
        } catch (error) {
            // Reset the flag if sending failed, so it can be retried
            hasDataBeenSent.current = false;
        }
    };

    useEffect(() => {
        if (autoStartTracking) {
            startTracking();
        }

        if (!enableAutoSend) {
            return;
        }

        // Only send API when actually leaving the page (unmounting)
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            sendFinalData();
        };

        const handlePageHide = (event: PageTransitionEvent) => {
            sendFinalData();
        };

        // For visibility change, don't send API - just let the tracking system handle pausing active time
        const handleVisibilityChange = () => {
            // No API call here - the underlying useUserTracking hook should handle
            // pausing/resuming active time calculation when page visibility changes
            // This prevents sending API when user just switches tabs or minimizes window
            if (document.visibilityState === 'hidden') {
                sendFinalData(); 
            }
        };

        // Add event listeners
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('pagehide', handlePageHide);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            // Remove event listeners
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('pagehide', handlePageHide);
            document.removeEventListener('visibilitychange', handleVisibilityChange);

            // Send final data only if not already sent
            if (enableAutoSend) {
                sendFinalData();
            }
        };
    }, [autoStartTracking, enableAutoSend, minSessionTime]);

    const contextValue: UserTrackingContextType = {
        activity,
        isTracking,
        startTracking,
        stopTracking,
        clearData,
        exportData,
        sendTrackingData,
        engagementScore,
        clicksPerMinute,
        mouseDistance,
        // Learning tracking methods
        startStudySession,
        endStudySession,
        pauseStudySession,
        getStudyMetrics,
        sendLearningTrackingData,
        handleSaveTrackingProgressLearning,
        // Learning session state
        itemsStudiedCount,
        correctAnswersCount,
        sessionStartTime,
        updateItemsStudied,
        updateCorrectAnswers,
        resetLearningSession,
        saveCurrentLearningSession,
    };

    return <UserTrackingContext.Provider value={contextValue}>{children}</UserTrackingContext.Provider>;
}

export function useUserTrackingContext(): UserTrackingContextType {
    const context = useContext(UserTrackingContext);
    if (!context) {
        throw new Error('useUserTrackingContext must be used within a UserTrackingProvider');
    }
    return context;
}

// Hook for manual tracking control
export function useManualTracking() {
    const { sendTrackingData, startTracking, stopTracking, clearData } = useUserTrackingContext();

    return {
        sendTrackingData,
        startTracking,
        stopTracking,
        clearData,
    };
}

// Hook for tracking metrics only
export function useTrackingMetrics() {
    const { activity, engagementScore, clicksPerMinute, mouseDistance, isTracking } = useUserTrackingContext();

    return {
        activity,
        engagementScore,
        clicksPerMinute,
        mouseDistance,
        isTracking,
    };
}

export default UserTrackingContext;
