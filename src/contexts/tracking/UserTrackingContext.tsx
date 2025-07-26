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
    cardsStudied: number;
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
    cardsStudied?: number;
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
    cardsStudied: number;
    correctAnswers: number;
    sessionStartTime: number;
    totalCards?: number;
    isTopicCompleted?: boolean;
}

interface TrackingData {
    pageLoadTime: number;
    totalTimeOnPage: number;
    activeTime: number;
    idleTime: number;
    tabSwitches: number;
    lastActivityTime: number;
    exportTime: string;
    engagementScore: number;
    clicksPerMinute: number;
    mouseMovements: number;
    clicks: number;
    scrollEvents: number;
    keyboardEvents: number;
    url: string;
    userAgent: string;
    screenResolution: string;
    viewport: string;
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
    endStudySession: (cardsStudied: number, accuracy: number) => void;
    pauseStudySession: () => void;
    getStudyMetrics: () => StudyMetrics;
    sendLearningTrackingData: () => Promise<LearningTrackingResponse>;
    // New method for saving learning progress
    handleSaveTrackingProgressLearning: (params: SaveTrackingProgressParams) => Promise<void>;
}

interface UserTrackingProviderProps {
    children: React.ReactNode;
    options?: UseUserTrackingOptions;
    autoStartTracking?: boolean;
    enableAutoSend?: boolean;
    minSessionTime?: number;
    apiEndpoint?: string;
}

const UserTrackingContext = createContext<UserTrackingContextType | undefined>(undefined);

export function UserTrackingProvider({
    children,
    options = {},
    autoStartTracking = false,
    enableAutoSend = true,
    minSessionTime = 1000,
    apiEndpoint = '/tracking/active-learning',
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
        sendLearningTrackingData: sendLearningTrackingDataFromHook,
    } = useUserTracking(options);
    const activityRef = useRef(activity);
    const isTrackingRef = useRef(isTracking);
    const hasDataBeenSent = useRef(false);
    const [engagementScore, setEngagementScore] = useState(0);
    const [clicksPerMinute, setClicksPerMinute] = useState(0);
    const [mouseDistance, setMouseDistance] = useState(0);

    // Update refs whenever activity or isTracking changes
    useEffect(() => {
        activityRef.current = activity;
        isTrackingRef.current = isTracking;
    }, [activity, isTracking]);

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

    const postRequestTracking = async (data: TrackingData): Promise<void> => {
        try {
            await postRequest(apiEndpoint, data);
        } catch (error) {
            throw error;
        }
    };

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

        const data: TrackingData = {
            pageLoadTime: latestActivity.pageLoadTime,
            totalTimeOnPage: latestActivity.totalTimeOnPage,
            activeTime: latestActivity.activeTime,
            idleTime: latestActivity.idleTime,
            tabSwitches: latestActivity.tabSwitches,
            lastActivityTime: Date.now(),
            exportTime: new Date().toISOString(),
            engagementScore: finalEngagementScore,
            clicksPerMinute: finalClicksPerMinute,
            mouseMovements: latestActivity.mouseMovements.length,
            clicks: latestActivity.clicks.length,
            scrollEvents: latestActivity.scrollEvents.length,
            keyboardEvents: latestActivity.keyboardEvents.length,
            url: window.location.href,
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
        };

        await postRequestTracking(data);
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
            await postRequest('/progress/learning-tracking', sessionData);
        } catch (error) {
            throw error;
        }
    };

    // Handle save tracking progress learning - reusable method
    const handleSaveTrackingProgressLearning = async (params: {
        topicId: string;
        cardsStudied: number;
        correctAnswers: number;
        sessionStartTime: number;
        totalCards?: number;
        isTopicCompleted?: boolean; // Add explicit completion flag
    }) => {
        try {
            const { topicId, cardsStudied, correctAnswers, sessionStartTime, totalCards = 0, isTopicCompleted = false } = params;
            
            const timeSpent = Date.now() - sessionStartTime;
            const accuracy = cardsStudied > 0 ? (correctAnswers / cardsStudied) * 100 : 0;
            
            // Ensure minimum time if cards were studied (simulate realistic study time)
            const minTimePerCard = 10000; // 10 seconds per card minimum
            const simulatedTime = cardsStudied > 0 ? 
                Math.max(timeSpent, cardsStudied * minTimePerCard) : timeSpent;

            const response = await postRequest('/progress/learning-tracking', {
                topicId: topicId,
                contentType: 'flashcard',
                timeSpent: simulatedTime, // in milliseconds
                isCompleted: isTopicCompleted, // Use explicit completion flag instead of cardsStudied > 0
                cardsStudied: cardsStudied,
                accuracy: accuracy,
                sessionData: {
                    startTime: sessionStartTime,
                    endTime: Date.now(),
                    totalCards: totalCards,
                    actualTimeSpent: timeSpent,
                    simulatedTimeSpent: simulatedTime,
                    isTopicCompleted: isTopicCompleted
                }
            });
            
            
            // Optional: Trigger a data refresh on the progress page
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('progressUpdated'));
            }
        } catch (error) {
            throw error;
        }
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

        // Add multiple event listeners for different unload scenarios
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            sendFinalData();
        };

        const handlePageHide = (event: PageTransitionEvent) => {
            sendFinalData();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                sendFinalData();
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
        sendLearningTrackingData: sendLearningTrackingDataFromHook as () => Promise<LearningTrackingResponse>,
        handleSaveTrackingProgressLearning,
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
