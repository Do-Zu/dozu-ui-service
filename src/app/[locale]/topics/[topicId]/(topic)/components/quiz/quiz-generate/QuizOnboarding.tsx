'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

import QuizTypeAccordion from './QuizTypeAccordion';

interface QuizOnboardingProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface StepItem {
    step: string;
    text: string;
    list?: string[];
    note?: {
        title: string;
        list: string[];
    };
}

interface PriorityItem {
    title: string;
    text: string;
}

export default function QuizOnboarding({ open, onOpenChange }: QuizOnboardingProps) {
    const t = useTranslations('quizOnboarding');

    const steps = t.raw('sections.steps.items') as StepItem[];
    const priorities = t.raw('sections.priority.items') as PriorityItem[];
    const notes = t.raw('sections.notes.items') as string[];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                    <DialogDescription>{t('description')}</DialogDescription>
                </DialogHeader>

                {/* Quiz Types */}
                <div className="mt-4 space-y-2">
                    <QuizTypeAccordion />
                </div>

                {/* About Recommendations */}
                <div className="mt-6 rounded-lg border bg-muted/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <b className="text-sm">{t('about.title')}</b>
                        <span className="text-xs text-muted-foreground">{t('about.subtitle')}</span>
                    </div>

                    <div className="mt-3 max-h-[42vh] overflow-y-auto pr-2 text-sm leading-relaxed">
                        <p
                            className="text-muted-foreground"
                            dangerouslySetInnerHTML={{
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                __html: t.raw('intro.text') as string,
                            }}
                        />

                        <div className="mt-4 space-y-3">
                            {/* Steps */}
                            <SectionTitle>{t('sections.steps.title')}</SectionTitle>

                            {steps.map((step, idx) => (
                                <StepBlock key={idx} step={step.step}>
                                    <p
                                        // eslint-disable-next-line @typescript-eslint/naming-convention
                                        dangerouslySetInnerHTML={{ __html: step.text }}
                                    />

                                    {step.list && (
                                        <ul className="mt-2 list-disc pl-5 text-muted-foreground">
                                            {step.list.map((li, i) => (
                                                <li
                                                    key={i}
                                                    // eslint-disable-next-line @typescript-eslint/naming-convention
                                                    dangerouslySetInnerHTML={{ __html: li }}
                                                />
                                            ))}
                                        </ul>
                                    )}

                                    {step.note && (
                                        <div className="mt-2 rounded-md border bg-background/60 p-3 text-muted-foreground">
                                            <b className="text-foreground">{step.note.title}</b>
                                            <ul className="mt-2 list-disc pl-5">
                                                {step.note.list.map((li, i) => (
                                                    <li
                                                        key={i}
                                                        // eslint-disable-next-line @typescript-eslint/naming-convention
                                                        dangerouslySetInnerHTML={{ __html: li }}
                                                    />
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </StepBlock>
                            ))}

                            <Divider />

                            {/* Priority */}
                            <SectionTitle>{t('sections.priority.title')}</SectionTitle>

                            {priorities.map((item, idx) => (
                                <InfoRow key={idx} title={item.title}>
                                    <div
                                        // eslint-disable-next-line @typescript-eslint/naming-convention
                                        dangerouslySetInnerHTML={{ __html: item.text }}
                                    />
                                </InfoRow>
                            ))}

                            <Divider />

                            {/* Notes */}
                            <SectionTitle>{t('sections.notes.title')}</SectionTitle>
                            <ul className="list-disc pl-5 text-muted-foreground">
                                {notes.map((note, idx) => (
                                    <li
                                        key={idx}
                                        // eslint-disable-next-line @typescript-eslint/naming-convention
                                        dangerouslySetInnerHTML={{ __html: note }}
                                    />
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

/* ----------------------------- UI blocks ----------------------------- */

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <div className="text-sm font-semibold text-foreground">{children}</div>;
}

function Divider() {
    return <div className="my-4 h-px w-full bg-border" />;
}

function StepBlock({ step, children }: { step: string; children: React.ReactNode }) {
    return (
        <div className="rounded-lg border bg-background/60 p-3">
            <div className="text-sm font-semibold">{step}</div>
            <div className="mt-1 text-sm text-muted-foreground">{children}</div>
        </div>
    );
}

function InfoRow({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-lg border bg-background/60 p-3">
            <div className="text-sm font-semibold">{title}</div>
            <div className="mt-1 text-sm text-muted-foreground">{children}</div>
        </div>
    );
}
