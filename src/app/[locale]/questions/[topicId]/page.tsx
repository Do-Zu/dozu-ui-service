'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

interface Question {
  questionId: number;
  questionText: string;
  choices: string[];
  correctIndex: number;
}

export default function QuestionListPage() {
  const params = useParams();
  const topicId = params.topicId as string;
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/question/${topicId}`);
      setQuestions(res.data.data ?? []);
      setError('');
    } catch (err) {
      console.error('Lỗi khi lấy danh sách câu hỏi:', err);
      setError('Không thể tải câu hỏi. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xoá câu hỏi này?')) return;
    try {
      await axios.delete(`${API_URL}/api/question/${id}`);
      await fetchQuestions();
      alert(' Xoá câu hỏi thành công!');
    } catch (err) {
      console.error(' Xoá thất bại:', err);
      alert('Có lỗi khi xoá câu hỏi.');
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [topicId]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Danh sách câu hỏi</h1>
        <Link
          href={`/questions/${topicId}/create`}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Tạo câu hỏi
        </Link>
      </div>

      {loading ? (
        <p>⏳ Đang tải...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : questions.length === 0 ? (
        <p>📭 Chưa có câu hỏi nào.</p>
      ) : (
        <ul className="space-y-4">
          {questions.map((q) => (
            <li key={q.questionId} className="border p-4 rounded shadow">
              <p className="font-semibold">{q.questionText}</p>
              <ul className="list-disc pl-5 mt-2">
                {q.choices.map((c, i) => (
                  <li
                    key={i}
                    className={
                      i === q.correctIndex ? 'text-green-600 font-medium' : ''
                    }
                  >
                    {c}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-3">
                <Link
                  href={`/question/${topicId}/edit/${q.questionId}`}
                  className="text-blue-600 hover:underline"
                >
                  🖊️ Sửa
                </Link>
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => handleDelete(q.questionId)}
                >
                  🗑️ Xoá
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
