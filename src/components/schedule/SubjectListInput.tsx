'use client';

import React, { useState } from 'react';

interface SubjectListInputProps {
  subjects: {
    subject: string;
    importance: number;
    difficulty: 'Dễ' | 'Trung bình' | 'Khó'; //fix tạm nếu có enum thì khác
  }[];
  onSubjectChange: (subjects: any[]) => void;
}

export default function SubjectListInput({ subjects, onSubjectChange }: SubjectListInputProps) {

  const handleChange = (index: number, field: keyof typeof subjects[0], value: string) => {
    const newSubjects = [...subjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value }; 
    onSubjectChange(newSubjects); // Cập nhật state ở parent component
  };

  const handleAdd = () => {
    onSubjectChange([
      ...subjects,
      { subject: '', importance: 3, difficulty: 'Trung bình' }, // Thêm môn học mới, mặc định khi thêm thì độ khó và importance sẽ setup sẵn 
    ]);
  };

  const handleRemove = (index: number) => {
    const newSubjects = subjects.filter((_, i) => i !== index);
    onSubjectChange(newSubjects); 
  };

  return (
    <div className="space-y-3">
      {subjects.map((subject, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            value={subject.subject}
            onChange={(e) => handleChange(index, 'subject', e.target.value)} 
            className="flex-1 border border-gray-300 rounded px-3 py-2"
            placeholder="Tên môn học..."
          />
          <button
            type="button"
            onClick={() => handleRemove(index)}
            className="text-red-500 hover:text-red-700"
            disabled={subjects.length === 1}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        className="text-blue-600 hover:underline text-sm"
      >
        + Thêm môn học
      </button>
    </div>
  );
}
