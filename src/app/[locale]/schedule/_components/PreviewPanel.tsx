'use client';

import React from 'react';

interface SuggestedSession {
  subject: string;
  day: string;
  start: string;
  end: string;
}

const mockSchedule: SuggestedSession[] = [
  { subject: 'Toán', day: 'Thứ 2', start: '08:00', end: '09:00' },
  { subject: 'Văn', day: 'Thứ 3', start: '14:00', end: '15:30' },
  { subject: 'Anh', day: 'Thứ 4', start: '19:00', end: '20:00' },
];

export default function PreviewPanel() {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">📋 Gợi ý lịch học</h2>
      <p className="text-gray-500 text-sm mb-4">
        Đây là lịch học hệ thống đề xuất dựa trên thông tin bạn đã nhập.
      </p>

      <table className="min-w-full border border-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left">Môn học</th>
            <th className="border px-4 py-2 text-left">Ngày</th>
            <th className="border px-4 py-2 text-left">Từ</th>
            <th className="border px-4 py-2 text-left">Đến</th>
          </tr>
        </thead>
        <tbody>
          {mockSchedule.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{item.subject}</td>
              <td className="border px-4 py-2">{item.day}</td>
              <td className="border px-4 py-2">{item.start}</td>
              <td className="border px-4 py-2">{item.end}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right mt-6">
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Xác nhận và lưu lịch học
        </button>
      </div>
    </div>
  );
}
