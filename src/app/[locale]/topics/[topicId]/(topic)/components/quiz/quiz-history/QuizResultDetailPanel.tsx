'use client';

import { Button } from '@/components/ui/button';
import QuizResultDetail from '@/app/[locale]/quiz/components/QuizResultDetail';

interface Props {
    quizDetail: any | null;
    loading: boolean;
    onBack: () => void;
}

export default function QuizResultDetailPanel({ quizDetail, loading, onBack }: Props) {
    return (
        <div className="px-4 py-4">
            <Button variant="outline" className="mb-4" onClick={onBack}>
                ← Back
            </Button>

            {loading ? (
                <div className="text-muted-foreground">Loading quiz detail...</div>
            ) : !quizDetail ? (
                <div className="text-muted-foreground">No quiz detail available.</div>
            ) : (
                <>
                    <h2 className="text-xl font-semibold mb-4">
                        {quizDetail.name || 'Quiz Detail'}
                    </h2>
                    <QuizResultDetail quizResult={quizDetail} />
                </>
            )}
        </div>
    );
}
