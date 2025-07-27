import { useState, useRef, useCallback, useEffect } from 'react';

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

interface MousePosition {
    x: number;
    y: number;
    timestamp: number;
}

interface ClickEvent {
    x: number;
    y: number;
    timestamp: number;
    target: string;
    button: number;
}

interface ScrollEvent {
    scrollTop: number;
    scrollLeft: number;
    timestamp: number;
}

interface KeyboardActivity {
    key: string;
    timestamp: number;
    target: string;
}

export interface UserActivity {
    mouseMovements: MousePosition[];
    clicks: ClickEvent[];
    scrollEvents: ScrollEvent[];
    keyboardEvents: KeyboardActivity[];
    pageLoadTime: number;
    totalTimeOnPage: number;
    activeTime: number;
    idleTime: number;
    tabSwitches: number;
    isActive: boolean;
    lastActivityTime: number;
    // Learning tracking metrics
    studyHours: number; // Total study time in hours
    completedTopics: number; // Number of completed topics/flashcard sets
    studyStartTime?: number; // When current study session started
    currentTopic?: string; // Current topic being studied
    studySessions: StudySession[]; // History of study sessions
}

const IDLE_THRESHOLD = 30000; // 30 seconds of inactivity
const ACTIVITY_SAMPLE_RATE = 100; // Sample mouse movements every 100ms

export interface UseUserTrackingOptions {
    idleThreshold?: number; // milliseconds
    mouseSampleRate?: number; // milliseconds
    maxMouseMovements?: number;
    maxScrollEvents?: number;
    maxKeyboardEvents?: number;
    enableMouseTracking?: boolean;
    enableClickTracking?: boolean;
    enableScrollTracking?: boolean;
    enableKeyboardTracking?: boolean;
    enableTabTracking?: boolean;
    onActivityChange?: (isActive: boolean) => void;
    onDataUpdate?: (data: UserActivity) => void;
}

export function useUserTracking(options: UseUserTrackingOptions = {}) {
    const {
        idleThreshold = 30000, // 30 seconds
        mouseSampleRate = 100, // 100ms
        maxMouseMovements = 1000,
        maxScrollEvents = 100,
        maxKeyboardEvents = 100,
        enableMouseTracking = true,
        enableClickTracking = true,
        enableScrollTracking = true,
        enableKeyboardTracking = true,
        enableTabTracking = true,
        onActivityChange,
        onDataUpdate,
    } = options;

    const [activity, setActivity] = useState<UserActivity>({
        mouseMovements: [],
        clicks: [],
        scrollEvents: [],
        keyboardEvents: [],
        pageLoadTime: Date.now(),
        totalTimeOnPage: 0,
        activeTime: 0,
        idleTime: 0,
        tabSwitches: 0,
        isActive: true,
        lastActivityTime: Date.now(),
        // Learning tracking fields
        studyHours: 0,
        completedTopics: 0,
        studySessions: [],
    });

    const [isTracking, setIsTracking] = useState(false);
    const [currentMousePos, setCurrentMousePos] = useState({ x: 0, y: 0 });
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastMouseSampleRef = useRef(Date.now());
    const visibilityChangeCountRef = useRef(0);
    const activeTimeRef = useRef(0);
    const lastActiveTimeRef = useRef(Date.now());

    // Calculate real interactive time
    const updateActiveTime = useCallback(() => {
        const now = Date.now();
        if (activity.isActive && document.visibilityState === 'visible') {
            const timeDiff = now - lastActiveTimeRef.current;
            if (timeDiff < IDLE_THRESHOLD) {
                activeTimeRef.current += timeDiff;
            }
        }
        lastActiveTimeRef.current = now;
    }, [activity.isActive]);

    // Mouse movement tracking with sampling - simplified for learning tracking
    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            const now = Date.now();
            setCurrentMousePos({ x: e.clientX, y: e.clientY });

            // Sample mouse movements at specified rate
            if (now - lastMouseSampleRef.current >= ACTIVITY_SAMPLE_RATE) {
                setActivity((prev) => {
                    const newMovement: MousePosition = {
                        x: e.clientX,
                        y: e.clientY,
                        timestamp: now,
                    };

                    return {
                        ...prev,
                        mouseMovements: [...prev.mouseMovements.slice(-999), newMovement], // Keep last 1000 movements
                        lastActivityTime: now,
                        isActive: true,
                    };
                });
                lastMouseSampleRef.current = now;
            }

            updateActiveTime();
        },
        [updateActiveTime],
    );

    // Click tracking - simplified for learning tracking
    const handleClick = useCallback(
        (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const clickEvent: ClickEvent = {
                x: e.clientX,
                y: e.clientY,
                timestamp: Date.now(),
                target: target.tagName + (target.className ? `.${target.className.split(' ')[0]}` : ''),
                button: e.button,
            };

            setActivity((prev) => ({
                ...prev,
                clicks: [...prev.clicks, clickEvent],
                lastActivityTime: Date.now(),
                isActive: true,
            }));

            updateActiveTime();
        },
        [updateActiveTime],
    );

    // Scroll tracking - simplified for learning tracking
    const handleScroll = useCallback(() => {
        const scrollEvent: ScrollEvent = {
            scrollTop: window.scrollY,
            scrollLeft: window.scrollX,
            timestamp: Date.now(),
        };

        setActivity((prev) => ({
            ...prev,
            scrollEvents: [...prev.scrollEvents.slice(-99), scrollEvent], // Keep last 100 scroll events
            lastActivityTime: Date.now(),
            isActive: true,
        }));

        updateActiveTime();
    }, [updateActiveTime]);

    // Keyboard tracking - simplified for learning tracking
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            const target = e.target as unknown as HTMLElement;
            const keyEvent = {
                key: e.key,
                timestamp: Date.now(),
                target: target.tagName,
            };

            setActivity((prev) => ({
                ...prev,
                keyboardEvents: [...prev.keyboardEvents.slice(-99), keyEvent], // Keep last 100 key events
                lastActivityTime: Date.now(),
                isActive: true,
            }));

            updateActiveTime();
        },
        [updateActiveTime],
    );

    // Tab visibility tracking
    const handleVisibilityChange = useCallback(() => {
        const isVisible = document.visibilityState === 'visible';
        visibilityChangeCountRef.current += 1;

        if (!isVisible) {
            updateActiveTime();
        } else {
            lastActiveTimeRef.current = Date.now();
        }

        setActivity((prev) => ({
            ...prev,
            tabSwitches: visibilityChangeCountRef.current,
            isActive: isVisible,
        }));
    }, [updateActiveTime]);

    // Check for idle state
    const checkIdleState = useCallback(() => {
        const now = Date.now();
        const timeSinceLastActivity = now - activity.lastActivityTime;

        if (timeSinceLastActivity > IDLE_THRESHOLD && activity.isActive) {
            setActivity((prev) => ({
                ...prev,
                isActive: false,
            }));
        }

        // Update total time on page
        setActivity((prev) => ({
            ...prev,
            totalTimeOnPage: now - prev.pageLoadTime,
            activeTime: activeTimeRef.current,
            idleTime: Math.max(0, now - prev.pageLoadTime - activeTimeRef.current),
        }));
    }, [activity.lastActivityTime, activity.isActive]);

    // Set up event listeners and intervals
    useEffect(() => {
        if (!isTracking) return;

        // Add event listeners
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('click', handleClick);
        document.addEventListener('scroll', handleScroll);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Set up interval for checking idle state and updating stats
        intervalRef.current = setInterval(checkIdleState, 1000);

        return () => {
            // Cleanup
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('click', handleClick);
            document.removeEventListener('scroll', handleScroll);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('visibilitychange', handleVisibilityChange);

            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isTracking, handleMouseMove, handleClick, handleScroll, handleKeyDown, handleVisibilityChange, checkIdleState]);
    // Start tracking
    const startTracking = useCallback(() => {
        if (isTracking) return;

        setIsTracking(true);

        // Reset timing references
        lastActiveTimeRef.current = Date.now();

        // Add event listeners
        if (enableMouseTracking) {
            document.addEventListener('mousemove', handleMouseMove);
        }
        if (enableClickTracking) {
            document.addEventListener('click', handleClick);
        }
        if (enableScrollTracking) {
            document.addEventListener('scroll', handleScroll);
        }
        if (enableKeyboardTracking) {
            document.addEventListener('keydown', handleKeyDown);
        }
        if (enableTabTracking) {
            document.addEventListener('visibilitychange', handleVisibilityChange);
        }

        // Start interval for checking idle state
        intervalRef.current = setInterval(checkIdleState, 1000);
    }, [
        isTracking,
        enableMouseTracking,
        enableClickTracking,
        enableScrollTracking,
        enableKeyboardTracking,
        enableTabTracking,
        handleMouseMove,
        handleClick,
        handleScroll,
        handleKeyDown,
        handleVisibilityChange,
        checkIdleState,
    ]);

    // Stop tracking
    const stopTracking = useCallback(() => {
        if (!isTracking) return;

        setIsTracking(false);

        // Remove event listeners
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('click', handleClick);
        document.removeEventListener('scroll', handleScroll);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('visibilitychange', handleVisibilityChange);

        // Clear interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        // Final active time update
        updateActiveTime();
    }, [
        isTracking,
        handleMouseMove,
        handleClick,
        handleScroll,
        handleKeyDown,
        handleVisibilityChange,
        updateActiveTime,
    ]);

    // Clear all tracking data
    const clearData = useCallback(() => {
        activeTimeRef.current = 0;
        lastActiveTimeRef.current = Date.now();
        visibilityChangeCountRef.current = 0;

        const newData: UserActivity = {
            mouseMovements: [],
            clicks: [],
            scrollEvents: [],
            keyboardEvents: [],
            pageLoadTime: Date.now(),
            totalTimeOnPage: 0,
            activeTime: 0,
            idleTime: 0,
            tabSwitches: 0,
            isActive: true,
            lastActivityTime: Date.now(),
            // Learning tracking fields
            studyHours: 0,
            completedTopics: 0,
            studySessions: [],
        };

        setActivity(newData);
        onDataUpdate?.(newData);
    }, [onDataUpdate]);

    // Export tracking data - simplified for learning tracking
    const exportData = useCallback(() => {
        const engagementScore = Math.min(
            100,
            Math.round((activity.activeTime / Math.max(activity.totalTimeOnPage, 1)) * 100),
        );
        const clicksPerMinute =
            activity.totalTimeOnPage > 0 ? activity.clicks.length / (activity.totalTimeOnPage / 60000) || 0 : 0;

        const mouseDistance = activity.mouseMovements.reduce((total, movement, index) => {
            if (index === 0) return 0;
            const prev = activity.mouseMovements[index - 1];
            return total + Math.sqrt(Math.pow(movement.x - prev.x, 2) + Math.pow(movement.y - prev.y, 2));
        }, 0);

        return {
            ...activity,
            exportTime: new Date().toISOString(),
            engagementMetrics: {
                engagementScore,
                clicksPerMinute,
                mouseDistance: Math.round(mouseDistance),
                averageScrollSpeed:
                    activity.scrollEvents.length > 1
                        ? (activity.scrollEvents[activity.scrollEvents.length - 1].scrollTop -
                              activity.scrollEvents[0].scrollTop) /
                          (activity.scrollEvents[activity.scrollEvents.length - 1].timestamp -
                              activity.scrollEvents[0].timestamp)
                        : 0,
            },
        };
    }, [activity]);

    // Learning tracking methods
    const startStudySession = useCallback((topicId: string, topicName?: string) => {
        const now = Date.now();
        setActivity(prev => ({
            ...prev,
            studyStartTime: now,
            currentTopic: topicName,
        }));
    }, []);

    const endStudySession = useCallback((itemsStudied: number, accuracy: number) => {
        const now = Date.now();
        setActivity(prev => {
            if (!prev.studyStartTime || !prev.currentTopic) return prev;
            
            const duration = now - prev.studyStartTime;
            const studyHours = prev.studyHours + (duration / (1000 * 60 * 60)); // Convert to hours
            
            const newSession: StudySession = {
                id: `session-${now}`,
                topicId: prev.currentTopic,
                startTime: prev.studyStartTime,
                endTime: now,
                duration,
                itemsStudied,
                accuracy,
                status: 'completed'
            };

            return {
                ...prev,
                studyHours,
                completedTopics: prev.completedTopics + 1,
                studySessions: [...prev.studySessions, newSession],
                studyStartTime: undefined,
                currentTopic: undefined,
            };
        });
    }, []);

    const pauseStudySession = useCallback(() => {
        const now = Date.now();
        setActivity(prev => {
            if (!prev.studyStartTime || !prev.currentTopic) return prev;
            
            const duration = now - prev.studyStartTime;
            const studyHours = prev.studyHours + (duration / (1000 * 60 * 60));
            
            const pausedSession: StudySession = {
                id: `session-${now}`,
                topicId: prev.currentTopic,
                startTime: prev.studyStartTime,
                endTime: now,
                duration,
                itemsStudied: 0,
                accuracy: 0,
                status: 'paused',
            };

            return {
                ...prev,
                studyHours,
                studySessions: [...prev.studySessions, pausedSession],
                studyStartTime: undefined,
                currentTopic: undefined,
            };
        });
    }, []);

    const getStudyMetrics = useCallback(() => {
        return {
            totalStudyHours: Math.round(activity.studyHours * 100) / 100, // Round to 2 decimal places
            completedTopics: activity.completedTopics,
            currentSession: activity.studyStartTime ? {
                topic: activity.currentTopic,
                startTime: activity.studyStartTime,
                duration: Date.now() - activity.studyStartTime,
            } : null,
            recentSessions: activity.studySessions.slice(-5), // Last 5 sessions
            todayStudyTime: activity.studySessions
                .filter(session => {
                    const today = new Date();
                    const sessionDate = new Date(session.startTime);
                    return sessionDate.toDateString() === today.toDateString();
                })
                .reduce((total, session) => total + session.duration, 0) / (1000 * 60 * 60), // Convert to hours
        };
    }, [activity]);

    return {
        activity,
        isTracking,
        startTracking,
        stopTracking,
        clearData,
        exportData,
        // Learning tracking methods
        startStudySession,
        endStudySession,
        pauseStudySession,
        getStudyMetrics,
    };
}
