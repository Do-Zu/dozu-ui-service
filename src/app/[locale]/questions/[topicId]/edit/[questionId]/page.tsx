// File: src/app/questions/[topicId]/edit/[questionId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

export default function EditQuestionPage() {
  const { topicId, questionId } = useParams<{ topicId: string; questionId: string }>();
  const router = useRouter();

  const [questionText, setQuestionText] = useState('');
  const [choices, setChoices] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/questions/${questionId}`);
        setQuestionText(res.data.questionText);
        setChoices(res.data.choices);
        setCorrectIndex(res.data.correctIndex);
      } catch (err) {
        setError('Không thể tải dữ liệu câu hỏi');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [questionId]);

  const handleChoiceChange = (index: number, value: string) => {
    const updated = [...choices];
    updated[index] = value;
    setChoices(updated);
  };

  const handleSubmit = async () => {
    if (!questionText || choices.some((c) => !c)) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    try {
      await axios.put(`/api/questions/${questionId}`, {
        questionText,
        choices,
        correctIndex,
      });
      router.push(`/questions/${topicId}`);
    } catch (err) {
      setError('Cập nhật thất bại');
    }
  };

  if (loading) return <p className="p-4">Đang tải...</p>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Sửa câu hỏi</h1>

      <label className="block mb-2 font-medium">Câu hỏi</label>
      <textarea
        className="w-full border p-2 mb-4"
        rows={3}
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        placeholder="Nội dung câu hỏi"
      />

      <div className="mb-4">
        {choices.map((choice, index) => (
          <div key={index} className="mb-2 flex items-center">
            <input
              type="radio"
              name="correct"
              className="mr-2"
              checked={correctIndex === index}
              onChange={() => setCorrectIndex(index)}
            />
            <input
              type="text"
              className="flex-1 border p-2"
              placeholder={`Đáp án ${index + 1}`}
              value={choice}
              onChange={(e) => handleChoiceChange(index, e.target.value)}
            />
          </div>
        ))}
      </div>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Cập nhật câu hỏi
      </button>
    </div>
  );
}
