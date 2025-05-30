'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';

export default function CreateQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const topicId = params.topicId as string;

  const [questionText, setQuestionText] = useState('');
  const [choices, setChoices] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChoiceChange = (index: number, value: string) => {
    const updated = [...choices];
    updated[index] = value;
    setChoices(updated);
  };

  const handleSubmit = async () => {
    if (!questionText.trim() || choices.some(c => !c.trim())) {
      setError('⚠️ Vui lòng nhập đầy đủ câu hỏi và 4 đáp án.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await axios.post(`http://localhost:3333/api/question`, {
        topicId: Number(topicId),
        questionText,
        choices,
        correctIndex,
      });
      router.push(`/questions/${topicId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || '❌ Đã xảy ra lỗi khi tạo câu hỏi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tạo câu hỏi mới</h1>

      <label className="block mb-2 font-medium">Câu hỏi</label>
      <textarea
        className="w-full border p-2 mb-4"
        rows={3}
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        placeholder="Nhập nội dung câu hỏi"
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

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${loading ? 'opacity-70' : ''}`}
      >
        {loading ? 'Đang lưu...' : 'Tạo câu hỏi'}
      </button>
    </div>
  );
}
