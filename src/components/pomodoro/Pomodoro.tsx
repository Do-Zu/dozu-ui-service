import { AnimatePresence, motion, Variants } from 'framer-motion';
import { Card } from '../ui/card';
import { InputHTMLAttributes, useEffect, useMemo, useRef, useState } from 'react';
import { useInterval } from '@/hooks/useInterval';
import { Button } from '../ui/button';
import useToggle from '@/hooks/useToggle';
import { Clock, Timer, Play, Pause, RotateCcw, LucideSkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { isNegative, isNumber, isPositiveNumber } from '@/utils/validators';
import { useTranslations } from 'next-intl';

export type TypePosition = 'top-center' | 'bottom-center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type TypeMode = 'countdown' | 'stopwatch';
export interface IPropPomodoro {
    position: TypePosition;
    positionX?: number;
    positionY?: number;
    defaultMode?: TypeMode;
    times?: number; // minutes for countdown
    breakTime?: number; // minutes for countdown
    className?: string;
}

type TypeEditTimer = 'minute' | 'hour';

const DEFAULT_MINUTE_COUNT_DOWN = 45; // minutes
const DEFAULT_MINUTE_BREAK_TIME_COUNT_DOWN = 5; // minutes
const DEFAULT_TIME_SUB_COUNT_DOWN = 1000; // 1s

const panelVariants: Variants = {
    open: {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0% 0% 0% 0%)',
        transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
    },
    // initial state for opening (top -> down)
    fromTop: {
        opacity: 0,
        y: -12,
        clipPath: 'inset(100% 0% 0% 0%)',
        transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
    },
    // exit state for closing (left -> right)
    toRight: {
        opacity: 0,
        clipPath: 'inset(0% 0% 0% 100%)',
        transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
    },
};

function pad2(n: number) {
    return String(Math.floor(Math.max(0, n))).padStart(2, '0');
}

function positionClass(pos: TypePosition) {
    switch (pos) {
        case 'top-left':
            return 'top-4 left-4';
        case 'top-right':
            return 'top-4 right-4';
        case 'bottom-left':
            return 'bottom-4 left-4';
        case 'bottom-right':
            return 'bottom-4 right-4';
        case 'top-center':
            return 'top-4 left-1/2 -translate-x-1/2';
        case 'bottom-center':
            return 'bottom-4 left-1/2 -translate-x-1/2';
        default:
            return 'bottom-4 right-4';
    }
}

export default function Pomodoro({
    position = 'bottom-right',
    positionX = 0,
    positionY = 0,
    defaultMode = 'countdown',
    times = DEFAULT_MINUTE_COUNT_DOWN,
    breakTime = DEFAULT_MINUTE_BREAK_TIME_COUNT_DOWN,
    className,
}: IPropPomodoro) {
    const tCommon = useTranslations('common');
    const [mode, toggleMode] = useToggle<TypeMode>(defaultMode);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isActive, setIsActive] = useState<boolean>(false);
    const [isPause, setIsPause] = useState<boolean>(false);
    const [isBreakTime, setIsBreakTime] = useState<boolean>(false);

    const initialSeconds = useMemo(() => (defaultMode === 'countdown' ? times * 60 : 0), [defaultMode, times]);
    const [countTimer, setCountTimer] = useState<number>(initialSeconds);

    const minuteEditRef = useRef<HTMLDivElement>(null);
    const hourEditRef = useRef<HTMLDivElement>(null);

    const [editTimer, setEditTimer] = useState<{
        minute: boolean;
        hour: boolean;
    }>({
        minute: false,
        hour: false,
    });

    const handleClickEditTimer = (type: TypeEditTimer) => {
        setIsActive(false);

        setEditTimer({
            minute: type === 'minute',
            hour: type === 'hour',
        });
    };

    const reset = () => {
        setIsActive(false);
        setIsPause(false);
        setCountTimer(mode === 'countdown' ? times * 60 : 0);
    };

    const handleSkipBreakTime = () => {
        setIsBreakTime(false);
        reset();
    };

    const handleToggleMode = () => {
        toggleMode(mode === 'countdown' ? 'stopwatch' : 'countdown');
        setIsActive(false);
        setIsPause(false);
        setCountTimer(() => (mode === 'countdown' ? 0 : times * 60));
    };

    const handleProcessRunTimer = () => {
        if (!isActive) {
            setIsActive(true);
            setIsPause(false);
            setIsOpen(false);
        } else if (isPause) {
            setIsPause(false);
            setIsOpen(false);
        } else {
            setIsPause(true);
        }
    };

    const handleCompleteSession = () => {
        // Break time mode
        if (isBreakTime) {
            setIsActive(false);
            setIsBreakTime(false);
            reset();
        } else {
            // Session pomodoro
            toast({
                description: 'Break Time',
            });
            setIsBreakTime(true);
            setCountTimer(breakTime * 60);
            setIsActive(true);
            setIsOpen(true);
        }
    };

    useEffect(() => {
        setCountTimer(defaultMode === 'countdown' ? times * 60 : 0);
        setIsActive(false);
        setIsPause(false);
    }, [defaultMode, times]);

    useInterval(() => {
        if (!isActive || isPause) return;
        if (mode === 'countdown') {
            setCountTimer((prev) => {
                if (prev <= 1) {
                    // complete
                    handleCompleteSession();
                    return 0;
                }
                return prev - 1;
            });
        } else {
            setCountTimer((prev) => prev + 1);
        }
    }, DEFAULT_TIME_SUB_COUNT_DOWN);

    const hours = Math.floor(countTimer / 3600);
    const minutes = Math.floor((countTimer % 3600) / 60);
    const seconds = Math.floor(countTimer % 60);

    const isCountdown = mode === 'countdown';

    const renderClock = () => {
        if (isOpen) {
            return (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit="exit">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen((v) => !v)}
                        className="h-12 w-12 rounded-full border dark:border-white/10 dark:bg-slate-900/70 backdrop-blur "
                        aria-label="Open Pomodoro"
                    >
                        {isCountdown ? (
                            <Timer className="h-4 w-4 text-amber-300" />
                        ) : (
                            <Clock className="h-4 w-4 text-sky-300" />
                        )}
                    </Button>
                </motion.div>
            );
        }

        return (
            <motion.div
                className="flex justify-center items-center rounded-md border dark:border-white/10 dark:bg-slate-900  p-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <motion.div
                    key="pomodoro-panel"
                    initial="fromTop"
                    animate="open"
                    exit="toRight"
                    variants={panelVariants}
                    style={{ willChange: 'clip-path, transform, opacity' }}
                >
                    <div className="flex justify-center items-center gap-2 text-center ">
                        <div className="text-sm font-semibold  text-center tracking-tight">
                            {pad2(hours)}: {pad2(minutes)} : {pad2(seconds)}
                        </div>
                        <div className="text-xl font-semibold tracking-tight"> </div>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 6 }}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen((v) => !v)}
                        className="h-9 w-9 rounded-full border dark:border-white/10 dark:bg-slate-800/70 backdrop-blur dark:hover:bg-slate-600/70"
                        aria-label="Open Pomodoro"
                    >
                        {isCountdown ? (
                            <Timer className="h-4 w-4 text-amber-300" />
                        ) : (
                            <Clock className="h-4 w-4 text-sky-300" />
                        )}
                    </Button>
                </motion.div>
            </motion.div>
        );
    };

    const handleOnChangeTimer = (type: TypeEditTimer, value: string) => {
        console.log(value);

        if (!isNumber(value)) {
            return toast({ description: tCommon('messages.fillNumberError') });
        }

        if (isNegative(value)) {
            return toast({ description: tCommon('messages.fillNumberPositiveError') });
        }

        const time = parseFloat(value);

        const seconds = type === 'minute' ? time * 60 : time * 60 * 60;

        setCountTimer(seconds);
    };

    // Close edit mode when clicking outside
    useEffect(() => {
        if (!editTimer.minute && !editTimer.hour) return;

        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            const target = e.target as Node;
            const minuteEl = minuteEditRef.current;
            const hourEl = hourEditRef.current;

            if (minuteEl && minuteEl.contains(target)) return;
            if (hourEl && hourEl.contains(target)) return;

            setEditTimer({ minute: false, hour: false });
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [editTimer.minute, editTimer.hour]);

    const renderStatusTimer = (type: TypeEditTimer) => {
        const prefix = type == 'hour' ? 'hr' : 'min';
        const times = type == 'hour' ? pad2(hours) : pad2(minutes);

        const renderEditMode = () => {
            if (editTimer[type])
                return (
                    <Input
                        autoFocus
                        value={times}
                        onChange={(e) => handleOnChangeTimer(type, e.target.value)}
                        onBlur={() => setEditTimer((prev) => ({ ...prev, [type]: false }))}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                (e.target as HTMLInputElement).blur(); // triggers onBlur to close edit mode
                            } else if (e.key === 'Escape') {
                                e.preventDefault();
                                setEditTimer((prev) => ({ ...prev, [type]: false }));
                            }
                        }}
                    />
                );
            return times;
        };

        return (
            <div
                ref={type == 'minute' ? minuteEditRef : hourEditRef}
                onClick={() => handleClickEditTimer(type)}
                className="rounded-md border dark:border-white/10 dark:bg-slate-800/60 py-2"
            >
                <div className="text-2xl font-semibold tracking-tight">{renderEditMode()}</div>
                <div className="text-[10px] uppercase text-slate-400">{prefix}</div>
            </div>
        );
    };

    const renderTimer = () => {
        if (!isBreakTime)
            return (
                <>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                        {renderStatusTimer('hour')}
                        {renderStatusTimer('minute')}
                    </div>

                    <div className="mt-1 text-center font-semibold text-sm text-[10px] text-slate-400">
                        {pad2(seconds)} sec
                    </div>
                </>
            );

        return (
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-md border dark:border-white/10 dark:bg-slate-800/60 py-2">
                    <div className="text-2xl font-semibold tracking-tight">{pad2(minutes)}</div>
                    <div className="text-[10px] uppercase text-slate-400">min</div>
                </div>
                <div className="rounded-md border dark:border-white/10 dark:bg-slate-800/60 py-2">
                    <div className="text-2xl font-semibold tracking-tight">{pad2(seconds)}</div>
                    <div className="text-[10px] uppercase text-slate-400">sec</div>
                </div>
            </div>
        );
    };

    const renderButton = () => {
        if (!isBreakTime)
            return (
                <button
                    onClick={reset}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-transparent py-1.5 text-xs dark:text-slate-300 dark:hover:text-slate-100"
                    aria-label="Reset"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {isCountdown ? 'Reset Timer' : 'Reset Stopwatch'}
                </button>
            );

        return (
            <button
                onClick={handleSkipBreakTime}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-transparent py-1.5 text-xs dark:text-slate-300 dark:hover:text-slate-100"
                aria-label="Skip"
            >
                <LucideSkipForward className="h-3.5 w-3.5" />
                Skip
            </button>
        );
    };

    return (
        <motion.div
            className={cn(`max-w-[140px] transform absolute z-[99999] ${positionClass(position)}`, className)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div style={{ transform: `translate(${positionX}px, ${positionY}px)`, willChange: 'transform' }}>
                {renderClock()}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 6 }}
                            transition={{ duration: 0.25 }}
                            className="absolute z-50 mt-2 w-64 left-[-6em]"
                        >
                            <Card className="rounded-xl border dark:border-white/10 dark:bg-slate-900/90 dark:text-slate-100 backdrop-blur p-3 shadow-xl">
                                <div className="flex items-center justify-between">
                                    {!isBreakTime && (
                                        <div className="inline-flex items-center rounded-lg dark:bg-slate-800/60 p-0.5">
                                            <button
                                                onClick={() => mode !== 'stopwatch' && handleToggleMode()}
                                                className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-xs transition ${
                                                    !isCountdown
                                                        ? 'dark:bg-sky-500/20 text-sky-300'
                                                        : 'text-slate-300 hover:text-white'
                                                }`}
                                                aria-label="Stopwatch mode"
                                            >
                                                <Clock className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => isCountdown || handleToggleMode()}
                                                className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-xs transition ${
                                                    isCountdown
                                                        ? 'bg-amber-500/20 text-amber-300'
                                                        : 'dark:text-slate-300 dark:hover:text-white hover:bg-gray-600'
                                                }`}
                                                aria-label="Timer mode"
                                            >
                                                <Timer className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    )}
                                    {!isBreakTime && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleProcessRunTimer}
                                            className="h-8 w-8 rounded-full border border-white/10 bg-slate-800/70 hover:bg-slate-700/70"
                                            aria-label={isActive && !isPause ? 'Pause' : 'Start'}
                                        >
                                            {isActive && !isPause ? (
                                                <Pause className="h-4 w-4 text-slate-100" />
                                            ) : (
                                                <Play className="h-4 w-4 text-slate-100" />
                                            )}
                                        </Button>
                                    )}
                                </div>

                                {renderTimer()}

                                {renderButton()}
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
