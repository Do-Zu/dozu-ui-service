'use client';

import React, { useEffect, useState } from 'react';
import '@xyflow/react/dist/style.css';
import { useParams } from 'next/navigation';
import Axios from '@/api/axios';

//temporary view
interface Flashcard {
  flashcardId: number;
  topicId: number;
  nodeId: string;
  front: string;
  back: string;
  createdAt: string;
}

const NodePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  const params = useParams();
  const nodeId = params.id;

  if (!params?.id) return <div>No node id is provided</div>;

  useEffect(() => {
    const fetchFlashcardsByNode = async () => {
      setIsLoading(true);
      try {
        const result = await Axios.get(`/mindmap/nodes/${nodeId}`);
        setFlashcards(result.data.data);
      } catch (error) {
        console.error('Failed to fetch flashcards:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFlashcardsByNode();
  }, [nodeId]);

  return (
    <div className="w-full h-full p-4 space-y-4">
      {isLoading ? (
        <div>Loading...</div>
      ) : flashcards.length === 0 ? (
        <div>No flashcards found for this node.</div>
      ) : (
        flashcards.map((flashcard) => (
          <div
            key={flashcard.flashcardId}
            className="border rounded-lg p-4 shadow-sm bg-white"
          >
            <p className="text-sm text-gray-500 mb-1">
              ID: {flashcard.flashcardId} | Topic: {flashcard.topicId}
            </p>
            <p className="font-semibold mb-2">Q: {flashcard.front}</p>
            <p className="text-blue-700">A: {flashcard.back}</p>
            <p className="text-xs text-gray-400 mt-2">
              Created at: {new Date(flashcard.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default NodePage;
