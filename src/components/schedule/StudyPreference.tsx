'use client';

import React, { useState } from 'react';

export default function StudyPreference() {
  const [preferredTime, setPreferredTime] = useState('');
  const [studyStyle, setStudyStyle] = useState('');
  const [studyMethods, setStudyMethods] = useState<string[]>([]);

  const handleCheckboxChange = (value: string) => {
    if (studyMethods.includes(value)) {
      setStudyMethods(studyMethods.filter((item) => item !== value));
    } else {
      setStudyMethods([...studyMethods, value]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="font-medium">Bạn thích học vào thời gian nào trong ngày?</label>
        <div className="flex gap-6 mt-2">
          {['Sáng', 'Chiều', 'Tối'].map((time) => (
            <label key={time} className="flex items-center gap-2">
              <input
                type="radio"
                name="preferredTime"
                value={time}
                checked={preferredTime === time}
                onChange={() => setPreferredTime(time)}
              />
              {time}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="font-medium">Bạn học hiệu quả hơn khi nào?</label>
        <select
          className="block mt-2 border rounded px-3 py-2"
          value={studyStyle}
          onChange={(e) => setStudyStyle(e.target.value)}
        >
          <option value="">-- Chọn một lựa chọn --</option>
          <option value="Một mình">Một mình</option>
          <option value="Trong nhóm">Trong nhóm</option>
          <option value="Có nhạc nền">Có nhạc nền</option>
        </select>
      </div>

      <div>
        <label className="font-medium">Phong cách học bạn thường áp dụng?</label>
        <div className="flex flex-col mt-2 gap-2">
          {['Từng phần nhỏ', 'Marathon', 'Theo chủ đề'].map((method) => (
            <label key={method} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={method}
                checked={studyMethods.includes(method)}
                onChange={() => handleCheckboxChange(method)}
              />
              {method}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
