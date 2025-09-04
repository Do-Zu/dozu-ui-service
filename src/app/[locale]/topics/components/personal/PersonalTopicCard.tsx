import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
    BookOpen,
    ClipboardCheck,
    Edit,
    GitFork,
    GraduationCap,
    Layers,
    MoreVertical,
    Trash2,
    Play,
} from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';
import { ITopic } from '../../types/topic.type';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

interface Props {
    topic: ITopic;
    handleOpenUpdateModal: ({
        topicId,
        name,
        description,
        imageUrl,
    }: {
        topicId: number;
        name: string;
        description: string;
        imageUrl?: string | null;
    }) => void;
    handleOpenDeleteModal: ({ topicId, name }: { topicId: number; name: string }) => void;
    handleNameClick: (topic: ITopic) => void;
}

const Metric = ({ label, value }: { label: string; value: number | string }) => (
    <div className="flex flex-col min-w-[4.5rem]">
        <span className="text-[0.65rem] uppercase tracking-wide text-muted-foreground/70 font-medium mb-0.5">
            {label}
        </span>
        <span className="text-sm font-semibold bg-gradient-to-r from-indigo-300 via-sky-300 to-cyan-200 bg-clip-text text-transparent">
            {value}
        </span>
    </div>
);

export function PersonalTopicCard({ topic, handleOpenUpdateModal, handleOpenDeleteModal, handleNameClick }: Props) {
    const router = useRouter();
    const {
        topicId,
        name,
        description,
        imageUrl,
        flashcardsNew = 0,
        flashcardsDueToday = 0,
        flashcardsCount = 0,
    } = topic;
    const tCommon = useTranslations('common');
    const tTopic = useTranslations('topic');

    // Hover reactive gradient spotlight
    const cardRef = useRef<HTMLDivElement | null>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    function handleOnMouseMove(e: React.MouseEvent) {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    }

    function handleOnSelectEditFlashcard() {
        router.push(ROUTES.FLASHCARDS_EDIT(topicId));
    }
    function handleOnSelectBrowse() {
        router.push(ROUTES.FLASHCARDS_BROWSE(topicId));
    }
    function handleOnSelectLearning() {
        router.push(ROUTES.FLASHCARDS_LEARNING(topicId));
    }
    function handleOnClickMindmap() {
        router.push(ROUTES.MINDMAP_EDIT(topicId));
    }
    function handleOnClickStartQuiz() {
        router.push(ROUTES.QUIZ_START(topicId));
    }
    function handleOnClickEditQuestion() {
        router.push(ROUTES.QUIZ_EDIT(topicId));
    }

    const spotlight = useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(99,102,241,0.25), transparent 70%)`;

    const progressTotal = flashcardsCount || flashcardsDueToday + flashcardsNew;
    const progressValue = progressTotal
        ? Math.min(100, Math.round(((flashcardsCount - flashcardsDueToday) / progressTotal) * 100))
        : 0;

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
            <div className="absolute inset-px rounded-[0.95rem] bg-gradient-to-br from-white/60 via-white/40 to-white/60 dark:from-indigo-600/40 dark:via-sky-700/30 dark:to-cyan-700/50 backdrop-blur-sm dark:backdrop-blur" />
            <Card className="relative overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-gradient-to-br from-white/70 via-white/55 to-white/70 dark:from-slate-900/70 dark:via-slate-900/40 dark:to-slate-900/70 shadow-[0_4px_18px_-6px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.6)] transition-all duration-300 group-hover:shadow-[0_8px_28px_-8px_rgba(0,0,0,0.25)] dark:group-hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.75)]">
                {mounted && (
                    <motion.div
                        style={{ background: spotlight }}
                        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 mix-blend-overlay"
                    />
                )}

                <div
                    className={
                        "absolute inset-0 opacity-[0.06] mix-blend-soft-light bg-[url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' fill='none'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/></filter><rect width='160' height='160' filter='url(%23n)' opacity='0.35'/></svg>\")]"
                    }
                />

                <CardHeader className="pb-3 relative z-10">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <CardTitle
                                onClick={() => handleNameClick(topic)}
                                className="text-base font-semibold tracking-tight leading-snug line-clamp-2 bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-600 dark:from-indigo-200 dark:via-sky-200 dark:to-cyan-200 bg-clip-text text-transparent cursor-pointer hover:from-indigo-500 hover:via-sky-500 hover:to-cyan-500 dark:hover:from-indigo-300 dark:hover:via-sky-300 dark:hover:to-cyan-300 transition-colors"
                            >
                                {name}
                            </CardTitle>
                            {description && (
                                <p className="mt-1 text-[0.7rem] line-clamp-2 text-slate-600/80 dark:text-slate-400/80 leading-relaxed">
                                    {description}
                                </p>
                            )}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full hover:bg-slate-900/5 dark:hover:bg-white/10"
                                >
                                    <MoreVertical className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                side="top"
                                className="backdrop-blur-md bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700"
                            >
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        <Layers className="mr-2 h-4 w-4" />
                                        <span>Flashcard</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="backdrop-blur-md bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700">
                                        <DropdownMenuItem onSelect={handleOnSelectEditFlashcard}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>{tCommon('actions.edit')}</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={handleOnSelectBrowse}>
                                            <BookOpen className="mr-2 h-4 w-4" />
                                            <span>{tTopic('browse')}</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={handleOnSelectLearning}>
                                            <GraduationCap className="mr-2 h-4 w-4" />
                                            <span>{tTopic('learning')}</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        <GitFork className="mr-2 h-4 w-4" />
                                        <span>Mind Map</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="backdrop-blur-md bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700">
                                        <DropdownMenuItem onSelect={handleOnClickMindmap}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>{tCommon('actions.edit')}</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        <ClipboardCheck className="mr-2 h-4 w-4" />
                                        <span>Quiz</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="backdrop-blur-md bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700">
                                        <DropdownMenuItem onSelect={handleOnClickStartQuiz}>
                                            <Play className="mr-2 h-4 w-4" />
                                            <span>{tTopic('start-quiz')}</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={handleOnClickEditQuestion}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>{tCommon('actions.edit')}</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuItem
                                    onSelect={() => handleOpenUpdateModal({ topicId, name, description, imageUrl })}
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>{tCommon('actions.edit')}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleOpenDeleteModal({ topicId, name })}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>{tCommon('actions.delete')}</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>

                <CardContent className="relative z-10 pt-0">
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

                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[0.6rem] font-semibold text-slate-600 dark:text-slate-300">
                                {progressValue}%
                            </span>
                        </div>
                        <div className="relative h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                            <div
                                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500 dark:from-indigo-200 dark:via-sky-200 dark:to-cyan-200 shadow-[0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.15)] transition-[width] duration-700 ease-out"
                                style={{ width: `${progressValue}%` }}
                            />
                            <div className="absolute inset-0 animate-[shimmer_2.5s_infinite] bg-[linear-gradient(110deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.5)_40%,rgba(255,255,255,0)_80%)] dark:bg-[linear-gradient(110deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.15)_40%,rgba(255,255,255,0)_80%)] bg-[length:200%_100%]" />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-3">
                        <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 px-3 rounded-full bg-slate-900/5 dark:bg-slate-800/80 hover:bg-slate-900/10 dark:hover:bg-slate-700/70 text-[0.65rem] font-medium tracking-wide border border-slate-300/60 dark:border-transparent backdrop-blur-sm"
                            onClick={handleOnSelectLearning}
                        >
                            {tTopic('learning')}
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-slate-600 dark:text-slate-200"
                                onClick={handleOnSelectBrowse}
                            >
                                <BookOpen className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-slate-600 dark:text-slate-200"
                                onClick={handleOnClickStartQuiz}
                            >
                                <ClipboardCheck className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-slate-600 dark:text-slate-200"
                                onClick={handleOnClickMindmap}
                            >
                                <GitFork className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
                {/* Floating blurred accents */}
                <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-indigo-400/25 dark:bg-indigo-600/20 blur-3xl" />
                <div className="pointer-events-none absolute -right-10 bottom-8 h-28 w-28 rounded-full bg-cyan-400/25 dark:bg-cyan-600/20 blur-3xl" />
            </Card>
        </motion.div>
    );
}
