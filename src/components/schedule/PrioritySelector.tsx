'use client';

import React, { useState, useEffect } from 'react';


interface SubjectPriority {
  subject: string;
  importance: number; // 1 - 5
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
}

type PrioritySelectorProps = {
  subjects: SubjectPriority[]; // Dữ liệu này sẽ nhận từ props
};

export default function PrioritySelector({ subjects: initialSubjects }: PrioritySelectorProps) {
  const [subjectList, setSubjectList] = useState<SubjectPriority[]>(initialSubjects);
  
  useEffect(() => {
    setSubjectList(initialSubjects);
  }, [initialSubjects]); 

  const handleChange = (index: number, field: keyof SubjectPriority, value: any) => {
    const newSubjects = [...subjectList];
    if (field === 'subject' && typeof value === 'string') {
      newSubjects[index][field] = value;
    } else if (field === 'importance' && typeof value === 'number') {
      newSubjects[index][field] = value;
    } else if (field === 'difficulty' && (value === 'Dễ' || value === 'Trung bình' || value === 'Khó')) {
      newSubjects[index][field] = value;
    }
    setSubjectList(newSubjects);
  };

  return (
    <div className="space-y-4">
      {subjectList.map((subject, index) => (
        subject.subject &&
        <div key={index} className="border p-4 rounded shadow-sm space-y-2">
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder="Tên môn học..."
            value={subject.subject}
            onChange={(e) => handleChange(index, 'subject', e.target.value)}
          />

          <div className="flex items-center justify-between">
            <label className="mr-2 text-sm font-medium">Mức độ quan trọng: {subject.importance}</label>
            <input
              type="range"
              min={1}
              max={5}
              value={subject.importance}
              onChange={(e) => handleChange(index, 'importance', Number(e.target.value))}
              className="flex-1 ml-4"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Độ khó:</label>
            <select
              value={subject.difficulty}
              onChange={(e) => handleChange(index, 'difficulty', e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="Dễ">Dễ</option>
              <option value="Trung bình">Trung bình</option>
              <option value="Khó">Khó</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}
