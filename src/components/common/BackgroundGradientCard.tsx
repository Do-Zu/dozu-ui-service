'use client';

import React from 'react';

export const BackgroundGradientCard: React.FC = React.memo(() => (
    <div aria-hidden className="h-full pointer-events-none absolute inset-0 overflow-hidden select-none rounded-xl">
        {/* Base subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90" />

        {/* Soft radial glow center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20rem] h-[20rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent_75%)] blur-2xl" />

        {/* Accent blobs (subtle) */}
        <div className="absolute -top-8 -left-8 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-400/20 via-sky-400/15 to-cyan-300/15 dark:from-indigo-500/15 dark:via-sky-500/10 dark:to-cyan-400/10 blur-2xl opacity-60" />
        <div className="absolute top-1/4 -right-8 h-40 w-40 rounded-full bg-gradient-to-br from-cyan-400/15 via-fuchsia-400/10 to-indigo-400/15 dark:from-cyan-500/10 dark:via-fuchsia-500/8 dark:to-indigo-500/10 blur-2xl opacity-50" />

        {/* Soft bottom sheen */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-24 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.06),transparent_80%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.04),transparent_85%)]" />
    </div>
));

BackgroundGradientCard.displayName = 'BackgroundGradientCard';

