'use client';

import QuizCard from '../ui/QuizCard';
import { QuizHistoryItem } from '../../../hooks/useQuizWorkspace';

interface Props {
    items: QuizHistoryItem[];
    onSelect: (item: QuizHistoryItem) => void;
}

export default function QuizHistoryList({ items, onSelect }: Props) {
    if (items.length === 0) {
        return <p className="text-sm text-muted-foreground">No quiz has been taken yet.</p>;
    }

    return (
        <div className="space-y-3">
            {items.map((quiz) => (
                <QuizCard
                    key={quiz.quizResultId}
                    quizId={quiz.quizId}
                    quizTitle={quiz.quizTitle || `Quiz #${quiz.quizId}`}
                    correctAnswersCount={quiz.correctAnswersCount}
                    questionsCount={quiz.questionsCount}
                    timeReviewed={quiz.timeReviewed}
                    onClick={() => onSelect(quiz)}
                />
            ))}
        </div>
    );
}
