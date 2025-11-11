// app/[locale]/class-based/(class-quiz)/[id]/[classQuizId]/edit/page.tsx
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

  // (optional) nếu muốn load draft hiện có từ BE thì thêm endpoint service; ở đây để sẵn state:
  const [initialDraft, setInitialDraft] = useState<IDraftJson | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // TODO: gọi API load draft nếu bạn có endpoint; nếu chưa, bỏ useEffect này
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await classQuizTeacherService.getDraft(quizId);
        if (!mounted) return;
        // Nếu chưa có draft thì để undefined => editor sẽ tạo 3 câu trống mặc định
        setInitialDraft(r.draftJson ?? undefined);
      } catch (e:any) {
        toast({ title: 'Không tải được bản nháp', description: e?.message, variant: 'destructive' });
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [quizId]);

  const handleSaved = (r: IUpsertDraftResp) => {
    // Bạn có thể cập nhật UI/telemetry ở đây
  };
  const handlePublished = () => {
    // điều hướng về danh sách quiz của lớp
    router.push(ROUTES.TEACHER.CLASS_BASED_ID_CLASS_QUIZ_LIST(Number(id)));
  };

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-4">Edit Quiz #{quizId}</h1>
      <ClassQuizDraftEditor
        key={initialDraft ? JSON.stringify([initialDraft.orderSeed, initialDraft.items?.length]) : 'empty'}
        quizId={quizId}
        initialDraft={initialDraft}
        onSaved={handleSaved}
        onPublished={handlePublished}
      />
    </div>
  );
}
