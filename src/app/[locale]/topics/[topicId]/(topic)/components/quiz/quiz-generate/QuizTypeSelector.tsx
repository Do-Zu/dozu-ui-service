'use client';
import { Button } from '@/components/ui/button';

type QuizType = 'initial' | 'new' | 'learning' | 'review' | 'wrong' | 'weak';

interface QuizTypeSelectorProps {
  onSelectQuizType: (type: QuizType) => void;
  disabledMap?: Partial<Record<QuizType, boolean>>;
  counts?: Partial<Record<QuizType, number>>;
  loading?: boolean;
}

const QuizTypeSelector = ({
  onSelectQuizType,
  disabledMap = {},
  counts = {},
  loading = false,
}: QuizTypeSelectorProps) => {
  const makeBtn = (type: QuizType, label: string, className: string) => {
    const disabled = Boolean(disabledMap[type]) || loading;
    const count = counts[type];

    return (
      <Button
        key={type}
        onClick={() => onSelectQuizType(type)}
        disabled={disabled}
        className={`w-full py-4 px-6 text-lg font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105 ${className}
          ${disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}`}
        title={
          disabled
            ? loading
              ? 'Checking availability...'
              : 'No questions available for this type'
            : undefined
        }
      >
        <div className="flex w-full items-center justify-between">
          <span>{label}</span>
          <span className="text-sm opacity-90">
            {loading ? '...' : (typeof count === 'number' ? count : '')}
          </span>
        </div>
      </Button>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {makeBtn('initial', 'Initial', 'text-white bg-blue-600 hover:bg-blue-700')}
      {makeBtn('new', 'New', 'text-white bg-purple-600 hover:bg-purple-700')}
      {makeBtn('learning', 'Learning', 'text-white bg-indigo-600 hover:bg-indigo-700')}
      {makeBtn('review', 'Review', 'text-white bg-green-600 hover:bg-green-700')}
      {makeBtn('weak', 'Weak', 'text-white bg-yellow-600 hover:bg-yellow-700')}
      {makeBtn('wrong', 'Wrong', 'text-white bg-red-600 hover:bg-red-700')}
    </div>
  );
};

export default QuizTypeSelector;
