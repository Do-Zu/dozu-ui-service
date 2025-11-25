import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ITopic } from '../../types/topic.type';

import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface Props {
    topic: ITopic;
    handleNameClick: (topic: ITopic) => void;
    menuContent: (topic: ITopic) => React.ReactNode | null;
    footer: (topic: ITopic) => React.ReactNode | null;
}

export default function TopicCard({ topic, handleNameClick, menuContent, footer }: Props) {
    const { name, imageUrl, description } = topic;

    const [mounted, setMounted] = useState(false);
    const cardRef = useRef<HTMLDivElement | null>(null);

    function handleOnMouseMove(e: React.MouseEvent) {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    }
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const spotlight = useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(99,102,241,0.25), transparent 70%)`;

    useEffect(() => setMounted(true), []);
    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleOnMouseMove}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="group relative"
        >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/30 via-sky-500/25 to-cyan-500/30 dark:from-indigo-500/40 dark:via-sky-500/30 dark:to-cyan-500/40 opacity-0 group-hover:opacity-100 blur-xl transition duration-700" />
            {/* <div className="absolute inset-px rounded-[0.95rem] bg-gradient-to-br from-white/60 via-white/40 to-white/60 dark:from-indigo-600/40 dark:via-sky-700/30 dark:to-cyan-700/50 backdrop-blur-sm dark:backdrop-blur" /> */}
            <Card className="relative overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-gradient-to-br from-white/70 via-white/55 to-white/70 dark:from-slate-900/70 dark:via-slate-900/40 dark:to-slate-900/70 shadow-[0_4px_18px_-6px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.6)] transition-all duration-300 group-hover:shadow-[0_8px_28px_-8px_rgba(0,0,0,0.25)] dark:group-hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.75)]">
                {mounted && (
                    <motion.div
                        style={{ background: spotlight }}
                        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 mix-blend-overlay"
                    />
                )}

                <CardHeader className="">
                    <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                            <CardTitle
                                role="button"
                                tabIndex={0}
                                onClick={() => handleNameClick(topic)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleNameClick(topic);
                                    }
                                }}
                                className="text-base font-semibold tracking-tight leading-snug line-clamp-2 bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-600 dark:from-indigo-200 dark:via-sky-200 dark:to-cyan-200 bg-clip-text text-transparent cursor-pointer hover:from-indigo-500 hover:via-sky-500 hover:to-cyan-500 dark:hover:from-indigo-300 dark:hover:via-sky-300 dark:hover:to-cyan-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 rounded-sm"
                            >
                                {name}
                            </CardTitle>
                            <p className="mt-1 text-[0.7rem] line-clamp-2 text-slate-600/80 dark:text-slate-400/80 leading-relaxed">
                                {description}
                            </p>
                        </div>
                        {menuContent(topic) ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:pointer-events-auto">
                                        <MoreVertical className="h-4 w-4 text-gray-500" />
                                    </Button>
                                </DropdownMenuTrigger>
                                {menuContent(topic)}
                            </DropdownMenu>
                        ) : null}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative mb-4 h-40 w-full overflow-hidden rounded-xl border border-slate-200/60 dark:border-white/5 bg-gradient-to-br from-slate-100/80 via-slate-50/60 to-slate-100/80 dark:from-slate-800/60 dark:via-slate-900/40 dark:to-slate-800/50 group-hover:border-indigo-400/40 transition-colors">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.25),transparent_60%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.2),transparent_60%)]" />
                        {imageUrl ? (
                            <Image
                                fill
                                className="object-cover object-center opacity-90 transition-all duration-500 group-hover:scale-[1.04] group-hover:opacity-100"
                                alt={name}
                                src={imageUrl}
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-[0.7rem] tracking-wide text-slate-500 dark:text-slate-500">
                                • No Preview •
                            </div>
                        )}
                        {/* overlay gradient bottom fade */}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white/90 dark:from-slate-950/70 to-transparent" />
                    </div>

                    {footer(topic)}
                </CardContent>
                {/* Floating blurred accents */}
                <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-indigo-400/25 dark:bg-indigo-600/20 blur-3xl" />
                <div className="pointer-events-none absolute -right-10 bottom-8 h-28 w-28 rounded-full bg-cyan-400/25 dark:bg-cyan-600/20 blur-3xl" />
            </Card>
        </motion.div>
    );
}
