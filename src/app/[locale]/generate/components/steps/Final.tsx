'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FlashcardViewer from './FlashcardViewer';
import { ISseData } from '../../types';
import { METHOD_LEARNING } from '@/utils/constants/method';

export interface FlashcardItem {
    q: string;
    a: string;
}
export interface FinalProps {
    sseData: ISseData | null;
}
const Final: React.FC<FinalProps> = ({ sseData }) => {
    const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
    const [selectedTab, setSelectedTab] = useState(METHOD_LEARNING.FLASHCARD.toString());

    const extractFlashcardsFromText = (textContent: string): FlashcardItem[] => {
        try {
            const jsonMatch = textContent.match(/```json\s*([\s\S]*?)\s*```/);
            const jsonString = jsonMatch ? jsonMatch[1] : textContent;

            // Parse the JSON string into an array of flashcards
            const parsedFlashcards = JSON.parse(jsonString);

            // Validate that we have an array of objects with q and a properties
            if (
                Array.isArray(parsedFlashcards) &&
                parsedFlashcards.length > 0 &&
                'q' in parsedFlashcards[0] &&
                'a' in parsedFlashcards[0]
            ) {
                console.log(`Successfully extracted ${parsedFlashcards.length} flashcards from text`);
                return parsedFlashcards;
            } else {
                console.error('Parsed text does not contain valid flashcard data');
                return [];
            }
        } catch (error) {
            console.error('Failed to parse flashcards from text:', error);
            return [];
        }
    };

    useEffect(() => {
        // if (sseData?.data?.data) {
        //   setFlashcards(sseData.data?.data);
        // }
        if (sseData?.data?.text) {
            const extractedFlashcards = extractFlashcardsFromText(sseData.data.text);
            setFlashcards(extractedFlashcards);
        }
    }, [sseData]);

    return (
        <div className="space-y-4">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="w-full">
                    <TabsTrigger value="flashcard" className="flex-1">
                        Flashcards
                    </TabsTrigger>
                    <TabsTrigger value="rawData" className="flex-1">
                        Raw Data
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="flashcard" className="pt-4">
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
