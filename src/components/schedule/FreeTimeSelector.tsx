'use client';

import React, { useState } from 'react';
import clsx from 'clsx';

const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const hours = Array.from({ length: 24 }, (_, i) => i);

export default function FreeTimeSelector() {
  const [freeTime, setFreeTime] = useState<boolean[][]>(
    Array.from({ length: 7 }, () => Array(24).fill(false))
  );

  const toggleTime = (dayIndex: number, hour: number) => {
    const newTime = [...freeTime];
    newTime[dayIndex][hour] = !newTime[dayIndex][hour];
    setFreeTime(newTime);
  };

  return (
    <div className="overflow-auto border rounded">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border p-2 bg-gray-100 text-left">Ngày - Giờ</th>
            {hours.map((hour) => (
              <th key={hour} className="border p-1 text-center">{hour}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day, dayIndex) => (
            <tr key={day}>
              <td className="border p-2 font-medium">{day}</td>
              {hours.map((hour) => (
                <td
                  key={hour}
                  className={clsx(
                    'border p-1 cursor-pointer',
                    freeTime[dayIndex][hour] ? 'bg-green-400' : 'bg-white'
                  )}
                  onClick={() => toggleTime(dayIndex, hour)}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
