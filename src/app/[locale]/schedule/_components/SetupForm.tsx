'use client';

import React from 'react';
import { useState } from 'react';
import SubjectListInput from '@/components/schedule/SubjectListInput';
import FreeTimeSelector from '@/components/schedule/FreeTimeSelector';
import PrioritySelector from '@/components/schedule/PrioritySelector';
import StudyPreference from '@/components/schedule/StudyPreference';

type Props = {
  onComplete: () => void;
};

type SubjectPriority = {
  subject: string;
  importance: number;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
};

export default function SetupForm({ onComplete }: Props) {

  const [subjects, setSubjects] = useState<SubjectPriority[]>([]);

  const handleSubjectChange = (newSubjects: SubjectPriority[]) => {
    setSubjects(newSubjects); // Cập nhật danh sách môn học
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onComplete(); // Gọi callback để chuyển sang bước preview
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-6 bg-white rounded shadow">
      <section>
        <h2 className="text-xl font-semibold mb-2">Danh sách môn học</h2>
        <p className="text-sm text-gray-500 mb-4">Nhập các môn học bạn muốn lên lịch</p>
        <SubjectListInput subjects={subjects} onSubjectChange={handleSubjectChange} />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Thời gian rảnh trong tuần</h2>
        <p className="text-sm text-gray-500 mb-4">Chọn khoảng thời gian bạn có thể học mỗi ngày</p>
        <FreeTimeSelector />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Mức độ ưu tiên</h2>
        <p className="text-sm text-gray-500 mb-4">Đánh giá tầm quan trọng và độ khó của từng môn</p>
        <PrioritySelector subjects={subjects} />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Thói quen học</h2>
        <p className="text-sm text-gray-500 mb-4">Hệ thống sẽ gợi ý lịch học phù hợp với bạn hơn</p>
        <StudyPreference />
      </section>

      <div className="text-right">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Tạo lịch học
        </button>
      </div>
    </form>
  );
}