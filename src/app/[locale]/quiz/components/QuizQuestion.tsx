import { useState } from 'react';

interface QuizQuestionProps {
  questionText: string;
  choices: string[];
  onAnswerSelect: (selectedIndex: number) => void;
}

const QuizQuestion = ({ questionText, choices, onAnswerSelect }: QuizQuestionProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
    onAnswerSelect(index);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl mx-auto mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">{questionText}</h3>
      {choices.map((choice, index) => (
        <div key={index} className="flex items-center space-x-4 mb-4">
          <input
            type="radio"
            name={`question-${questionText}`}
            checked={selectedAnswer === index}
            onChange={() => handleAnswerSelect(index)}
            className="form-radio text-blue-600 h-5 w-5"
          />
          <label className="text-lg text-gray-700">{choice}</label>
        </div>
      ))}
    </div>
  );
};

export default QuizQuestion;
