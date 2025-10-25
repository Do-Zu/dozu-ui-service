'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { MemoryMatchProvider } from './context/MemoryMatchContext';
import MemoryMatchGame from './components/MemoryMatchGame';

export default function MemoryMatchPage() {
  const searchParams = useSearchParams();
  const topicId = searchParams.get('topicId');

  return (
    <div className="h-full w-full">
      <MemoryMatchProvider topicId={topicId}>
        <MemoryMatchGame />
      </MemoryMatchProvider>
    </div>
  );
}
