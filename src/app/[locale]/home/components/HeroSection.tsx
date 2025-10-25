'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, Library } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { useAuthStorage } from '../../auth/hooks/useAuthStorage';

export default function HeroSection() {
    const router = useRouter();
    const t = useTranslations('home.coreActionCards');
    const tHome = useTranslations('home');
    const { isAuthenticated } = useAuthStorage();

    return (
        <div
            className={`relative isolate pt-10 pb-12 md:pt-14 md:pb-16 ${isAuthenticated ? '' : 'min-h-full flex items-center justify-center'}`}
        >
            <div className="mx-auto max-w-6xl px-4 relative">
                <div className="flex flex-col items-center text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="text-3xl md:text-5xl font-bold tracking-tight leading-tight bg-gradient-to-r from-slate-700 via-slate-800 to-sky-800 dark:from-slate-400 dark:via-sky-800 dark:to-cyan-700 bg-clip-text text-transparent"
                    >
                        {tHome('title')}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="mt-4 max-w-2xl text-sm md:text-base text-slate-400 leading-relaxed"
                    >
                        {t('generate.description')}
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.25 }}
                        className="mt-8 flex flex-wrap items-center justify-center gap-3"
                    >
                        <Button
                            onClick={() => router.push(ROUTES.GENERATE)}
                            className="relative overflow-hidden rounded-full px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-400 hover:via-sky-400 hover:to-cyan-400 transition"
                        >
                            <Sparkles className="mr-2 h-4 w-4" /> {t('generate.title')}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => router.push(ROUTES.SCHEDULE)}
                            className="rounded-full border border-white/10 bg-slate-800/70 backdrop-blur hover:bg-slate-700/70 text-slate-200 text-sm"
                        >
                            <Calendar className="mr-2 h-4 w-4" /> {t('schedule.title')}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => router.push(ROUTES.PROGRESS)}
                            className="rounded-full border border-slate-500/40 dark:border-white/10 dark:bg-slate-800/60 backdrop-blur hover:opacity-70 dark:text-slate-200 text-sm"
                        >
                            <Library className="mr-2 h-4 w-4" /> Progress
                        </Button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
