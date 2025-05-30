'use client';

import React, { useState } from 'react';

interface EditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  session: {
    subject: string;
    day: string;
    start: string;
    end: string;
  };
  onSave: (updatedSession: any) => void;
}

export default function EditDialog({ isOpen, onClose, session, onSave }: EditDialogProps) {
  const [formData, setFormData] = useState(session);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white w-full max-w-md p-6 rounded shadow-lg">
        <h2 className="text-lg font-semibold mb-4"> Chỉnh sửa buổi học</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Môn học</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ngày</label>
            <input
              type="text"
              value={formData.day}
              onChange={(e) => handleChange('day', e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Từ</label>
              <input
                type="time"
                value={formData.start}
                onChange={(e) => handleChange('start', e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Đến</label>
              <input
                type="time"
                value={formData.end}
                onChange={(e) => handleChange('end', e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500 hover:text-black">
              Hủy
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
