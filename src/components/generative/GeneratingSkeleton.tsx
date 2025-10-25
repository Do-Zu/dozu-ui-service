'use client';
import React, { useEffect, useState } from 'react';
import { Loader2, Brain, FileText, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface GeneratingSkeletonProps {
    fileName?: string;
    progress?: number;
}

const GeneratingSkeleton: React.FC<GeneratingSkeletonProps> = ({ fileName, progress = 0 }) => {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const t = useTranslations('generate.generatingSkeleton');

    const messages = [
        t('messages.analyzing'),
        t('messages.processing'),
        t('messages.building'),
        t('messages.reviewing'),
        t('messages.almost'),
    ];

    useEffect(() => {
        const messageInterval = setInterval(() => {
            setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        }, 4000);

        return () => clearInterval(messageInterval);
    }, [messages.length]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="relative inline-block mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Brain className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900  mb-2">{t('title')}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
                </div>

                {fileName && (
                    <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{fileName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('file.processing')}</p>
                        </div>
                    </div>
                )}

                <div className="space-y-4 mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Zap className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('steps.extracted')}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Loader2 className="h-3 w-3 text-white animate-spin" />
                        </div>
                        <span className="text-sm text-gray-900 dark:to-blue-600 font-medium">
                            {messages[currentMessageIndex]}
                        </span>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        </div>
                        <span className="text-sm text-gray-400 dark:text-gray-500">{t('steps.creatingVisual')}</span>
                    </div>
                </div>
                {/* Animated Dots */}
                <div className="text-center">
                    <div className="inline-flex space-x-1">
                        <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: '0ms' }}
                        ></div>
                        <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: '150ms' }}
                        ></div>
                        <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: '300ms' }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t('footer.wait')}</p>
                </div>
            </div>
        </div>
    );
};

export default GeneratingSkeleton;
