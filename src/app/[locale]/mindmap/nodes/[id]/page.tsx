'use client';

import React, { useCallback, useEffect, useState } from 'react';
import '@xyflow/react/dist/style.css';
import { useParams, useRouter } from 'next/navigation';
import Axios from '@/api/axios';

import { v4 as uuidv4 } from 'uuid';
import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import { Button } from '@/components/ui/button';


const NodePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const nodeId = params.id;

  if (!params?.id) return <div>No node id is provided</div>;

  // const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className="w-full h-full">
      {/* <ReactFlowProvider> */}

      {/* </ReactFlowProvider> */}
    </div>
  );
};

export default NodePage;
