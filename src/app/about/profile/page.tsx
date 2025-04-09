// app/profile/page.tsx

'use client';

import Image from 'next/image';

export default function ProfilePage() {
  return (
    <section className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex flex-col items-center bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 gap-6">
        {/* Avatar */}
        <div className="relative w-32 h-32">
          <Image
            src="/avatar.jpg" // Đổi thành avatar của bạn
            alt="User Avatar"
            className="rounded-full object-cover border-4 border-white dark:border-gray-700 shadow"
            fill
          />
        </div>

        {/* Info */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Phan Hoài Thi</h1>
          <p className="text-gray-500 dark:text-gray-400">thi.teacher@example.com</p>
        </div>

        {/* Details */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <p className="font-medium">Job Title</p>
            <p>Teacher / MC</p>
          </div>
          <div>
            <p className="font-medium">Location</p>
            <p>Ninh Thuận, Vietnam</p>
          </div>
          <div>
            <p className="font-medium">Joined</p>
            <p>March 2024</p>
          </div>
          <div>
            <p className="font-medium">Status</p>
            <p>Active</p>
          </div>
        </div>

        {/* Action */}
        <button className="mt-4 px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition">
          Chỉnh sửa hồ sơ
        </button>
      </div>
    </section>
  );
}
