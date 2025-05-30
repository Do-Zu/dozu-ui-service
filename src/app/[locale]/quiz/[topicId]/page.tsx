'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import AnimationLoading from '@/components/animations/AnimationLoading';

interface Question {
  questionId: number;
  questionText: string;
  choices: string[];
  correctIndex: number;
}

interface Answer {
  questionId: number;
  userAnswer: number;
}

export default function QuizDoPage() {
  const params = useParams();
  const topicId = params.topicId as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    axios.get(`http://localhost:3333/api/question/topic/${topicId}`).then(res => {
      setQuestions(res.data.data ?? []); // nếu dùng SuccessResponse.data
    });
  }, [topicId]);

  const handleSelect = (qid: number, index: number) => {
    setAnswers(prev => ({ ...prev, [qid]: index }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      alert('Bạn chưa trả lời hết các câu hỏi!');
      return;
    }

    const payload: { topicId: number; answers: Answer[] } = {
      topicId: Number(topicId),
      answers: questions.map(q => ({
        questionId: q.questionId,
        userAnswer: answers[q.questionId],
      })),
    };

    try {
      const res = await axios.post('http://localhost:3333/api/question/quiz-results', payload);
      setScore(res.data.data.score);
      setSubmitted(true);
    } catch (err) {
      console.error('Submit failed:', err);
    }
  };

  if (!questions.length) return <AnimationLoading/>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Làm Quiz - Chủ đề {topicId}</h1>

      <ol className="space-y-6">
        {questions.map((q, index) => (
          <li key={q.questionId} className="border p-4 rounded">
            <p className="font-medium mb-2">{index + 1}. {q.questionText}</p>
            <ul className="space-y-1">
              {q.choices.map((choice, i) => (
                <li key={i} className="flex items-center">
                  <input
                    type="radio"
                    name={`question-${q.questionId}`}
                    value={i}
                    disabled={submitted}
                    checked={answers[q.questionId] === i}
                    onChange={() => handleSelect(q.questionId, i)}
                    className="mr-2"
                  />
                  <span>{choice}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="mt-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Nộp bài
        </button>
      ) : (
        <p className="mt-6 text-xl font-semibold text-blue-700">
          Điểm của bạn là {score}
        </p>
      )}
    </div>
  );
}
