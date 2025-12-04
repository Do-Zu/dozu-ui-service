'use client';

import { useParams, useRouter } from 'next/navigation';
import ClassQuizDraftEditor from '@/app/[locale]/class-based/(class-quiz)/components/ClassQuizDraftEditor';
import classQuizTeacherService from '@/app/[locale]/class-based/(class-quiz)/services/classQuizTeacher.service';
import { IDraftJson, IUpsertDraftResp } from '@/app/[locale]/class-based/(class-quiz)/types/classQuiz.type';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { ROUTES } from '@/utils/constants/routes';

export default function EditClassQuizPage() {
    const { id, classQuizId } = useParams<{ id: string; classQuizId: string }>();
    const router = useRouter();
    const quizId = Number(classQuizId);

    const [initialDraft, setInitialDraft] = useState<IDraftJson | undefined>(undefined);
    const [initialTitle, setInitialTitle] = useState<string | undefined>(undefined);
    const [initialContent, setInitialContent] = useState<string | undefined>(undefined);
    const [initialStartAt, setInitialStartAt] = useState<string | null | undefined>(undefined);
    const [initialEndAt, setInitialEndAt] = useState<string | null | undefined>(undefined);
    const [initialDurationSeconds, setInitialDurationSeconds] = useState<number | null | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    // Load draft và quiz info
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                // Load draft và quiz info song song
                const [draftResult, quizResult] = await Promise.allSettled([
                    classQuizTeacherService.getDraft(quizId),
                    classQuizTeacherService.getClassQuiz(quizId).catch(() => null), 
                ]);

                if (!mounted) return;

                // Xử lý draft
                if (draftResult.status === 'fulfilled') {
                    setInitialDraft(draftResult.value.draftJson ?? undefined);
                } else {
                    // Nếu không có draft thì để undefined => editor sẽ tạo 3 câu trống mặc định
                    setInitialDraft(undefined);
                }

                // Xử lý quiz info
                if (quizResult.status === 'fulfilled' && quizResult.value) {
                    setInitialTitle(quizResult.value.title);
                    setInitialContent(quizResult.value.content);
                    setInitialStartAt(quizResult.value.startAt ?? null);
                    setInitialEndAt(quizResult.value.endAt ?? null);
                    setInitialDurationSeconds(quizResult.value.durationSeconds ?? null);
                }
            } catch (e: any) {
                toast({ title: 'Không tải được thông tin quiz', description: e?.message, variant: 'destructive' });
            } finally {
                mounted && setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [quizId]);

    const handleSaved = (r: IUpsertDraftResp) => {
        // update UI/telemetry (none))
    };
    const handlePublished = () => {
        router.push(ROUTES.TEACHER.CLASS_BASED_ID_CLASS_QUIZ_LIST(Number(id)));
    };

    if (loading) {
        return (
            <div className="container mx-auto py-8 max-w-5xl">
                <div>Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-5xl">
            <h1 className="text-2xl font-bold mb-4">Edit Quiz #{quizId}</h1>
            <ClassQuizDraftEditor
                key={initialDraft ? JSON.stringify([initialDraft.orderSeed, initialDraft.items?.length]) : 'empty'}
                quizId={quizId}
                initialDraft={initialDraft}
                initialTitle={initialTitle}
                initialContent={initialContent}
                initialStartAt={initialStartAt}
                initialEndAt={initialEndAt}
                initialDurationSeconds={initialDurationSeconds}
                onSaved={handleSaved}
                onPublished={handlePublished}
            />
        </div>
    );
}
