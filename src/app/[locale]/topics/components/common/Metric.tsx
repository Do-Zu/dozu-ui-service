const Metric = ({ label, value, tone }: { label: string; value: number; tone?: 'warning' | 'info' | 'accent' }) => {
    const palette: Record<string, string> = {
        warning: 'from-amber-500 to-orange-500 dark:from-amber-400/80 dark:to-orange-400/80',
        info: 'from-sky-600 to-cyan-600 dark:from-sky-400/80 dark:to-cyan-400/80',
        accent: 'from-violet-600 to-indigo-600 dark:from-violet-400/80 dark:to-indigo-400/80',
    };
    const defaultGradient = 'from-indigo-700 to-cyan-700 dark:from-indigo-300/80 dark:to-cyan-300/80';
    const gradient = tone ? palette[tone] : defaultGradient;
    return (
        <div className="relative group overflow-hidden rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm p-3 flex flex-col gap-1">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-slate-100/80 to-transparent dark:from-white/5" />
            <span className="text-[0.65rem] uppercase tracking-wide text-slate-500 font-medium dark:text-slate-400/80">
                {label}
            </span>
            <span className={`text-base font-semibold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                {value}
            </span>
        </div>
    );
};

export default Metric;
