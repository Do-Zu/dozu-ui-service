'use client';

import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { postRequest } from '@/api/api';
import { toast } from '@/hooks/use-toast';
import { useUserTracking } from '@/hooks/useUserTracking';
import { formatSeconds } from '@/utils';
import { useUserTrackingContext } from '@/contexts/tracking/UserTrackingContext';

export default function UserBehaviorTracking() {
    const { activity, isTracking, clearData, exportData, startTracking, stopTracking } = useUserTrackingContext();

    const engagementScore = Math.min(
        100,
        Math.round((activity.activeTime / Math.max(activity.totalTimeOnPage, 1)) * 100),
    );

    const clicksPerMinute =
        activity.totalTimeOnPage > 0
            ? (activity.clicks.length / (activity.totalTimeOnPage / 60000) || 0).toFixed(1)
            : '0';

    const mouseDistance = activity.mouseMovements.reduce((total, movement, index) => {
        if (index === 0) return 0;
        const prev = activity.mouseMovements[index - 1];
        return total + Math.sqrt(Math.pow(movement.x - prev.x, 2) + Math.pow(movement.y - prev.y, 2));
    }, 0);

    useEffect(() => {
        startTracking();
    }, []);

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">User Behavior Tracking</h1>
                <div className="flex gap-2">
                    <Button onClick={exportData} variant="outline">
                        Export Data
                    </Button>
                    <Button onClick={clearData} variant="outline">
                        Clear Data
                    </Button>
                </div>
            </div>

            {/* Status indicators */}
            <div className="flex gap-4 items-center">
                <Badge variant={isTracking ? 'default' : 'secondary'}>
                    {isTracking ? 'Tracking Active' : 'Tracking Stopped'}
                </Badge>
                <Badge variant={activity.isActive ? 'default' : 'secondary'}>
                    {activity.isActive ? 'User Active' : 'User Idle'}
                </Badge>
            </div>

            {/* Time metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Time on Page</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatSeconds(activity.totalTimeOnPage)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Active Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatSeconds(activity.activeTime)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Idle Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatSeconds(activity.idleTime)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{engagementScore}%</div>
                        <Progress value={engagementScore} className="mt-2" />
                    </CardContent>
                </Card>
            </div>

            {/* Activity metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Mouse Movements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activity.mouseMovements.length.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                            Distance: {Math.round(mouseDistance).toLocaleString()}px
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Clicks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activity.clicks.length}</div>
                        <div className="text-xs text-gray-500">{clicksPerMinute} clicks/min</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Scroll Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activity.scrollEvents.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Tab Switches</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activity.tabSwitches}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Clicks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {activity.clicks
                                .slice(-10)
                                .reverse()
                                .map((click, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                        <span>{click.target}</span>
                                        <span className="text-gray-500">
                                            ({click.x}, {click.y}) - {new Date(click.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                ))}
                            {activity.clicks.length === 0 && (
                                <div className="text-gray-500 text-center py-4">No clicks recorded yet</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Keyboard Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {activity.keyboardEvents
                                .slice(-10)
                                .reverse()
                                .map((event, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                        <span>{event.key === ' ' ? 'Space' : event.key}</span>
                                        <span className="text-gray-500">
                                            {event.target} - {new Date(event.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                ))}
                            {activity.keyboardEvents.length === 0 && (
                                <div className="text-gray-500 text-center py-4">No keyboard activity recorded yet</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Mouse heatmap visualization */}
            <Card>
                <CardHeader>
                    <CardTitle>Mouse Movement Heatmap</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative bg-gray-100 rounded-lg" style={{ height: '300px' }}>
                        {activity.mouseMovements.slice(-50).map((movement, index) => (
                            <div
                                key={index}
                                className="absolute w-2 h-2 bg-blue-500 rounded-full opacity-30"
                                style={{
                                    left: `${(movement.x / window.innerWidth) * 100}%`,
                                    top: `${(movement.y / 300) * 100}%`,
                                    transform: 'translate(-50%, -50%)',
                                }}
                            />
                        ))}
                        {activity.mouseMovements.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                Move your mouse to see tracking data
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
