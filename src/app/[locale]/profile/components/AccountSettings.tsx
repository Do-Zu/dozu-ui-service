'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Bell } from 'lucide-react';
import { NotificationSettings, PrivacySettings } from '../../../../types/profile';
import { ProfileService } from '../../../../services/profile/profileService';
import toastHelper from '@/utils/toast.helper';

interface AccountSettingsProps {
    onSettingsChange?: (notifications: NotificationSettings, privacy: PrivacySettings) => Promise<void>;
    onDeleteAccount?: () => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ onSettingsChange }) => {
    const [notifications, setNotifications] = useState<NotificationSettings>({
        dailyReminders: true,
        weeklyReports: true,
        achievementNotifications: false,
        emailNotifications: true,
        pushNotifications: false,
    });

    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);

    // Load current settings from profile data
    useEffect(() => {
        loadCurrentSettings();
    }, []);

    const loadCurrentSettings = async () => {
        try {
            setLoading(true);
            const profile = await ProfileService.getProfile();

            // If backend has settings, use them
            if (profile.notificationSettings) {
                setNotifications(profile.notificationSettings);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
        setNotifications((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleToggleAll = (enabled: boolean) => {
        setNotifications({
            dailyReminders: enabled,
            weeklyReports: enabled,
            achievementNotifications: enabled,
            emailNotifications: enabled,
            pushNotifications: enabled,
        });
    };

    const allNotificationsEnabled = Object.values(notifications).every((v) => v);
    const someNotificationsEnabled = Object.values(notifications).some((v) => v);

    const handleSaveSettings = async () => {
        setSaveLoading(true);
        try {
            await (onSettingsChange
                ? onSettingsChange(notifications, {} as PrivacySettings)
                : ProfileService.updateNotificationSettings(notifications));
            // Refresh notification settings in AuthContext to update WebSocket behavior
            toastHelper.showSuccessMessage('Settings saved successfully!');
        } catch (error) {
            toastHelper.showErrorMessage(error);
        } finally {
            setSaveLoading(false);
        }
    };

    const handleResetToDefault = () => {
        setNotifications({
            dailyReminders: true,
            weeklyReports: true,
            achievementNotifications: false,
            emailNotifications: true,
            pushNotifications: false,
        });
    };

    return (
        <div className="space-y-6">
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="size-6 animate-spin" />
                    <span className="ml-2">Loading settings...</span>
                </div>
            ) : (
                <>
                    <div className="space-y-5">
                        {/* Header */}
                        <div>
                            <Label className="mb-2 flex items-center gap-2 text-xl font-semibold">
                                <Bell className="size-5" />
                                Email Notifications
                            </Label>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Select which notifications you&apos;d like to receive. Stay updated with your learning
                                progress and achievements.
                            </p>

                            {/* Group Toggle */}
                            <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-muted p-3">
                                <div>
                                    <Label className="cursor-pointer text-sm font-semibold">
                                        Toggle all notifications
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Turn all notifications on or off at once
                                    </p>
                                </div>
                                <div className="relative inline-block h-6 w-12">
                                    <input
                                        type="checkbox"
                                        checked={allNotificationsEnabled}
                                        onChange={(e) => handleToggleAll(e.target.checked)}
                                        className="peer sr-only"
                                        id="toggle-all"
                                    />
                                    <label
                                        htmlFor="toggle-all"
                                        className={`absolute inset-0 cursor-pointer rounded-full transition-colors duration-200 ${
                                            allNotificationsEnabled || someNotificationsEnabled
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                                                : 'bg-muted'
                                        }`}
                                    >
                                        <span
                                            className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-background shadow-md transition-transform duration-200 ${
                                                allNotificationsEnabled ? 'translate-x-6' : 'translate-x-0'
                                            }`}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Notification Options */}
                        <div className="space-y-3">
                            <label className="flex cursor-pointer items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={notifications.dailyReminders}
                                    onChange={(e) => handleNotificationChange('dailyReminders', e.target.checked)}
                                    className="rounded"
                                />
                                <span className="text-sm">Daily learning reminders</span>
                            </label>
                            <label className="flex cursor-pointer items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={notifications.weeklyReports}
                                    onChange={(e) => handleNotificationChange('weeklyReports', e.target.checked)}
                                    className="rounded"
                                />
                                <span className="text-sm">Weekly progress reports</span>
                            </label>
                            <label className="flex cursor-pointer items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={notifications.achievementNotifications}
                                    onChange={(e) =>
                                        handleNotificationChange('achievementNotifications', e.target.checked)
                                    }
                                    className="rounded"
                                />
                                <span className="text-sm">Achievement notifications</span>
                            </label>
                            <label className="flex cursor-pointer items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={notifications.emailNotifications}
                                    onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                                    className="rounded"
                                />
                                <span className="text-sm">Email notifications</span>
                            </label>
                            {/* <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={notifications.pushNotifications}
                onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                className="rounded" 
              />
              <span className="text-sm">Push notifications</span>
            </label> */}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row">
                            <Button
                                onClick={handleSaveSettings}
                                variant="default"
                                className="flex-1 sm:flex-none"
                                disabled={saveLoading}
                                size="lg"
                            >
                                {saveLoading ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Bell className="mr-2 size-4" />
                                        Save Settings
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleResetToDefault}
                                className="border-2 hover:bg-muted"
                                size="lg"
                            >
                                Reset to Default
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AccountSettings;
