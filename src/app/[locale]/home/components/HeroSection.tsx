'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, Library } from 'lucide-react';

export default function HeroSection() {
    const router = useRouter();

    return (
        <div className="relative isolate pt-10 pb-12 md:pt-14 md:pb-16">
            {/* background gradient mesh */}

            <div className="mx-auto max-w-6xl px-4 relative">
                <div className="flex flex-col items-center text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="text-3xl md:text-5xl font-bold tracking-tight leading-tight bg-gradient-to-r from-indigo-200 via-sky-200 to-cyan-200 bg-clip-text text-transparent"
                    >
                        Accelerate Your Adaptive Learning Journey
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="mt-4 max-w-2xl text-sm md:text-base text-slate-400 leading-relaxed"
                    >
                        Generate content with AI, schedule deep practice, and track spaced repetition progress — all in
                        one unified workspace.
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
                            <Sparkles className="mr-2 h-4 w-4" /> Generate Content
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => router.push(ROUTES.SCHEDULE)}
                            className="rounded-full border border-white/10 bg-slate-800/70 backdrop-blur hover:bg-slate-700/70 text-slate-200 text-sm"
                        >
                            <Calendar className="mr-2 h-4 w-4" /> View Schedule
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => router.push(ROUTES.LIBRARY)}
                            className="rounded-full text-slate-300 hover:text-white hover:bg-white/5 text-sm"
                        >
                            <Library className="mr-2 h-4 w-4" /> Library
                        </Button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
