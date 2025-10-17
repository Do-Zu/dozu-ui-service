'use client';

const isDevelopment = process.env.NODE_ENV === 'development';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    const showDebugInfo = isDevelopment && (error?.message || error?.digest || error?.stack);

    return (
        <html>
            <body className="min-h-screen bg-slate-950 text-slate-100">
                <div className="flex min-h-screen items-center justify-center px-6 py-12">
                    <section className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/80 p-10 shadow-2xl backdrop-blur">
                        <header className="flex items-center justify-between gap-4">
                            <h1 className="text-3xl font-semibold">Something went wrong</h1>
                            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                                Error
                            </span>
                        </header>
                        <p className="mt-4 text-sm leading-relaxed text-slate-300">
                            {isDevelopment
                                ? 'Review the debug details below to help resolve the issue before retrying.'
                                : 'We ran into an unexpected issue. Please try again or reach out if it keeps happening.'}
                        </p>
                        {showDebugInfo && (
                            <div className="mt-6 space-y-2 rounded-2xl bg-slate-950/60 p-5 text-xs text-slate-400">
                                {error?.message && (
                                    <p className="font-medium text-slate-300">Message: {error.message}</p>
                                )}
                                {error?.digest && <p className="text-slate-500">Digest: {error.digest}</p>}
                                {error?.stack && (
                                    <details className="text-left">
                                        <summary className="cursor-pointer font-medium text-slate-300">
                                            Stack trace
                                        </summary>
                                        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-slate-500">
                                            {error.stack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}
                        <footer className="mt-8 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => reset()}
                                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                                Try again
                            </button>
                        </footer>
                    </section>
                </div>
            </body>
        </html>
    );
}
