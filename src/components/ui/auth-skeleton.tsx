'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, User, ArrowRight } from 'lucide-react';

interface AuthSkeletonProps {
    className?: string;
}

export default function AuthSkeleton({ className = '' }: AuthSkeletonProps) {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
        }, 500);

        return () => clearInterval(interval);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
            },
        },
    };

    const iconVariants = {
        hidden: { scale: 0.8, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                duration: 0.8,
                repeat: Infinity,
                repeatType: 'reverse' as const,
            },
        },
    };

    return (
        <div className={`min-h-screen flex items-center justify-center  ${className}`}>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="text-center space-y-8 p-8 max-w-md"
            >
                {/* Authentication Icon with Animation */}
                <motion.div variants={iconVariants} className="flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                        <div className="relative bg-white dark:bg-gray-800 p-6 rounded-full shadow-lg border border-blue-200 dark:border-blue-700">
                            <Shield className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </motion.div>

                {/* Loading Text */}
                <motion.div variants={itemVariants} className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">.{dots}</p>
                </motion.div>

                {/* Progress Indicator */}
                <motion.div variants={itemVariants} className="space-y-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <motion.div
                            className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                    </div>

                    <div className="flex justify-center space-x-6 text-sm">
                        <motion.div
                            variants={itemVariants}
                            className="flex items-center space-x-2 text-blue-600 dark:text-blue-400"
                        >
                            <User className="w-4 h-4" />
                            <span>Authenticating</span>
                        </motion.div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <motion.div
                            variants={itemVariants}
                            className="flex items-center space-x-2 text-gray-500 dark:text-gray-400"
                        >
                            <Shield className="w-4 h-4" />
                            <span>Redirecting</span>
                        </motion.div>
                    </div>
                </motion.div>

                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-10"
                        animate={{
                            x: [0, 50, 0],
                            y: [0, -30, 0],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                    <motion.div
                        className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-10"
                        animate={{
                            x: [0, -50, 0],
                            y: [0, 30, 0],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                </div>
            </motion.div>
        </div>
    );
}
