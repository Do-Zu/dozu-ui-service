'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

type Variant = 'half' | 'full';

type Props = {
  open: boolean;
  variant: Variant;
  percentLabel: number;         
  showCatchUp?: boolean;         
  onConfirmHalf?: () => void;    // half
  onConfirmOnlySecond?: () => void; // full 
  onConfirmCatchUpAll?: () => void; // full
  onSkip: () => void;
};

export default function QuickQuizPrompt({
  open,
  variant,
  percentLabel,
  showCatchUp = true,
  onConfirmHalf,
  onConfirmOnlySecond,
  onConfirmCatchUpAll,
  onSkip,
}: Props) {
  const isHalf = variant === 'half';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed top-4 inset-x-0 z-[70] flex justify-center pointer-events-none">
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="pointer-events-auto w-[min(720px,92vw)]"
          >
            <div className="rounded-2xl p-[1px] bg-gradient-to-r from-sky-500/50 via-indigo-500/50 to-blue-500/50 shadow-xl dark:shadow-[0_10px_40px_-10px_rgba(59,130,246,0.45)]">
              <div className="rounded-2xl backdrop-blur-xl ring-1 ring-sky-600/15 dark:ring-sky-400/25 bg-white/95 dark:bg-gradient-to-br dark:from-slate-950/90 dark:via-indigo-950/80 dark:to-sky-950/80">
                <div className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-sky-600 dark:text-sky-300 dark:drop-shadow-[0_0_12px_rgba(56,189,248,0.55)]" />
                    <div className="font-extrabold tracking-tight text-slate-900 dark:text-sky-100">
                      {isHalf ? (
                        <>You’ve completed {percentLabel}% of the content</>
                      ) : (
                        <>You’ve completed {percentLabel}% of the content</>
                      )}
                    </div>
                  </div>

                  <p className="mt-2 text-[15px] leading-6 text-slate-700 dark:text-sky-200/85">
                    {isHalf
                      ? 'Create a quick quiz based on what you just learned?'
                      : (showCatchUp
                          ? 'Choose what to quiz now: only the new half, or everything you’ve learned so far.'
                          : 'Create a quick quiz for the remaining half?')}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {isHalf ? (
                      <>
                        <Button
                          size="sm"
                          onClick={onConfirmHalf}
                          className="bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 text-white shadow-lg hover:brightness-110 hover:shadow-[0_12px_40px_-12px_rgba(56,189,248,0.6)] focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ring-offset-white dark:ring-offset-slate-950"
                        >
                          Take quiz
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={onSkip}
                          className="border-sky-600/30 text-sky-700 hover:bg-sky-50 dark:border-sky-400/40 dark:text-sky-200 dark:hover:bg-sky-400/10"
                        >
                          Later
                        </Button>
                      </>
                    ) : (
                      <>
                        {showCatchUp ? (
                          <>
                            <Button
                              size="sm"
                              onClick={onConfirmCatchUpAll}
                              className="bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 text-white shadow-lg hover:brightness-110 hover:shadow-[0_12px_40px_-12px_rgba(56,189,248,0.6)] focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ring-offset-white dark:ring-offset-slate-950"
                            >
                              Quiz everything so far
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={onConfirmOnlySecond}
                              className="border-sky-600/30 text-sky-700 hover:bg-sky-50 dark:border-sky-400/40 dark:text-sky-200 dark:hover:bg-sky-400/10"
                            >
                              Only the new half
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={onSkip}
                              className="text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-400/10"
                            >
                              Later
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              onClick={onConfirmOnlySecond}
                              className="bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 text-white shadow-lg hover:brightness-110 hover:shadow-[0_12px_40px_-12px_rgba(56,189,248,0.6)] focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ring-offset-white dark:ring-offset-slate-950"
                            >
                              Take quiz (remaining half)
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={onSkip}
                              className="border-sky-600/30 text-sky-700 hover:bg-sky-50 dark:border-sky-400/40 dark:text-sky-200 dark:hover:bg-sky-400/10"
                            >
                              Later
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
