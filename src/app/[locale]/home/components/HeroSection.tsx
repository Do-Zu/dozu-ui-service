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
    const { isAuthenticated } = useAuthStorage();

    return (
        <div className={`relative isolate  ${isAuthenticated ? '' : 'flex items-center justify-center'}`}>
            <div className="mx-auto max-w-6xl px-4 relative">
                <div className="flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.25 }}
                        className="mt-8 flex flex-wrap items-center justify-center gap-3"
                    >
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
