'use client'

import { useState } from 'react'

type ReminderToggleProps = {
  enabled?: boolean
  onToggle?: (value: boolean) => void
}

export default function ReminderToggle({ enabled = false, onToggle }: ReminderToggleProps) {
  const [isEnabled, setIsEnabled] = useState(enabled)

  const handleToggle = () => {
    const newValue = !isEnabled
    setIsEnabled(newValue)
    onToggle?.(newValue)
  }

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-700 dark:text-gray-300">Nhắc nhở trước buổi học</span>
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isEnabled ? 'bg-green-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isEnabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}
