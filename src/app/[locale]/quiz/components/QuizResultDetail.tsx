import { Card } from '@/components/ui/card';

interface QuestionDetail {
  questionId: number;
  questionText: string;
  choices: string[];
  correctIndex: number;
  userAnswerCorrect: boolean;
  userAnswerIndex: number | null;
}

interface QuizResultDetailProps {
  quizResult: {
    quizResultId: number;
    quizId: number;
    correctAnswersCount: number;
    questionsCount: number;
    timeReviewed: string;
    questions: QuestionDetail[];
  };
}

const QuizResultDetail = ({ quizResult }: QuizResultDetailProps) => {
  const { questions, correctAnswersCount, questionsCount, timeReviewed } = quizResult;
  const scorePercent = Math.round((correctAnswersCount / questionsCount) * 100);
  const reviewedAt = new Date(timeReviewed).toLocaleString('vi-VN');

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        <p>
          Correct: <span className="font-medium">{correctAnswersCount}</span> / {questionsCount}
        </p>
        <p>
          Accuracy: <span className="font-semibold">{scorePercent}%</span>
        </p>
        <p>Reviewed on: {reviewedAt}</p>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => {
          return (
            <Card
              key={question.questionId}
              className={`border-2 ${
                question.userAnswerCorrect ? 'border-green-500' : 'border-red-500'
              }`}
            >
              <div className="p-4 space-y-2">
                <div className="text-sm font-medium">
                  <span className="text-muted-foreground mr-2">Question {index + 1}:</span>
                  {question.questionText}
                </div>

                <div className="space-y-1">
                  {question.choices.map((choice, choiceIndex) => {
                    const isCorrect = choiceIndex === question.correctIndex;
                    const isUserAnswer = choiceIndex === question.userAnswerIndex;
                    const isWrongSelection = isUserAnswer && !isCorrect;

                    return (
                      <div
                        key={choiceIndex}
                        className={`
                          rounded px-3 py-2 text-sm border
                          ${isCorrect ? 'bg-green-100 border-green-400 text-green-900' : ''}
                          ${isWrongSelection ? 'bg-red-100 border-red-400 text-red-900' : ''}
                          ${!isCorrect && !isWrongSelection ? 'border-muted text-foreground' : ''}
                        `}
                      >
                        {choice}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default QuizResultDetail;
