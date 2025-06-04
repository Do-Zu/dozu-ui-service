'use client';

import React from 'react';

interface ProgressSummaryProps {
  totalSessions: number;
  completedSessions: number;
  streakDays: number;
  totalStudyTime: number; // in minutes
}

export default function ProgressSummary({
  totalSessions,
  completedSessions,
  streakDays,
  totalStudyTime,
}: ProgressSummaryProps) {
  const percent = totalSessions === 0 ? 0 : Math.round((completedSessions / totalSessions) * 100);

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-4"> Tóm tắt tiến độ học tập</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm font-medium">
        <div className="bg-white bg-opacity-10 rounded p-4">
          <p className="text-lg font-semibold">{totalSessions}</p>
          <p>Tổng buổi học</p>
        </div>
        <div className="bg-white bg-opacity-10 rounded p-4">
          <p className="text-lg font-semibold">{completedSessions}</p>
          <p>Đã hoàn thành</p>
        </div>
        <div className="bg-white bg-opacity-10 rounded p-4">
          <p className="text-lg font-semibold">{streakDays} 🔥</p>
          <p>Chuỗi ngày học liên tiếp</p>
        </div>
        <div className="bg-white bg-opacity-10 rounded p-4">
          <p className="text-lg font-semibold">{formatTime(totalStudyTime)}</p>
          <p>Tổng thời gian học</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm mb-2">Tiến độ tổng thể</p>
        <div className="w-full bg-white bg-opacity-20 rounded-full h-4 overflow-hidden">
          <div
            className="bg-green-300 h-full text-xs text-white text-center transition-all duration-500 ease-in-out"
            style={{ width: `${percent}%` }}
          >
            {percent}%
          </div>
        </div>
      </div>
    </div>
  );
}
