'use client'

import Animation404 from '@/components/animations/Animation404'
import Link from 'next/link'

export default function NotFoundView() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground px-4">
      <div className="flex flex-col items-center text-center">
        <Animation404 size={500} />
        <Link href="/">
          <button className="mt-6 px-6 py-2 rounded bg-[#00A9D7] text-foreground hover:bg-[#008fb9] transition">
            Go Back to Home
          </button>
        </Link>
      </div>
    </div>
  )
}
