'use client';
import { Button } from '@/components/ui/button';

interface QuizTypeSelectorProps {
    onSelectQuizType: (type: string) => void;
}

const QuizTypeSelector = ({ onSelectQuizType }: QuizTypeSelectorProps) => {
    const handleSelectQuizType = (type: string) => {
        onSelectQuizType(type);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Button
                onClick={() => handleSelectQuizType('initial')}
                className="w-full py-4 px-6 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
                Initial
            </Button>
            <Button
                onClick={() => handleSelectQuizType('review')}
                className="w-full py-4 px-6 text-lg font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
                Review
            </Button>
            <Button
                onClick={() => handleSelectQuizType('ef-low')}
                className="w-full py-4 px-6 text-lg font-semibold text-white bg-yellow-600 hover:bg-yellow-700 rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
                EF Low
            </Button>
            <Button
                onClick={() => handleSelectQuizType('new')}
                className="w-full py-4 px-6 text-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
                New
            </Button>
            <Button
                onClick={() => handleSelectQuizType('random')}
                className="w-full py-4 px-6 text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
                Random
            </Button>
            <Button
                onClick={() => handleSelectQuizType('wrong')}
                className="w-full py-4 px-6 text-lg font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
                Wrong
            </Button>
        </div>
    );
};

export default QuizTypeSelector;
