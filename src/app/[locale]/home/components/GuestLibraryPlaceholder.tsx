'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';

export default function GuestLibraryPlaceholder() {
    const router = useRouter();

    return (
        <div className="w-full max-w-4xl mx-auto mt-12 px-4 mb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="p-8 md:p-12 text-center"
            >
                <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="max-w-lg space-y-2">
                        <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            Unlock Your Personal Library
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                            Log in to access your personalized topics, save your progress, and track your learning
                            journey across devices.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        <Button
                            onClick={() => router.push(ROUTES.LOGIN)}
                            size="lg"
                            className="min-w-[140px] gap-2 rounded-3xl"
                        >
                            Start
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push(ROUTES.REGISTER)}
                            size="lg"
                            className="min-w-[140px] gap-2 rounded-3xl"
                        >
                            <UserPlus className="h-2 w-2" />
                            Sign Up
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
