'use client';

import React, { useCallback, useEffect, useState } from 'react';
import '@xyflow/react/dist/style.css';
import { useParams, useRouter } from 'next/navigation';
import Axios from '@/api/axios';

const NodePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [flashcards, setFlashcards] = useState([]);

  const params = useParams();
  const nodeId = params.id;

  if (!params?.id) return <div>No node id is provided</div>;

  // const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  useEffect(() => {
    const fetchFlashcardsByNode = async () => {
      const result = await Axios.get(`/mindmap/nodes/${nodeId}`);
      console.log(result.data.data);
      setFlashcards(result.data.data);
    };
    fetchFlashcardsByNode();
  }, []);

  return (
    <div className="w-full h-full">
      {/* <ReactFlowProvider> */}
      {flashcards.map((flashcard) => (
        <div>{JSON.stringify(flashcard)}</div>
      ))}
      {/* </ReactFlowProvider> */}
    </div>
  );
};

export default NodePage;
