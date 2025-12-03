'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, CalendarClock, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import QuestionCard from '@/app/[locale]/question/components/QuestionCard';
import { IQuestion } from '@/app/[locale]/question/types/question.type';
import { toDraftJsonFromQuestions, toQuestionsFromDraftJson } from '../utils/draftJson.mapper';
import classQuizTeacherService from '../services/classQuizTeacher.service';
import { IDraftJson, IUpsertDraftResp } from '../types/classQuiz.type';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useUserSession } from '@/app/[locale]/auth/hooks/useUserSession';
import QuestionImportModal from '@/app/[locale]/topics/[topicId]/(topic)/components/quiz/import/QuestionImportModal';
import { IQuestionPreview } from '@/app/[locale]/topics/[topicId]/(topic)/components/quiz/import/QuestionPreview';
import { Import } from 'lucide-react';

const questionsJump = 3;
const createInitialQuestion = (id: number): IQuestion => ({
    id,
    questionText: '',
    choices: ['', '', '', ''],
    correctIndex: 0,
});

// helpers for datetime-local
const toLocalInputValue = (iso?: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    // convert UTC -> local để hiển thị đúng cho input datetime-local
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60_000);
    return local.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
};

const toIsoFromLocalInput = (value: string): string | null => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    // datetime-local được hiểu là local, toISOString() sẽ convert sang UTC chuẩn
    return d.toISOString();
};

type Props = {
    quizId: number;
    initialDraft?: IDraftJson;
    initialTitle?: string;
    initialContent?: string;
    initialStartAt?: string | null;
    initialEndAt?: string | null;
    initialDurationSeconds?: number | null;

    onSaved?(r: IUpsertDraftResp): void;
    onPublished?(): void;
};

export default function ClassQuizDraftEditor({
    quizId,
    initialDraft,
    initialTitle,
    initialContent,
    initialStartAt,
    initialEndAt,
    initialDurationSeconds,
    onSaved,
    onPublished,
}: Props) {
    const { user } = useUserSession();
    const teacherId = Number(user?.userId);

    const [questions, setQuestions] = useState<IQuestion[]>(
        initialDraft
            ? toQuestionsFromDraftJson(initialDraft)
            : Array.from({ length: questionsJump }, (_, i) => createInitialQuestion(i)),
    );
    const [seed, setSeed] = useState<string>(initialDraft?.orderSeed ?? '');
    const [title, setTitle] = useState<string>(initialTitle ?? '');
    const [content, setContent] = useState<string>(initialContent ?? '');
    const [saving, setSaving] = useState(false);
    const [savedMeta, setSavedMeta] = useState<IUpsertDraftResp | null>(null);
    const [isImportOpen, setIsImportOpen] = useState(false);

    // state for start / end / duration
    const [startAtLocal, setStartAtLocal] = useState<string>(initialStartAt ? toLocalInputValue(initialStartAt) : '');
    const [endAtLocal, setEndAtLocal] = useState<string>(initialEndAt ? toLocalInputValue(initialEndAt) : '');
    const [durationMinutes, setDurationMinutes] = useState<string>(
        initialDurationSeconds && initialDurationSeconds > 0 ? String(Math.round(initialDurationSeconds / 60)) : '',
    );

    useEffect(() => {
        if (!initialDraft) {
            setQuestions(Array.from({ length: questionsJump }, (_, i) => createInitialQuestion(i)));
            setSeed('');
            setSavedMeta(null);
            return;
        }
        setQuestions(toQuestionsFromDraftJson(initialDraft));
        setSeed(initialDraft.orderSeed ?? '');
        setSavedMeta(null);
    }, [initialDraft]);

    useEffect(() => {
        if (initialTitle !== undefined) setTitle(initialTitle);
        if (initialContent !== undefined) setContent(initialContent);
    }, [initialTitle, initialContent]);

    // hydrate time/duration
    useEffect(() => {
        if (initialStartAt !== undefined) {
            setStartAtLocal(initialStartAt ? toLocalInputValue(initialStartAt) : '');
        }
        if (initialEndAt !== undefined) {
            setEndAtLocal(initialEndAt ? toLocalInputValue(initialEndAt) : '');
        }
        if (initialDurationSeconds !== undefined) {
            setDurationMinutes(
                initialDurationSeconds && initialDurationSeconds > 0
                    ? String(Math.round(initialDurationSeconds / 60))
                    : '',
            );
        }
    }, [initialStartAt, initialEndAt, initialDurationSeconds]);

    const hasAllValidQuestions = (list: IQuestion[]) => {
        if (!list.length) return false;
        return list.every((q) => {
            const textOK = q.questionText.trim().length > 0;
            const nonEmpty = q.choices.filter((c) => (c ?? '').trim().length > 0);
            const enough = nonEmpty.length >= 2;
            const lower = nonEmpty.map((c) => c.toLowerCase());
            const dup = new Set(lower).size !== lower.length;
            const ciOK =
                q.correctIndex >= 0 &&
                q.correctIndex < q.choices.length &&
                (q.choices[q.correctIndex] ?? '').trim().length > 0;
            return textOK && enough && !dup && ciOK;
        });
    };

    /** events */
    const addQuestions = () => {
        const lastId = questions.length ? Math.max(...questions.map((q) => q.id)) : -1;
        const more = Array.from({ length: questionsJump }, (_, i) => createInitialQuestion(lastId + i + 1));
        setQuestions((prev) => [...prev, ...more]);
    };

    const handleAddQuestionsImported = (imported: IQuestionPreview[]) => {
        // 1. Remove empty initial questions
        let cleaned = [...questions].filter(
            (q) => q.questionText.trim() !== '' || q.choices.some((c) => (c ?? '').trim() !== ''),
        );

        // 2. Determine next id
        const lastId = cleaned.length > 0 ? Math.max(...cleaned.map((q) => q.id)) : -1;

        // 3. Convert imported list into IQuestion[]
        const newItems: IQuestion[] = imported.map((item, idx) => ({
            id: lastId + idx + 1,
            questionText: item.questionText,
            choices: item.choices,
            correctIndex: item.correctIndex,
        }));

        // 4. Update state
        setQuestions([...cleaned, ...newItems]);

        // Close modal
        setIsImportOpen(false);
    };

    const onChangeText = (idx: number, text: string) => {
        setQuestions((prev) =>
            prev.map((q, i) =>
                i === idx
                    ? {
                          ...q,
                          questionText: text,
                          serverInfo: q.serverInfo ? { ...q.serverInfo, isUpdated: true } : q.serverInfo,
                      }
                    : q,
            ),
        );
    };
    const onChangeChoice = (qIdx: number, cIdx: number, text: string) => {
        setQuestions((prev) =>
            prev.map((q, i) => {
                if (i !== qIdx) return q;
                const choices = [...q.choices];
                choices[cIdx] = text;
                return {
                    ...q,
                    choices,
                    serverInfo: q.serverInfo ? { ...q.serverInfo, isUpdated: true } : q.serverInfo,
                };
            }),
        );
    };
    const onChangeCorrectIndex = (qIdx: number, correctIdx: number) => {
        setQuestions((prev) =>
            prev.map((q, i) =>
                i === qIdx
                    ? {
                          ...q,
                          correctIndex: correctIdx,
                          serverInfo: q.serverInfo ? { ...q.serverInfo, isUpdated: true } : q.serverInfo,
                      }
                    : q,
            ),
        );
    };
    const onDelete = (id: number) => {
        setQuestions((prev) =>
            prev
                .map((q) =>
                    q.id !== id ? q : q.serverInfo ? { ...q, serverInfo: { ...q.serverInfo, isDeleted: true } } : q,
                )
                .filter((q) => q),
        );
    };

    async function saveDraft(): Promise<boolean> {
        if (!teacherId) {
            toast({ title: 'You need to log in', variant: 'destructive' });
            return false;
        }
        if (!title.trim()) {
            toast({ title: 'Please enter quiz name', variant: 'destructive' });
            return false;
        }
        if (!hasAllValidQuestions(questions)) {
            toast({
                title: 'Invalid question',
                description: 'Each question needs a title, ≥2 valid answers, no duplicates and a correct answer.',
                variant: 'destructive',
            });
            return false;
        }

        // convert datetime-local & duration before calling API
        const startAtIso = toIsoFromLocalInput(startAtLocal);
        const endAtIso = toIsoFromLocalInput(endAtLocal);
        const durationSeconds = durationMinutes && Number(durationMinutes) > 0 ? Number(durationMinutes) * 60 : null;

        setSaving(true);
        try {
            // 1. Save draft questions
            const draftJson = toDraftJsonFromQuestions(questions, seed || undefined);
            const r = await classQuizTeacherService.upsertDraft(quizId, { teacherId, draftJson });

            // 2. Save title, content, window & duration
            await classQuizTeacherService.updateSettings(quizId, {
                title: title.trim(),
                content: content.trim(),
                startAt: startAtIso,
                endAt: endAtIso,
                durationSeconds,
            });

            setSavedMeta(r);
            onSaved?.(r);
            toast({ title: `Draft saved (v${r.version})` });
            return true;
        } catch (e: any) {
            toast({
                title: 'Error saving draft',
                description: e?.message || 'Try again',
                variant: 'destructive',
            });
            return false;
        } finally {
            setSaving(false);
        }
    }

    async function publish() {
        const startAtIso = toIsoFromLocalInput(startAtLocal);
        const endAtIso = toIsoFromLocalInput(endAtLocal);
        const durationSeconds = durationMinutes && Number(durationMinutes) > 0 ? Number(durationMinutes) * 60 : null;

        if (!startAtIso || !endAtIso || !durationSeconds) {
            toast({
                title: 'Missing schedule info',
                description: 'Please set Start, End and Duration before publishing.',
                variant: 'destructive',
            });
            return;
        }

        const startDate = new Date(startAtIso);
        const endDate = new Date(endAtIso);

        // 2. Check start < end
        if (startDate >= endDate) {
            toast({
                title: 'Invalid time window',
                description: 'Start time must be before end time.',
                variant: 'destructive',
            });
            return;
        }

        // 3. Check durationSeconds <= endAt - startAt
        const windowSeconds = (endDate.getTime() - startDate.getTime()) / 1000;
        if (durationSeconds > windowSeconds) {
            toast({
                title: 'Invalid duration',
                description: 'Duration must be less than or equal to the quiz time window.',
                variant: 'destructive',
            });
            return;
        }

        // 4. Save draft + settings first, if fail then don't publish
        const ok = await saveDraft();
        if (!ok) return;

        // 5. Publish
        try {
            await classQuizTeacherService.publish(quizId);
            toast({ title: 'Published quiz' });
            onPublished?.();
        } catch (e: any) {
            toast({ title: 'Publish failed', description: e?.message, variant: 'destructive' });
        }
    }

    // schedule
    async function scheduleQuiz() {
        const startAtIso = toIsoFromLocalInput(startAtLocal);
        const endAtIso = toIsoFromLocalInput(endAtLocal);

        if (!startAtIso || !endAtIso) {
            toast({
                title: 'Please select start & end time',
                variant: 'destructive',
            });
            return;
        }
        if (new Date(startAtIso) >= new Date(endAtIso)) {
            toast({
                title: 'Invalid time window',
                description: 'Start time must be before end time.',
                variant: 'destructive',
            });
            return;
        }

        try {
            await classQuizTeacherService.schedule(quizId, {
                startAt: startAtIso,
                endAt: endAtIso,
            });
            toast({ title: 'Quiz scheduled' });
        } catch (e: any) {
            toast({
                title: 'Scheduling failed',
                description: e?.message || 'Try again',
                variant: 'destructive',
            });
        }
    }

    return (
        <div className="space-y-4">
            {/* Quiz Title and Content Section */}
            <div className="space-y-4 p-4 border rounded-lg bg-card">
                <div className="space-y-2">
                    <Label htmlFor="quiz-title">Name Quiz *</Label>
                    <Input
                        id="quiz-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter name quiz..."
                        className="w-full"
                        maxLength={255}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="quiz-content">Content Quiz</Label>
                    <Textarea
                        id="quiz-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Enter content quiz (optional)..."
                        className="w-full min-h-[100px]"
                    />
                </div>

                {/* NEW: Start / End / Duration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="quiz-start-at">Start at</Label>
                        <Input
                            id="quiz-start-at"
                            type="datetime-local"
                            value={startAtLocal}
                            onChange={(e) => setStartAtLocal(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quiz-end-at">End at</Label>
                        <Input
                            id="quiz-end-at"
                            type="datetime-local"
                            value={endAtLocal}
                            onChange={(e) => setEndAtLocal(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quiz-duration">Duration (minutes)</Label>
                        <Input
                            id="quiz-duration"
                            type="number"
                            min={1}
                            placeholder="e.g. 30"
                            value={durationMinutes}
                            onChange={(e) => {
                                const v = e.target.value.replace(/[^\d]/g, '');
                                setDurationMinutes(v);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Actions and Settings */}
            <div className="flex items-center gap-3 flex-wrap">
                {/* <Input
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          placeholder="orderSeed (optional)"
          className="max-w-sm"
        /> */}
                <Button
                    variant="outline"
                    onClick={() => setIsImportOpen(true)}
                    className="border-primary/40 text-primary hover:bg-primary/5"
                >
                    <Import className="w-4 h-4 mr-2" />
                    Import Questions
                </Button>

                <Button onClick={saveDraft} disabled={saving || !hasAllValidQuestions(questions) || !title.trim()}>
                    <Save className="mr-2 h-4 w-4" /> Save Draft
                </Button>
                <Button
                    variant="secondary"
                    onClick={publish}
                    disabled={!hasAllValidQuestions(questions) || !title.trim()}
                >
                    <Send className="mr-2 h-4 w-4" /> Publish
                </Button>
                <Button variant="outline" onClick={scheduleQuiz}>
                    <CalendarClock className="mr-2 h-4 w-4" /> Schedule
                </Button>
            </div>

            {savedMeta ? (
                <div className="text-sm text-muted-foreground">
                    Draft v{savedMeta.version} — saved at {new Date(savedMeta.updatedAt).toLocaleString()}
                </div>
            ) : null}

            <QuestionImportModal
                isOpen={isImportOpen}
                setIsOpen={setIsImportOpen}
                onSubmit={handleAddQuestionsImported}
            />
            {/* Questions List */}

            <div className="grid grid-cols-12 gap-8 mt-2">
                {questions
                    .filter((q) => !q.serverInfo?.isDeleted)
                    .map((q, idx) => (
                        <QuestionCard
                            key={q.id}
                            question={q}
                            index={idx}
                            allQuestions={questions}
                            onChangeText={onChangeText}
                            onChangeChoice={onChangeChoice}
                            onChangeCorrectIndex={onChangeCorrectIndex}
                            onDelete={onDelete}
                        />
                    ))}
                <div className="col-span-12 flex justify-center">
                    <Button onClick={addQuestions}>+ Add Questions</Button>
                </div>
            </div>
        </div>
    );
}
