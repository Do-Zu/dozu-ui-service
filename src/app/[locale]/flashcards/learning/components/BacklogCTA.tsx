'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

type Props = {
  count: number;             
  onClick: () => void;       
  className?: string;
  labelOverride?: string;   
  ctaText?: string;         
};

export default function BacklogCTA({
  count,
  onClick,
  className,
  labelOverride,
  ctaText = 'Catch up',
}: Props) {
  if (count <= 0) return null;

  const unit = count === 1 ? 'deferred card' : 'deferred cards';
  const label = labelOverride ?? unit;

  return (
    <div className={`fixed top-4 right-4 z-[65] pointer-events-none ${className ?? ''}`}>
      <motion.button
        type="button"
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        onClick={onClick}
        className="group relative pointer-events-auto rounded-2xl p-[1px]
                   shadow-[0_12px_40px_-16px_rgba(67,56,202,0.45)]
                   hover:shadow-[0_16px_50px_-14px_rgba(59,130,246,0.55)]
                   focus:outline-none"
        aria-label="Catch up deferred cards"
      >
        {/* Galaxy rim */}
        <div
          className="absolute inset-0 rounded-2xl opacity-90 blur-[1px]"
          style={{
            background:
              'conic-gradient(from 0deg at 50% 50%, #38bdf8, #a78bfa, #f472b6, #38bdf8)',
          }}
        />

        {/* Glass chip */}
        <div className="relative flex items-center gap-2 rounded-2xl
                        bg-white/90 dark:bg-slate-950/75 backdrop-blur-xl
                        ring-1 ring-white/30 dark:ring-sky-400/20
                        px-3.5 py-2">
          {/* tiny stars */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-45 mix-blend-screen"
            style={{
              backgroundImage: `
                radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,.7), transparent 60%),
                radial-gradient(1.6px 1.6px at 78% 42%, rgba(255,255,255,.55), transparent 60%),
                radial-gradient(1.8px 1.8px at 42% 78%, rgba(255,255,255,.5), transparent 60%),
                radial-gradient(1.4px 1.4px at 65% 20%, rgba(255,255,255,.45), transparent 60%)
              `,
            }}
          />

          <Sparkles className="h-[15px] w-[15px] text-sky-500 drop-shadow-[0_0_10px_rgba(56,189,248,0.65)]" />
          <span className="text-[13px] leading-none font-medium text-slate-800 dark:text-sky-100">
            You have <span className="font-bold">{count}</span> {label}
          </span>

          {/* CTA chip */}
          <span
            className="ml-1 rounded-full bg-gradient-to-r
                       from-sky-500 via-fuchsia-500 to-indigo-500
                       px-2 py-[3px] text-[11px] font-semibold text-white shadow-sm
                       group-hover:brightness-110"
          >
            {ctaText}
          </span>
        </div>
      </motion.button>
    </div>
  );
}
