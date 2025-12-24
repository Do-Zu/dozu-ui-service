'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

const COLORS: Record<string, string> = {
    initial: 'bg-blue-600',
    new: 'bg-purple-600',
    learning: 'bg-indigo-600',
    review: 'bg-green-600',
    weak: 'bg-yellow-600',
    wrong: 'bg-red-600',
};

interface QuizTypeItem {
    label: string;
    summary: string;
    detail: string; // HTML string
}

export default function QuizTypeAccordion() {
    const t = useTranslations('quizOnboarding');
    const [openKey, setOpenKey] = useState<string | null>(null);

    // ✅ ĐÚNG: lấy object "types"
    const types = t.raw('types') as Record<string, QuizTypeItem>;

    return (
        <div className="space-y-2">
            {Object.entries(types).map(([key, item]) => {
                const open = openKey === key;

                return (
                    <div key={key} className="rounded-lg border bg-background">
                        <button
                            type="button"
                            onClick={() => setOpenKey(open ? null : key)}
                            className="flex w-full items-center justify-between px-4 py-3 text-left"
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className={cn(
                                        'flex h-7 w-24 items-center justify-center rounded-md text-xs font-semibold text-white',
                                        COLORS[key],
                                    )}
                                >
                                    {item.label}
                                </span>

                                <span className="text-sm text-muted-foreground">{item.summary}</span>
                            </div>

                            <ChevronDown
                                className={cn(
                                    'h-4 w-4 transition-transform text-muted-foreground',
                                    open && 'rotate-180',
                                )}
                            />
                        </button>

                        {open && (
                            <div
                                className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground"
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                dangerouslySetInnerHTML={{ __html: item.detail }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
