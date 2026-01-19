import { useEffect, useMemo, useRef, useState } from 'react';
import { idbPutAudio, idbGetObjectUrl, idbDeleteAudio } from '@/lib/DBIndex/indexedDbAudio';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { useInterval } from '@/hooks/useInterval';
import { cn } from '@/lib/utils';
import useToggle from '@/hooks/useToggle';
import { isNegative, isNumber } from '@/utils/validators';
import {
    CirclePause,
    CirclePlay,
    Clock,
    LucideSkipForward,
    Music2,
    Pause,
    Play,
    RotateCcw,
    Settings2,
    Timer,
    Trash2,
    Upload,
} from 'lucide-react';

import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { toast } from '@/hooks/use-toast';
import useClickOutSide from '@/hooks/useClickOutSide';

export type TypePosition = 'top-center' | 'bottom-center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type TypeMode = 'countdown' | 'stopwatch';
export interface IPropPomodoro {
    position?: TypePosition;
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

type AmbientSound = { id: string; name: string; src: string; builtin: boolean };

// function positionClass(pos: TypePosition) {
//     switch (pos) {
//         case 'top-left':
//             return 'top-4 left-4';
//         case 'top-right':
//             return 'top-4 right-4';
//         case 'bottom-left':
//             return 'bottom-4 left-4';
//         case 'bottom-right':
//             return 'bottom-4 right-4';
//         case 'top-center':
//             return 'top-4 left-1/2 -translate-x-1/2';
//         case 'bottom-center':
//             return 'bottom-4 left-1/2 -translate-x-1/2';
//         default:
//             return 'bottom-4 right-4';
//     }
// }
const defaultAmbient: AmbientSound[] = [
    {
        id: 'rain',
        name: 'Raining',
        src: 'https://pub-1ec2ebb25bae4e50bd19e6b7b25829cc.r2.dev/45%20Minutes%20of%20Light%20Rain%20Sounds%20for%20Focus,%20Relaxing%20and%20Sleep%20%20Epidemic%20Ambience%20-%20YouTube.mp3',
        builtin: true,
    },
    {
        id: 'white-noise',
        name: 'White Noise',
        src: 'https://pub-1ec2ebb25bae4e50bd19e6b7b25829cc.r2.dev/White-Noise-Dozu-Pomodoro.mp3',
        builtin: true,
    },
    {
        id: 'lofi',
        name: 'Lofi',
        src: 'https://pub-1ec2ebb25bae4e50bd19e6b7b25829cc.r2.dev/Lofi-Timer-Dozo-Pomodoro-Deep-Focus.mp3',
        builtin: true,
    },
];

export default function Pomodoro({
    positionX = 0,
    positionY = 0,
    defaultMode = 'countdown',
    times = DEFAULT_MINUTE_COUNT_DOWN,
    breakTime = DEFAULT_MINUTE_BREAK_TIME_COUNT_DOWN,
    className,
}: IPropPomodoro) {
    const tCommon = useTranslations('common');
    const tPomodoro = useTranslations('pomodoro');
    const [mode, toggleMode] = useToggle<TypeMode>(defaultMode);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isActive, setIsActive] = useState<boolean>(false);
    const [isPause, setIsPause] = useState<boolean>(false);
    const [isBreakTime, setIsBreakTime] = useState<boolean>(false);

    // Sound / audio related state

    const LS_SOUNDS_KEY = 'POMODORO_AMBIENT_SOUNDS';
    const LS_SELECTED_SOUND_KEY = 'POMODORO_SELECTED_AMBIENT';
    const LS_VOLUME_KEY = 'POMODORO_VOLUME';
    const LS_PLAY_BREAK_KEY = 'POMODORO_PLAY_DURING_BREAK';
    const LS_DEFAULT_TIME_COUNT_DOWN = 'POMODORO_DEFAULT_TIME_COUNT_DOWN';
    const LS_BREAK_SPECIFIC_ENABLED = 'POMODORO_BREAK_SPECIFIC_ENABLED';
    const LS_BREAK_AMBIENT_ID = 'POMODORO_BREAK_AMBIENT_ID';

    const [ambientSoundsLS, setAmbientSoundsLS] = useLocalStorage<AmbientSound[]>(LS_SOUNDS_KEY, []);
    const [selectedAmbientId, setSelectedAmbientId] = useLocalStorage<string | null>(LS_SELECTED_SOUND_KEY, null);
    const [volumeLS, setVolumeLS] = useLocalStorage<number>(LS_VOLUME_KEY, 0.4);
    const [playDuringBreakVal, setPlayDuringBreakVal] = useLocalStorage<boolean>(LS_PLAY_BREAK_KEY, true);
    const [timerDefaultCount, setTimerDefaultCount] = useLocalStorage<number>(
        LS_DEFAULT_TIME_COUNT_DOWN,
        DEFAULT_MINUTE_COUNT_DOWN,
    );
    const [breakSpecificEnabled, setBreakSpecificEnabled] = useLocalStorage<boolean>(LS_BREAK_SPECIFIC_ENABLED, false);
    const [breakAmbientId, setBreakAmbientId] = useLocalStorage<string | null>(LS_BREAK_AMBIENT_ID, null);

    const ambientSounds: AmbientSound[] = useMemo(() => {
        const custom = ambientSoundsLS && Array.isArray(ambientSoundsLS) ? ambientSoundsLS : [];
        const merged = [...defaultAmbient];
        custom.forEach((s) => {
            if (!merged.find((m) => m.id === s.id)) merged.push(s);
        });
        return merged;
    }, [ambientSoundsLS]);

    const volume: number = typeof volumeLS === 'number' && !isNaN(volumeLS) ? volumeLS : 0.4;
    const playDuringBreak: boolean = typeof playDuringBreakVal === 'boolean' ? playDuringBreakVal : true;
    const [isAmbientPlaying, setIsAmbientPlaying] = useState<boolean>(false);
    const [showSoundPanel, setShowSoundPanel] = useState<boolean>(false);
    const [showSettingsPanel, setShowSettingsPanel] = useState<boolean>(false);
    const [hasWarnedFiveSec, setHasWarnedFiveSec] = useState<boolean>(false);

    const handleClickOutSideCBoxContainer = () => {
        setIsOpen(false);
    };

    const containerRef = useClickOutSide<HTMLDivElement>(handleClickOutSideCBoxContainer);
    const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
    const bellAudioRef = useRef<HTMLAudioElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const customBlobUrlsRef = useRef<string[]>([]);
    const idbObjectUrlRef = useRef<string | null>(null);

    const refSoundPanel = useClickOutSide<HTMLDivElement>(() => setShowSoundPanel(false));
    const refSettingsPanel = useClickOutSide<HTMLDivElement>(() => setShowSettingsPanel(false));

    const [countTimer, setCountTimer] = useState<number>(() =>
        defaultMode === 'countdown' ? (timerDefaultCount ?? times) * 60 : 0,
    );

    const minuteEditRef = useRef<HTMLDivElement>(null);
    const hourEditRef = useRef<HTMLDivElement>(null);

    const [editTimer, setEditTimer] = useState<{
        minute: boolean;
        hour: boolean;
    }>({
        minute: false,
        hour: false,
    });

    //---------- Timer edition logic ---------- //

    const handleClickEditTimer = (type: TypeEditTimer) => {
        setIsActive(false);

        if (mode === 'stopwatch') return;

        setEditTimer({
            minute: type === 'minute',
            hour: type === 'hour',
        });
    };

    const reset = () => {
        setIsActive(false);
        setIsPause(false);
        const defaultUserSettingCountDown = (timerDefaultCount ?? times) * 60; //second
        setCountTimer(mode === 'countdown' ? defaultUserSettingCountDown : 0);
    };

    const handleSkipBreakTime = () => {
        setIsBreakTime(false);
        reset();
    };

    const handleToggleMode = () => {
        toggleMode(mode === 'countdown' ? 'stopwatch' : 'countdown');
        setIsActive(false);
        setIsPause(false);
        const defaultUserSettingCountDown = (timerDefaultCount ?? times) * 60;
        setCountTimer(() => (mode === 'countdown' ? 0 : defaultUserSettingCountDown));
    };

    const validateTimer = () => {
        if (mode == 'countdown' && countTimer <= 0) {
            toast({ description: tPomodoro('timer.setTimeToast') });
            return false;
        }
        return true;
    };

    const handleProcessRunTimer = () => {
        if (!validateTimer()) return;

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
        if (isBreakTime) {
            setIsActive(false);
            setIsBreakTime(false);
            reset();
        } else {
            // Session pomodoro
            toast({
                description: tPomodoro('timer.breakTime'),
            });
            setIsBreakTime(true);
            setCountTimer(breakTime * 60);
            setIsActive(true);
            setIsOpen(true);
            setHasWarnedFiveSec(false);
        }
    };

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

    //---------- Render times ---------- //
    const hours = Math.floor(countTimer / 3600);
    const minutes = Math.floor((countTimer % 3600) / 60);
    const seconds = Math.floor(countTimer % 60);

    const isCountdown = mode === 'countdown';

    const renderTime =
        hours > 0 ? `${pad2(hours)}: ${pad2(minutes)} : ${pad2(seconds)}` : `${pad2(minutes)} : ${pad2(seconds)}`;

    const renderClock = () => {
        if (isOpen) {
            return (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit="exit">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen((v) => !v)}
                        className="size-12 rounded-full border backdrop-blur dark:border-white/10 dark:bg-slate-900/70 "
                        aria-label="Open Pomodoro"
                    >
                        {isCountdown ? (
                            <Timer className="size-4 text-amber-300" />
                        ) : (
                            <Clock className="size-4 text-sky-300" />
                        )}
                    </Button>
                </motion.div>
            );
        }

        return (
            <motion.div
                className="flex items-center justify-center rounded-2xl border p-2 dark:border-white/10  dark:bg-slate-900"
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
                    <div className="flex items-center justify-center gap-2 text-center ">
                        <div className="text-center text-sm  font-semibold tracking-tight">{renderTime}</div>
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
                        className="size-9 rounded-full border backdrop-blur dark:border-white/10 dark:bg-slate-800/70 dark:hover:bg-slate-600/70"
                        aria-label="Open Pomodoro"
                    >
                        {isCountdown ? (
                            <Timer className="size-4 text-amber-300" />
                        ) : (
                            <Clock className="size-4 text-sky-300" />
                        )}
                    </Button>
                </motion.div>
            </motion.div>
        );
    };

    const handleOnChangeTimer = (type: TypeEditTimer, value: string) => {
        if (!isNumber(value)) {
            return toast({ description: tCommon('messages.fillNumberError') });
        }

        if (isNegative(value)) {
            return toast({ description: tCommon('messages.fillNumberPositiveError') });
        }
        const units = parseInt(value, 10);
        const safeUnits = isNaN(units) ? 0 : Math.max(0, units);
        const newHours = type === 'hour' ? safeUnits : hours;
        const newMinutes = type === 'minute' ? safeUnits : minutes;

        const totalSeconds = newHours * 3600 + newMinutes * 60;

        setCountTimer(totalSeconds);
        setTimerDefaultCount(newHours * 60 + newMinutes);
        setHasWarnedFiveSec(false);
    };

    const handleCleanUpAudio = () => {
        if (ambientAudioRef.current) {
            try {
                ambientAudioRef.current.pause();
                ambientAudioRef.current.src = '';
                ambientAudioRef.current.load();
            } catch {
                /* empty */
            }
        }
        if (bellAudioRef.current) {
            try {
                bellAudioRef.current.pause();
                bellAudioRef.current.src = '';
                bellAudioRef.current.load();
            } catch {
                /* empty */
            }
        }
        // Revoke any blob: object URLs we created (legacy approach)
        customBlobUrlsRef.current.forEach((url) => {
            try {
                URL.revokeObjectURL(url);
            } catch {
                /* empty */
            }
        });
        customBlobUrlsRef.current = [];
        if (idbObjectUrlRef.current) {
            try {
                URL.revokeObjectURL(idbObjectUrlRef.current);
            } catch {
                //
            }
            idbObjectUrlRef.current = null;
        }
    };

    //        ---------- Audio logic ---------- //

    // Initialize defaults merge & bell audio
    useEffect(() => {
        bellAudioRef.current = new Audio(
            'https://pub-1ec2ebb25bae4e50bd19e6b7b25829cc.r2.dev/School%20Bell%20Sound%20Effect%20No%20Copyright%20-%20YouTube.mp3',
        );
        bellAudioRef.current.preload = 'auto';

        return () => {
            handleCleanUpAudio();
        };
    }, []);

    // keep volumes in sync
    useEffect(() => {
        if (ambientAudioRef.current) ambientAudioRef.current.volume = volume;
        if (bellAudioRef.current) bellAudioRef.current.volume = Math.min(1, volume + 0.15);
    }, [volume]);

    // derive current ambient id (support break-specific)
    const currentAmbientId = useMemo(
        () => (isBreakTime && breakSpecificEnabled ? breakAmbientId || selectedAmbientId : selectedAmbientId),
        [isBreakTime, breakSpecificEnabled, breakAmbientId, selectedAmbientId],
    );

    // Initialize / switch ambient audio (handles IndexedDB lazy object URL)
    useEffect(() => {
        const id = currentAmbientId;
        if (!id) {
            if (ambientAudioRef.current) ambientAudioRef.current.pause();
            return;
        }
        const selected = ambientSounds.find((s) => s.id === id);
        if (!selected) return;
        const prepare = async () => {
            let src = selected.src;
            if (src.startsWith('indexeddb:')) {
                const realId = src.replace('indexeddb:', '');
                if (idbObjectUrlRef.current) {
                    try {
                        URL.revokeObjectURL(idbObjectUrlRef.current);
                    } catch {
                        /* empty */
                    }
                    idbObjectUrlRef.current = null;
                }
                try {
                    const objUrl = await idbGetObjectUrl(realId);
                    if (objUrl) {
                        idbObjectUrlRef.current = objUrl;
                        src = objUrl;
                    } else {
                        toast({ description: tPomodoro('ambient.notFound') });
                        return;
                    }
                } catch {
                    toast({ description: tPomodoro('ambient.loadFailed') });
                    return;
                }
            }
            if (!ambientAudioRef.current) {
                ambientAudioRef.current = new Audio(src);
            } else {
                ambientAudioRef.current.src = src;
            }
            ambientAudioRef.current.loop = true;
            ambientAudioRef.current.volume = volume;
            if (isActive && !isPause && (!isBreakTime || playDuringBreak || (isBreakTime && breakSpecificEnabled))) {
                ambientAudioRef.current
                    .play()
                    .then(() => setIsAmbientPlaying(true))
                    .catch(() => setIsAmbientPlaying(false));
            }
        };
        prepare();
    }, [currentAmbientId]);

    // Play / pause ambient when state changes
    useEffect(() => {
        const audio = ambientAudioRef.current;
        if (!audio) return;
        if (
            isActive &&
            !isPause &&
            currentAmbientId &&
            (!isBreakTime || playDuringBreak || (isBreakTime && breakSpecificEnabled))
        ) {
            audio
                .play()
                .then(() => setIsAmbientPlaying(true))
                .catch(() => setIsAmbientPlaying(false));
        } else {
            audio.pause();
            setIsAmbientPlaying(false);
        }
    }, [isActive, isPause, isBreakTime, playDuringBreak, breakSpecificEnabled, currentAmbientId]);

    // Five-second warning bell
    useEffect(() => {
        if (!isActive || isPause) return;
        if (!isBreakTime && mode === 'countdown') {
            if (countTimer === 5 && !hasWarnedFiveSec) {
                if (bellAudioRef.current) {
                    bellAudioRef.current.currentTime = 0;
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    bellAudioRef.current.play().catch(() => {});
                }
                setHasWarnedFiveSec(true);
            } else if (countTimer > 5 && hasWarnedFiveSec) {
                // reset flag if user extends / edits time
                setHasWarnedFiveSec(false);
            }
        }
    }, [countTimer, isActive, isPause, mode, isBreakTime, hasWarnedFiveSec]);

    // Upload custom sound
    const MAX_CUSTOM_SOUND_SIZE_MB = 30; // allow larger when using IndexedDB
    const LARGE_FILE_THRESHOLD_MB = 5; // switch to IndexedDB for files larger than this

    const fileToDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleUploadSound = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || !files.length) return;

        const file = files[0];
        const id = `${file.name}-${file.size}`; // stable id for dedup
        // Prevent duplicates by name+size

        if (ambientSoundsLS?.some((s) => s.id === id && !s.builtin)) {
            toast({ description: tPomodoro('ambient.soundAdded') });
            e.target.value = '';
            return;
        }

        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > MAX_CUSTOM_SOUND_SIZE_MB) {
            toast({ description: tPomodoro('ambient.tooLarge', { max: MAX_CUSTOM_SOUND_SIZE_MB }) });
            e.target.value = '';
            return;
        }
        const baseName = file.name.replace(/\.[^.]+$/, '');
        let src: string | null = null;
        if (sizeMB > LARGE_FILE_THRESHOLD_MB) {
            try {
                await idbPutAudio(id, baseName, file);
                src = `indexeddb:${id}`;
            } catch {
                toast({ description: tPomodoro('ambient.indexedDbFallback') });
            }
        }
        if (!src) {
            try {
                // For small files only; larger go to IDB above
                src = await fileToDataUrl(file);
            } catch {
                try {
                    const url = URL.createObjectURL(file);
                    customBlobUrlsRef.current.push(url);
                    src = url;
                } catch {
                    toast({ description: tPomodoro('ambient.uploadFailed') });
                    e.target.value = '';
                    return;
                }
            }
        }
        const newSound: AmbientSound = { id, name: baseName, src, builtin: false };
        const updated = [...(ambientSoundsLS || []), newSound];
        setAmbientSoundsLS(updated.filter((s) => !s.builtin));
        setSelectedAmbientId(id);
        setShowSoundPanel(true);
        e.target.value = '';
    };

    const handleRemoveCustomSound = (id: string) => {
        setAmbientSoundsLS((prev) => {
            const list = prev && Array.isArray(prev) ? prev : [];
            const target = list.find((s) => s.id === id);
            // Revoke only if it was a blob (legacy); data URLs do not need revocation
            if (target && !target.builtin && target.src.startsWith('blob:')) {
                try {
                    URL.revokeObjectURL(target.src);
                } catch {
                    /* empty */
                }
            }
            if (target && target.src.startsWith('indexeddb:')) {
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                idbDeleteAudio(id).catch(() => {});
            }
            const next = list.filter((s) => s.id !== id);
            if (selectedAmbientId === id) setSelectedAmbientId(null);
            if (breakAmbientId === id) setBreakAmbientId(null);
            return next;
        });
    };

    const toggleAmbientPlay = () => {
        if (!selectedAmbientId) return;
        const audio = ambientAudioRef.current;
        if (!audio) return;
        if (isAmbientPlaying) {
            audio.pause();
            setIsAmbientPlaying(false);
        } else {
            audio
                .play()
                .then(() => setIsAmbientPlaying(true))
                .catch(() => setIsAmbientPlaying(false));
        }
    };

    const handleSelectAmbient = (id: string) => {
        if (isBreakTime && breakSpecificEnabled) {
            if (id === breakAmbientId) {
                toggleAmbientPlay();
                return;
            }
            setBreakAmbientId(id);
            return;
        }
        if (id === selectedAmbientId) {
            toggleAmbientPlay();
            return;
        }
        setSelectedAmbientId(id);
    };

    const renderSoundPanel = () => {
        if (!showSoundPanel) return null;
        return (
            <motion.div
                ref={refSoundPanel}
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className="absolute left-0 top-12 z-[100] w-60"
            >
                <Card className="rounded-lg border p-2 backdrop-blur dark:border-white/10 dark:bg-slate-900/95">
                    <div className="mb-1 flex items-center justify-between px-1">
                        <span className="text-xs font-semibold text-slate-300">
                            {isBreakTime && breakSpecificEnabled
                                ? tPomodoro('ambient.panelTitleBreak')
                                : tPomodoro('ambient.panelTitle')}
                        </span>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-md p-1 text-slate-400 hover:bg-slate-700/40 hover:text-slate-100"
                            aria-label="Upload sound"
                        >
                            <Upload className="size-3.5" />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            onChange={handleUploadSound}
                        />
                    </div>
                    <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
                        {ambientSounds.map((s) => {
                            const activeId = isBreakTime && breakSpecificEnabled ? breakAmbientId : selectedAmbientId;
                            const isSel = s.id === activeId;
                            return (
                                <div
                                    key={s.id}
                                    className={cn(
                                        'group flex items-center justify-between gap-2 rounded-md px-2 py-1 text-xs cursor-pointer transition',
                                        isSel
                                            ? 'bg-amber-500/20 text-amber-200'
                                            : 'dark:text-slate-300 hover:bg-slate-700/40',
                                    )}
                                    onClick={() => handleSelectAmbient(s.id)}
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        {isSel ? (
                                            isAmbientPlaying ? (
                                                <CirclePause className="size-3.5" />
                                            ) : (
                                                <CirclePlay className="size-3.5" />
                                            )
                                        ) : (
                                            <Music2 className="size-3.5 opacity-60" />
                                        )}
                                        <span className="max-w-[120px] truncate">{s.name}</span>
                                    </div>
                                    {!s.builtin && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveCustomSound(s.id);
                                            }}
                                            className="rounded p-1 text-red-300 opacity-0 hover:bg-red-500/20 group-hover:opacity-100"
                                            aria-label="Remove sound"
                                        >
                                            <Trash2 className="size-3" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                        {ambientSounds.length === 0 && (
                            <div className="p-2 text-[10px] text-slate-400">{tPomodoro('ambient.noSounds')}</div>
                        )}
                    </div>
                </Card>
            </motion.div>
        );
    };

    const renderSettingsPanel = () => {
        if (!showSettingsPanel) return null;
        return (
            <motion.div
                ref={refSettingsPanel}
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-12 z-[100] w-60"
            >
                <Card className="space-y-3 rounded-lg border p-3 backdrop-blur dark:border-white/10 dark:bg-slate-900/95">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300">{tPomodoro('settings.title')}</span>
                        <span className="text-[10px] text-slate-500">{tPomodoro('settings.version')}</span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-300">
                            <span>{tPomodoro('settings.volume')}</span>
                            <span>{Math.round(volume * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={volume}
                            onChange={(e) => setVolumeLS(parseFloat(e.target.value))}
                            className="w-full cursor-pointer accent-amber-400"
                            aria-label="Ambient volume"
                        />
                    </div>
                    <label className="flex cursor-pointer select-none items-center gap-2 text-[11px] text-slate-300">
                        <input
                            type="checkbox"
                            checked={playDuringBreak}
                            onChange={(e) => setPlayDuringBreakVal(e.target.checked)}
                            className="accent-amber-400"
                        />
                        <span>{tPomodoro('settings.playDuringBreak')}</span>
                    </label>
                    <label className="flex cursor-pointer select-none items-center gap-2 text-[11px] text-slate-300">
                        <input
                            type="checkbox"
                            checked={breakSpecificEnabled}
                            onChange={(e) => setBreakSpecificEnabled(e.target.checked)}
                            className="accent-amber-400"
                        />
                        <span>{tPomodoro('settings.distinctBreakAmbient')}</span>
                    </label>
                    {breakSpecificEnabled && (
                        <div className="text-[11px] text-slate-400">{tPomodoro('settings.distinctHelp')}</div>
                    )}
                    <button
                        onClick={() => {
                            setSelectedAmbientId(null);
                            setBreakAmbientId(null);
                            setVolumeLS(0.4);
                            setPlayDuringBreakVal(true);
                            setBreakSpecificEnabled(false);
                            setIsAmbientPlaying(false);
                        }}
                        className="mt-1 w-full rounded-md bg-slate-800/60 py-1 text-[11px] text-slate-300 hover:bg-slate-700/60 hover:text-white"
                    >
                        {tPomodoro('settings.resetDefaults')}
                    </button>
                </Card>
            </motion.div>
        );
    };

    // Close panels when clicking outside
    const panelContainerRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (!showSoundPanel && !showSettingsPanel) return;
        const handler = (e: MouseEvent) => {
            if (!panelContainerRef.current) return;
            if (!panelContainerRef.current.contains(e.target as Node)) {
                setShowSoundPanel(false);
                setShowSettingsPanel(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showSoundPanel, showSettingsPanel]);

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
                    <input
                        autoFocus
                        inputMode="numeric"
                        pattern="[0-9]*"
                        aria-label={type === 'hour' ? 'Edit hours' : 'Edit minutes'}
                        className="m-0 w-full border-none bg-transparent p-0 text-center text-2xl font-semibold tracking-tight caret-amber-300 focus:outline-none focus:ring-0"
                        value={times}
                        onChange={(e) => handleOnChangeTimer(type, e.target.value)}
                        onBlur={() => setEditTimer((prev) => ({ ...prev, [type]: false }))}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                (e.target as HTMLInputElement).blur();
                            } else if (e.key === 'Escape') {
                                e.preventDefault();
                                setEditTimer((prev) => ({ ...prev, [type]: false }));
                            } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                                // Increment / decrement convenience
                                e.preventDefault();
                                const numeric = parseInt(times, 10) || 0;
                                const delta = e.key === 'ArrowUp' ? 1 : -1;
                                const next = Math.max(0, numeric + delta);
                                handleOnChangeTimer(type, String(next).padStart(2, '0'));
                            }
                        }}
                    />
                );
            return <span className="inline-block w-full select-none">{times}</span>;
        };

        return (
            <div
                ref={type == 'minute' ? minuteEditRef : hourEditRef}
                onClick={() => !editTimer[type] && handleClickEditTimer(type)}
                className={cn(
                    'rounded-md border dark:border-white/10 dark:bg-slate-800/60 py-2 flex flex-col items-center justify-center transition-all select-none',
                    editTimer[type] ? 'cursor-pointer ring-1 ring-amber-300/40 shadow-inner' : 'cursor-default',
                )}
                style={{ minHeight: '70px' }}
            >
                <div className="flex h-8 w-full items-center justify-center text-2xl font-semibold leading-none tracking-tight">
                    {renderEditMode()}
                </div>
                <div className="mt-1 text-[10px] uppercase text-slate-400">{prefix}</div>
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

                    <div className="mt-1 text-center text-sm font-semibold text-slate-400">
                        {pad2(seconds)} {tPomodoro('timer.secSuffix')}
                    </div>
                </>
            );

        return (
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-md border py-2 dark:border-white/10 dark:bg-slate-800/60">
                    <div className="text-2xl font-semibold tracking-tight">{pad2(minutes)}</div>
                    <div className="text-[10px] uppercase text-slate-400">{tPomodoro('timer.minLabel')}</div>
                </div>
                <div className="rounded-md border py-2 dark:border-white/10 dark:bg-slate-800/60">
                    <div className="text-2xl font-semibold tracking-tight">{pad2(seconds)}</div>
                    <div className="text-[10px] uppercase text-slate-400">{tPomodoro('timer.secSuffix')}</div>
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
                    <RotateCcw className="size-3.5" />
                    {isCountdown ? tPomodoro('timer.resetTimer') : tPomodoro('timer.resetStopwatch')}
                </button>
            );

        return (
            <button
                onClick={handleSkipBreakTime}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-transparent py-1.5 text-xs dark:text-slate-300 dark:hover:text-slate-100"
                aria-label="Skip"
            >
                <LucideSkipForward className="size-3.5" />
                {tPomodoro('timer.skip')}
            </button>
        );
    };

    // --------------------------- Draggable logic --------------------------- //
    const [dragPos, setDragPos] = useState<{ x: number; y: number }>({ x: positionX, y: positionY });
    const dragRef = useRef<HTMLDivElement | null>(null);
    const dragDataRef = useRef<{
        startPointerX: number;
        startPointerY: number;
        startX: number;
        startY: number;
        dragging: boolean;
    }>({ startPointerX: 0, startPointerY: 0, startX: 0, startY: 0, dragging: false });

    const handlePointerDown = (e: React.PointerEvent) => {
        // Left button only & ignore if starting on interactive elements
        if (e.button !== 0) return;
        const target = e.target as HTMLElement;
        if (
            target.closest(
                'button, input, textarea, select, [role="button"], [contenteditable="true"], a, svg, path, audio',
            )
        ) {
            return; // do not start drag when interacting with controls
        }
        dragDataRef.current.startPointerX = e.clientX;
        dragDataRef.current.startPointerY = e.clientY;
        dragDataRef.current.startX = dragPos.x;
        dragDataRef.current.startY = dragPos.y;
        dragDataRef.current.dragging = true;

        // Add listeners on window to track outside bounds
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp, { once: true });
    };

    const handlePointerMove = (e: PointerEvent) => {
        if (!dragDataRef.current.dragging) return;
        const dx = e.clientX - dragDataRef.current.startPointerX;
        const dy = e.clientY - dragDataRef.current.startPointerY;
        setDragPos({ x: dragDataRef.current.startX + dx, y: dragDataRef.current.startY + dy });
    };

    const handlePointerUp = () => {
        dragDataRef.current.dragging = false;
        window.removeEventListener('pointermove', handlePointerMove);
    };

    useEffect(() => {
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, []);

    const isDragging = dragDataRef.current.dragging;

    return (
        <motion.div
            className={cn(`select-none mx-2`, isDragging && 'cursor-grabbing', !isDragging && 'cursor-grab', className)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            ref={dragRef}
            onPointerDown={handlePointerDown}
            style={{ touchAction: 'none' }}
        >
            <div>
                {renderClock()}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            ref={containerRef}
                            initial={{ opacity: 0, scale: 0.98, y: 6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 6 }}
                            transition={{ duration: 0.25 }}
                            className="absolute z-50 mt-2 w-64 "
                        >
                            <Card className="rounded-3xl border p-3 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/90 dark:text-slate-100">
                                <div className="relative flex items-center justify-between" ref={panelContainerRef}>
                                    {!isBreakTime && (
                                        <div className="inline-flex items-center rounded-lg p-0.5 dark:bg-slate-800/60">
                                            <button
                                                onClick={() => mode !== 'stopwatch' && handleToggleMode()}
                                                className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-xs transition ${
                                                    !isCountdown
                                                        ? 'text-sky-300 dark:bg-sky-500/20'
                                                        : 'text-slate-300 hover:text-white'
                                                }`}
                                                aria-label="Stopwatch mode"
                                            >
                                                <Clock className="size-3.5" />
                                            </button>
                                            <button
                                                onClick={() => isCountdown || handleToggleMode()}
                                                className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-xs transition ${
                                                    isCountdown
                                                        ? 'bg-amber-500/20 text-amber-300'
                                                        : 'hover:bg-gray-600 dark:text-slate-300 dark:hover:text-white'
                                                }`}
                                                aria-label="Timer mode"
                                            >
                                                <Timer className="size-3.5" />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        {!isBreakTime && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleProcessRunTimer}
                                                className="size-8 rounded-full border border-white/10 bg-slate-800/70 hover:bg-slate-700/70"
                                                aria-label={isActive && !isPause ? 'Pause' : 'Start'}
                                            >
                                                {isActive && !isPause ? (
                                                    <Pause className="size-4 text-slate-100" />
                                                ) : (
                                                    <Play className="size-4 text-slate-100" />
                                                )}
                                            </Button>
                                        )}
                                        <button
                                            onClick={() => {
                                                setShowSoundPanel((v) => !v);
                                                setShowSettingsPanel(false);
                                            }}
                                            aria-label="Ambient sounds"
                                            className={cn(
                                                'h-8 w-8 flex items-center justify-center rounded-full border border-white/10 bg-slate-800/70 hover:bg-slate-700/70 transition',
                                                showSoundPanel && 'ring-1 ring-amber-300/40',
                                            )}
                                        >
                                            <Music2 className="size-4 text-slate-100" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowSettingsPanel((v) => !v);
                                                setShowSoundPanel(false);
                                            }}
                                            aria-label="Settings"
                                            className={cn(
                                                'h-8 w-8 flex items-center justify-center rounded-full border border-white/10 bg-slate-800/70 hover:bg-slate-700/70 transition',
                                                showSettingsPanel && 'ring-1 ring-amber-300/40',
                                            )}
                                        >
                                            <Settings2 className="size-4 text-slate-100" />
                                        </button>
                                        {selectedAmbientId && (
                                            <button
                                                onClick={toggleAmbientPlay}
                                                aria-label={isAmbientPlaying ? 'Pause ambient' : 'Play ambient'}
                                                className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-slate-800/70 transition hover:bg-slate-700/70"
                                            >
                                                {isAmbientPlaying ? (
                                                    <CirclePause className="size-4 text-slate-100" />
                                                ) : (
                                                    <CirclePlay className="size-4 text-slate-100" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                    <AnimatePresence>{renderSoundPanel()}</AnimatePresence>
                                    <AnimatePresence>{renderSettingsPanel()}</AnimatePresence>
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
