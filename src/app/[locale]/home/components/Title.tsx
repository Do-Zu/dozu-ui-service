import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useAuthStorage } from '../../auth/hooks/useAuthStorage';

export default function Title() {
    const { isAuthenticated } = useAuthStorage();
    const t = useTranslations('home.coreActionCards');
    const tHome = useTranslations('home');
    return (
        <div
            className={`relative isolate md:pt-10 md:pb-5 ${isAuthenticated ? '' : 'flex items-center justify-center'}`}
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
                </div>
            </div>
        </div>
    );
}
