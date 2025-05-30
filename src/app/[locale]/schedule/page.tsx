'use client';

import React, { useState } from 'react';
import SetupForm from './_components/SetupForm';
import PreviewPanel from './_components/PreviewPanel';
import CalendarView from './_components/CalendarView';
import EditDialog from './_components/EditDialog';
import ReminderToggle from './_components/ReminderToggle';
import ProgressSummary from './_components/ProgressSummary';

export default function SchedulePage() {
  const [step, setStep] = useState<'setup' | 'preview' | 'calendar'>('setup');
  const [scheduleData, setScheduleData] = useState<any>(null);

  //  Quản lý dialog chỉnh sửa
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState({
    subject: '',
    day: '',
    start: '',
    end: ''
  });

  //  Gọi khi hoàn tất form nhập liệu
  const handleScheduleGenerated = (data: any) => {
    setScheduleData(data);
    setStep('preview');
  };

  //  Gọi khi nhấn "Edit" trong lịch (tạm thời gọi mock)
  const handleEditClick = () => {
    setEditingSession({
      subject: 'Toán',
      day: 'Thứ 2',
      start: '08:00',
      end: '09:00'
    });
    setEditDialogOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <h1 className="text-3xl font-bold text-center"> Lên Lịch Học</h1>

      {step === 'setup' && (
        <div className="space-y-8">
          <SetupForm onComplete={handleScheduleGenerated} />
        </div>
      )}

      {step === 'preview' && scheduleData && (
        <div className="space-y-8">
          <PreviewPanel data={scheduleData} />
          <div className="flex justify-between">
            <button
              onClick={() => setStep('setup')}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
               Quay lại chỉnh sửa
            </button>
            <button
              onClick={() => setStep('calendar')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
               Xác nhận và Xem lịch
            </button>
          </div>
        </div>
      )}

      {step === 'calendar' && (
        <div className="space-y-10">
          <CalendarView />
          <button
            className="text-blue-600 underline text-sm"
            onClick={handleEditClick}
          >
              chỉnh sửa buổi học
          </button>

          <EditDialog
            isOpen={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            session={editingSession}
            onSave={(updated) => {
              console.log('Đã lưu buổi học:', updated);
              setEditDialogOpen(false);
            }}
          />

          <ReminderToggle enabled={true} onToggle={(val) => console.log('Reminder:', val)} />

          <ProgressSummary
            totalSessions={20}
            completedSessions={10}
            streakDays={5}
            totalStudyTime={450}
          />
        </div>
      )}
    </div>
  );
}
