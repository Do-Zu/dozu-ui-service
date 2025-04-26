'use client';

import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/stores/hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FlashcardViewer from './FlashcardViewer';
import { ISseData } from '../CardImport';

interface FlashcardItem {
  q: string;
  a: string;
}
interface FinalProps {
  sseData: ISseData | null;
}
const Final: React.FC<FinalProps> = ({ sseData }) => {
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [selectedTab, setSelectedTab] = useState('flashcards');

  useEffect(() => {
    if (sseData?.data?.content) {
      setFlashcards(sseData.data.content);
    }
  }, [sseData]);

  return (
    <div className="space-y-4">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="flashcards" className="flex-1">
            Flashcards
          </TabsTrigger>
          <TabsTrigger value="rawData" className="flex-1">
            Raw Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flashcards" className="pt-4">
          {flashcards.length > 0 ? (
            <FlashcardViewer flashcards={flashcards} />
          ) : (
            <div className="text-center py-10 text-gray-500">
              No flashcard data available. Please wait for generation to complete.
            </div>
          )}
        </TabsContent>

        <TabsContent value="rawData" className="pt-4">
          <div className="border rounded-md p-4 max-h-[500px] overflow-auto">
            <pre className="text-sm whitespace-pre-wrap">
              {sseData ? JSON.stringify(sseData, null, 2) : 'No data available'}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Final;
