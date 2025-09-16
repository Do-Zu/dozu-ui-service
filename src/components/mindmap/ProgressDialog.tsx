import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import Axios from '@/api/axios';

interface Summary {
  userId: number;
  userName: string | null;
  total: string;
  mature: string;
}

const ProgressDialog = ({ nodeId, classId }: { nodeId: string; classId: number }) => {
  const [summaryData, setSummaryData] = useState<Summary[]>([]);

  useEffect(() => {
    const fetchFlashcardsByNode = async () => {
      try {
        const result = await Axios.get(`/mindmap/1/${nodeId}/class-progress`);
        // result.data.data.summaryData is an array
        setSummaryData(result.data.data.summaryData);
      } catch (error) {
        console.error('Failed to fetch flashcards:', error);
      }
    };
    fetchFlashcardsByNode();
  }, [classId, nodeId]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Progress</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Class Progress</DialogTitle>
          <DialogDescription>
            Flashcard mastery by user in this node.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {summaryData.length === 0 ? (
            <p className="text-sm text-gray-500">No progress data available.</p>
          ) : (
            summaryData.map((summary) => {
              const total = Number(summary.total);
              const mature = Number(summary.mature);
              const percentage = total > 0 ? (mature / total) * 100 : 0;

              return (
                <div
                  key={summary.userId}
                  className="border rounded-lg p-3 shadow-sm bg-white"
                >
                  <p className="font-medium">
                    {summary.userName ?? `User ${summary.userId}`}
                  </p>
                  <Progress value={percentage} className="mt-2" />
                  <p className="text-sm text-gray-600 mt-1">
                    {mature} / {total} flashcards ({percentage.toFixed(2)}%)
                  </p>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProgressDialog;
