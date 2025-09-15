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
    const tPomodoro = useTranslations('pomodoro');
    const [mode, toggleMode] = useToggle<TypeMode>(defaultMode);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isActive, setIsActive] = useState<boolean>(false);
    const [isPause, setIsPause] = useState<boolean>(false);
    const [isBreakTime, setIsBreakTime] = useState<boolean>(false);

    // Sound / audio related state
    type AmbientSound = { id: string; name: string; src: string; builtin: boolean };
    const LS_SOUNDS_KEY = 'POMODORO_AMBIENT_SOUNDS';
    const LS_SELECTED_SOUND_KEY = 'POMODORO_SELECTED_AMBIENT';
    const LS_VOLUME_KEY = 'POMODORO_VOLUME';
    const LS_PLAY_BREAK_KEY = 'POMODORO_PLAY_DURING_BREAK';
    const LS_DEFAULT_TIME_COUNT_DOWN = 'POMODORO_DEFAULT_TIME_COUNT_DOWN';
    const LS_BREAK_SPECIFIC_ENABLED = 'POMODORO_BREAK_SPECIFIC_ENABLED';
    const LS_BREAK_AMBIENT_ID = 'POMODORO_BREAK_AMBIENT_ID';

    //DEFAULT SOUNDs
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

    //---------- Click outside container ---------- //
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
        setCountTimer(() => (mode === 'countdown' ? 0 : countTimer));
    };

    const validateTimer = () => {
        if (countTimer <= 0) {
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
        // Break time mode
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

    //---------- UI Element in Box  ---------- //
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
        if (!isNumber(value)) {
            return toast({ description: tCommon('messages.fillNumberError') });
        }

        if (isNegative(value)) {
            return toast({ description: tCommon('messages.fillNumberPositiveError') });
        }

        const minute = parseFloat(value);

        const seconds = type === 'minute' ? minute * 60 : minute * 60 * 60;

        setCountTimer(seconds);
        setTimerDefaultCount(minute);
        setHasWarnedFiveSec(false);
    };

    const handleCleanUpAudio = () => {
        if (ambientAudioRef.current) {
            try {
                ambientAudioRef.current.pause();
                ambientAudioRef.current.src = '';
                ambientAudioRef.current.load();
            } catch {}
        }
        if (bellAudioRef.current) {
            try {
                bellAudioRef.current.pause();
                bellAudioRef.current.src = '';
                bellAudioRef.current.load();
            } catch {}
        }
        // Revoke any blob: object URLs we created (legacy approach)
        customBlobUrlsRef.current.forEach((url) => {
            try {
                URL.revokeObjectURL(url);
            } catch {}
        });
        customBlobUrlsRef.current = [];
        if (idbObjectUrlRef.current) {
            try {
                URL.revokeObjectURL(idbObjectUrlRef.current);
            } catch {}
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
                    } catch {}
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
        const id = `${file.name}-${file.size}-${Date.now()}`;
        // Prevent duplicates by name+size
        if (ambientSounds.some((s) => s.id.startsWith(file.name) && !s.builtin)) {
            toast({ description: tPomodoro('ambient.soundAdded') });
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
                } catch {}
            }
            if (target && target.src.startsWith('indexeddb:')) {
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
                className="absolute top-12 left-0 w-60 z-[100]"
            >
                <Card className="p-2 rounded-lg border dark:border-white/10 dark:bg-slate-900/95 backdrop-blur">
                    <div className="flex items-center justify-between mb-1 px-1">
                        <span className="text-xs font-semibold text-slate-300">
                            {isBreakTime && breakSpecificEnabled
                                ? tPomodoro('ambient.panelTitleBreak')
                                : tPomodoro('ambient.panelTitle')}
                        </span>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-700/40"
                            aria-label="Upload sound"
                        >
                            <Upload className="h-3.5 w-3.5" />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            onChange={handleUploadSound}
                        />
                    </div>
                    <div className="max-h-48 overflow-y-auto pr-1 space-y-1">
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
                                                <CirclePause className="h-3.5 w-3.5" />
                                            ) : (
                                                <CirclePlay className="h-3.5 w-3.5" />
                                            )
                                        ) : (
                                            <Music2 className="h-3.5 w-3.5 opacity-60" />
                                        )}
                                        <span className="truncate max-w-[120px]">{s.name}</span>
                                    </div>
                                    {!s.builtin && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveCustomSound(s.id);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-red-300"
                                            aria-label="Remove sound"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                        {ambientSounds.length === 0 && (
                            <div className="text-[10px] text-slate-400 px-2 py-2">{tPomodoro('ambient.noSounds')}</div>
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
                className="absolute top-12 right-0 w-60 z-[100]"
            >
                <Card className="p-3 rounded-lg border dark:border-white/10 dark:bg-slate-900/95 backdrop-blur space-y-3">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-semibold">{tPomodoro('settings.title')}</span>
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
                            className="w-full accent-amber-400 cursor-pointer"
                            aria-label="Ambient volume"
                        />
                    </div>
                    <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={playDuringBreak}
                            onChange={(e) => setPlayDuringBreakVal(e.target.checked)}
                            className="accent-amber-400"
                        />
                        <span>{tPomodoro('settings.playDuringBreak')}</span>
                    </label>
                    <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer select-none">
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
                        className="w-full text-[11px] mt-1 rounded-md bg-slate-800/60 hover:bg-slate-700/60 py-1 text-slate-300 hover:text-white"
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
                        className="w-full bg-transparent text-center focus:outline-none focus:ring-0 border-none p-0 m-0 text-2xl font-semibold tracking-tight caret-amber-300"
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
                <div className="text-2xl font-semibold tracking-tight leading-none h-8 flex items-center justify-center w-full">
                    {renderEditMode()}
                </div>
                <div className="text-[10px] uppercase text-slate-400 mt-1">{prefix}</div>
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
                        {pad2(seconds)} {tPomodoro('timer.secSuffix')}
                    </div>
                </>
            );

        return (
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-md border dark:border-white/10 dark:bg-slate-800/60 py-2">
                    <div className="text-2xl font-semibold tracking-tight">{pad2(minutes)}</div>
                    <div className="text-[10px] uppercase text-slate-400">{tPomodoro('timer.minLabel')}</div>
                </div>
                <div className="rounded-md border dark:border-white/10 dark:bg-slate-800/60 py-2">
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
                    <RotateCcw className="h-3.5 w-3.5" />
                    {isCountdown ? tPomodoro('timer.resetTimer') : tPomodoro('timer.resetStopwatch')}
                </button>
            );

        return (
            <button
                onClick={handleSkipBreakTime}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-transparent py-1.5 text-xs dark:text-slate-300 dark:hover:text-slate-100"
                aria-label="Skip"
            >
                <LucideSkipForward className="h-3.5 w-3.5" />
                {tPomodoro('timer.skip')}
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
                            ref={containerRef}
                            initial={{ opacity: 0, scale: 0.98, y: 6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 6 }}
                            transition={{ duration: 0.25 }}
                            className="absolute z-50 mt-2 w-64 left-[-6em]"
                        >
                            <Card className="rounded-xl border dark:border-white/10 dark:bg-slate-900/90 dark:text-slate-100 backdrop-blur p-3 shadow-xl">
                                <div className="flex items-center justify-between relative" ref={panelContainerRef}>
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
                                    <div className="flex items-center gap-1">
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
                                            <Music2 className="h-4 w-4 text-slate-100" />
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
                                            <Settings2 className="h-4 w-4 text-slate-100" />
                                        </button>
                                        {selectedAmbientId && (
                                            <button
                                                onClick={toggleAmbientPlay}
                                                aria-label={isAmbientPlaying ? 'Pause ambient' : 'Play ambient'}
                                                className="h-8 w-8 flex items-center justify-center rounded-full border border-white/10 bg-slate-800/70 hover:bg-slate-700/70 transition"
                                            >
                                                {isAmbientPlaying ? (
                                                    <CirclePause className="h-4 w-4 text-slate-100" />
                                                ) : (
                                                    <CirclePlay className="h-4 w-4 text-slate-100" />
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
