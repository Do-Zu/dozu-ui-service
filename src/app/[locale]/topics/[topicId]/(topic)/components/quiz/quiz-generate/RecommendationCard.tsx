'use client';

import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { QuizRecommendType, QuizRecommendationDTO } from './hooks/useQuizRecommendation';

interface Props {
    recommendation: QuizRecommendationDTO;
    onStart: (type: QuizRecommendType) => void;
}

const LABEL_MAP: Record<QuizRecommendType, string> = {
    new: 'New',
    learning: 'Learning',
    review: 'Review',
    weak: 'Weak',
    wrong: 'Wrong',
};

const COLOR_MAP: Record<QuizRecommendType, string> = {
    new: 'from-purple-500 to-indigo-500',
    learning: 'from-blue-500 to-cyan-500',
    review: 'from-green-500 to-emerald-500',
    weak: 'from-yellow-500 to-orange-500',
    wrong: 'from-red-500 to-pink-500',
};

export default function RecommendationCard({ recommendation, onStart }: Props) {
    const type = recommendation.recommendedType;
    const count = recommendation.counts?.[type] ?? 0;

    if (!type || count <= 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            whileHover={{ y: -4 }}
            className="mb-6"
        >
            <div className="relative overflow-hidden rounded-2xl border bg-background shadow-md">
                {/* gradient glow */}
                <div className={`absolute inset-0 bg-gradient-to-r opacity-15 ${COLOR_MAP[type]}`} />

                {/* animated sparkle */}
                <motion.div
                    className="absolute -right-6 -top-6 text-primary/30"
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                >
                    <Sparkles size={80} />
                </motion.div>

                <div className="relative p-6">
                    {/* header */}
                    <div className="mb-2 flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            <Sparkles size={14} />
                            Recommended
                        </div>
                    </div>

                    {/* title */}
                    <div className="text-lg font-semibold leading-tight">
                        {LABEL_MAP[type]} Quiz is best for you now
                    </div>

                    {/* meta */}
                    <div className="mt-1 text-sm text-muted-foreground">
                        {count} questions · Personalized by your progress
                    </div>

                    {/* reason */}
                    <div className="mt-3 text-sm leading-relaxed">{recommendation.reason}</div>

                    {/* CTA */}
                    <motion.div className="mt-5 inline-block" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                        <Button className="gap-2" onClick={() => onStart(type)}>
                            Start now
                            <ArrowRight size={16} />
                        </Button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
