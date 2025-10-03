'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEdgesState, useNodesState, Node, useReactFlow } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import Axios from '@/api/axios';
import { toast } from '@/hooks/use-toast';
import { AppNode, AppEdge, CustomNodeData, CustomEdge, NodeStat } from '../../../../types/mindmap/mindmap.type';
import useReaderFile from '@/hooks/useReaderFile';
import { EventSourceStatus, useEventSource } from '@/hooks/useEventSource';
import usePost from '@/hooks/usePost';
import { ApiResponsePubGenContent, ISseData } from '../../generate';
import { URL_API_GENERATE } from '../../generate/utils/constant';
import topicService from '@/services/topic/topic.service';
import { IResponseFileFromInputSet } from '../types/context.types';
import { getRequest } from '@/api/api';

// Types for PDF Document
interface PDFDocumentInfo {
    numPages: number;
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
}

interface PDFTextExtractionResult {
    text: string;
    pageCount: number;
    extractedPages?: number[];
    success: boolean;
    error?: string;
}

// Context Types
interface MindMapContextType {
    // Topic State
    topicId: string | null;
    topicName: string;
    setTopicName: (name: string) => void;

    // Mindmap State
    nodes: AppNode[];
    edges: AppEdge[];
    setNodes: (nodes: AppNode[] | ((nodes: AppNode[]) => AppNode[])) => void;
    setEdges: (edges: AppEdge[] | ((edges: AppEdge[]) => AppEdge[])) => void;
    onNodesChange: (changes: any) => void;
    onEdgesChange: (changes: any) => void;

    // Loading States
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    isSaving: boolean;
    setIsSaving: (saving: boolean) => void;

    // PDF Document State
    pdfUrl: string;
    setPdfUrl: (url: string) => void;
    pdfFile: File | undefined;
    setPdfFile: (file: File | undefined) => void;
    documentInfo: PDFDocumentInfo | null;
    setDocumentInfo: (info: PDFDocumentInfo | null) => void;

    // PDF Navigation State
    currentPageNumber: number;
    setCurrentPageNumber: (page: number) => void;
    totalPages: number;
    setTotalPages: (pages: number) => void;

    // Sheet States
    isFileSheetOpen: boolean;
    setIsFileSheetOpen: (open: boolean) => void;
    isNodeSheetOpen: boolean;
    setIsNodeSheetOpen: (open: boolean) => void;

    // Selected Node State
    selectedNodeData: CustomNodeData | null;
    setSelectedNodeData: (data: CustomNodeData | null) => void;

    // Actions
    initializeMindmap: () => Promise<void>;
    saveMindmap: () => Promise<void>;
    loadPdfDocument: () => Promise<void>;
    extractTextByRange: (startPage: number, endPage: number) => Promise<PDFTextExtractionResult>;

    // Sheet Actions
    openFileSheet: (pageNumber?: number) => void;
    closeFileSheet: () => void;
    openNodeSheet: (nodeData: CustomNodeData) => void;
    closeNodeSheet: () => void;

    // Node Actions
    addChildNode: (parentNodeId: string) => void;
    updateNode: (nodeId: string, updates: Partial<CustomNodeData>) => void;
    deleteNode: (nodeId: string) => void;

    //Generate
    isProcessingRegisterGenerate: boolean;
    executeGenerate: (payload: unknown) => Promise<ApiResponsePubGenContent | null>;

    sseData: ISseData | null;
    sseStatus: EventSourceStatus;

    //Node Stats
    nodeStats: NodeStat[];

    // Cleanup
    cleanup: () => void;
}

// Context
const MindMapContext = createContext<MindMapContextType | undefined>(undefined);

// Custom hook to use the context
export const useMindMapContext = () => {
    const context = useContext(MindMapContext);
    if (!context) {
        throw new Error('useMindMapContext must be used within a MindMapProvider');
    }
    return context;
};

// Provider Props
interface MindMapProviderProps {
    children: ReactNode;
}

// Provider Component
export const MindMapProvider: React.FC<MindMapProviderProps> = ({ children }) => {
    const router = useRouter();
    const params = useParams<{ topicId: string }>();
    const topicId = params?.topicId;

    // Topic State
    const [topicName, setTopicName] = useState<string>('');

    // Loading States
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // Initial nodes and edges
    const initialNodes: AppNode[] = [
        {
            id: '1',
            type: 'custom-react-flow-node',
            position: { x: 0, y: 0 },
            data: { nodeId: '1', label: '1', isRoot: true, topicId },
        },
    ]; //todo - Duy: Change to relevant topic name for node label if possible
    const initialEdges: AppEdge[] = [];

    // Mindmap State
    const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>(initialEdges);

    // Stats summary State
    const [nodeStats, setNodeStats] = useState<NodeStat[]>([]);

    // PDF Document State
    const [pdfUrl, setPdfUrl] = useState<string>('');
    const [pdfFile, setPdfFile] = useState<File | undefined>();
    const [documentInfo, setDocumentInfo] = useState<PDFDocumentInfo | null>(null);

    // PDF Navigation State
    const [currentPageNumber, setCurrentPageNumber] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);

    // Sheet States
    const [isFileSheetOpen, setIsFileSheetOpen] = useState<boolean>(false);
    const [isNodeSheetOpen, setIsNodeSheetOpen] = useState<boolean>(false);

    // Selected Node State
    const [selectedNodeData, setSelectedNodeData] = useState<CustomNodeData | null>(null);

    const { extractTextByRange: extractTextByRangeHook, error, text } = useReaderFile(pdfFile);

    const {
        loading: isProcessingRegisterGenerate,
        data: apiResponse,
        error: apiPostContentError,
        execute,
    } = usePost<unknown, ApiResponsePubGenContent>(URL_API_GENERATE, 'POST');

    const urlOfSSEGenerateJob = useMemo(() => {
        if (!apiResponse || !apiResponse.data || apiPostContentError) return null;
        const { data } = apiResponse;
        const jobId = data?.jobId;
        return `/event/generate/job/${jobId}`;
    }, [apiResponse, isProcessingRegisterGenerate]);

    const { data: sseData, status: sseStatus } = useEventSource<ISseData>(urlOfSSEGenerateJob);

    // Wrap the hook function to match the expected return type
    const extractTextByRange = useCallback(
        async (startPage: number, endPage: number): Promise<PDFTextExtractionResult> => {
            try {
                const textRangePages = await extractTextByRangeHook(startPage, endPage);
                return {
                    text: textRangePages,
                    pageCount: endPage - startPage + 1,
                    success: !error,
                    error: error || undefined,
                };
            } catch (err) {
                return {
                    text: '',
                    pageCount: 0,
                    extractedPages: [],
                    success: false,
                    error: err instanceof Error ? err.message : 'Unknown error occurred',
                };
            }
        },
        [extractTextByRangeHook, text, error],
    );

    // Initialize mindmap data
    const initializeMindmap = useCallback(async () => {
        if (!topicId) return;

        setIsLoading(true);
        try {
            // Try to get existing mindmap first
            const { data } = await Axios.get(`/mindmap/${topicId}`);
            const mindmapData = data?.data?.mindmap.mindmapData;
            const nodeStatsData = data.data.nodeStats;

            //set node stats

            if (mindmapData) {
                // Load existing mindmap
                mindmapData.nodes = mindmapData.nodes.map((node: any) => ({
                    ...node,
                    data: {
                        ...node.data,
                        topicId: topicId,
                        router: router,
                        pageStartIndex: parseInt(node.data.pageStartIndex),
                        pageEndIndex: parseInt(node.data.pageEndIndex),
                    },
                }));
                setNodes(mindmapData.nodes);
                setEdges(mindmapData.edges);
            }
            if (nodeStatsData) {
                // Load existing mindmap
                setNodeStats(nodeStatsData);
            }
        } catch (error) {
            // If mindmap doesn't exist, create initial mindmap from topic
            try {
                // const result = await Axios.get(`/topics/${topicId}`);
                const result = await topicService.getTopicById(Number(topicId));
                const id = uuidv4();
                // setTopicName(result.data.data.name);
                setTopicName(result.name);
                setNodes([
                    {
                        id: id,
                        type: 'custom-react-flow-node',
                        position: { x: 0, y: 0 },
                        data: {
                            nodeId: id,
                            // label: result.data.data.name,
                            label: result.name,
                            isRoot: true,
                            topicId: topicId,
                        },
                    },
                ]);
                setEdges([]);
            } catch (topicError) {
                toast({
                    title: 'Error',
                    description: 'Failed to load topic data',
                    variant: 'destructive',
                });
            }
        } finally {
            setIsLoading(false);
        }
    }, [topicId]);

    // Save mindmap
    const saveMindmap = useCallback(async () => {
        if (!topicId) return;

        setIsSaving(true);

        try {
            const payload = {
                title: topicName || 'Untitled Mindmap',
                nodes: nodes,
                edges: edges,
            };

            await Axios.post(`/mindmap/${topicId}`, payload);
            toast({
                title: 'Success',
                description: 'Mindmap saved successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save mindmap',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    }, [topicId, topicName, nodes, edges]);

    // Load PDF document
    const loadPdfDocument = useCallback(async () => {
        if (!topicId) return;

        setIsLoading(true);

        try {
            const { data: fileContent } = await getRequest<unknown, IResponseFileFromInputSet>(
                `/input-set/document/${topicId}`,
            );

            if (!fileContent?.fileUrl) {
                throw new Error('No file URL provided');
            }

            // Fetch file from R2
            const response = await fetch(fileContent.fileUrl, {
                method: 'GET',
                headers: {
                    Accept: 'application/pdf, */*',
                    'Cache-Control': 'no-cache',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            const filename = fileContent?.title;

            const file = new File([blob], filename, {
                type: blob.type || 'application/pdf',
                lastModified: Date.now(),
            });

            const blobUrl = URL.createObjectURL(blob);

            // Clean up previous blob URL to prevent memory leaks
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }

            setPdfUrl(blobUrl);
            setPdfFile(file);
            setCurrentPageNumber(1);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    }, [topicId, pdfUrl]);

    // Sheet actions
    const openFileSheet = useCallback((pageNumber?: number) => {
        if (pageNumber) {
            setCurrentPageNumber(pageNumber);
        }
        setIsFileSheetOpen(true);
    }, []);

    const closeFileSheet = useCallback(() => {
        setIsFileSheetOpen(false);
    }, []);

    const openNodeSheet = useCallback((nodeData: CustomNodeData) => {
        setSelectedNodeData(nodeData);
        setIsNodeSheetOpen(true);
    }, []);

    const closeNodeSheet = useCallback(() => {
        setIsNodeSheetOpen(false);
        setSelectedNodeData(null);
    }, []);

    // Node actions
    const addChildNode = useCallback(
        (parentNodeId: string) => {
            const newNodeId = uuidv4();
            const parentNode = nodes.find((node) => node.data.nodeId === parentNodeId);

            if (!parentNode) return;

            const newNode: AppNode = {
                id: newNodeId,
                type: 'custom-react-flow-node',
                position: {
                    x: parentNode.position.x + 200,
                    y: parentNode.position.y + 100,
                },
                data: {
                    nodeId: newNodeId,
                    label: 'New Node',
                    topicId: topicId,
                },
            };

            const newEdge: AppEdge = {
                id: uuidv4(),
                source: parentNodeId,
                target: newNodeId,
                type: 'floating',
            };

            setNodes((prev) => [...prev, newNode]);
            setEdges((prev) => [...prev, newEdge]);
        },
        [nodes, topicId, setNodes, setEdges],
    );

    const updateNode = useCallback(
        (nodeId: string, updates: Partial<CustomNodeData>) => {
            setNodes((prev) =>
                prev.map((node) =>
                    node.data.nodeId === nodeId ? { ...node, data: { ...node.data, ...updates } } : node,
                ),
            );
        },
        [setNodes],
    );

    const deleteNode = useCallback(
        (nodeId: string) => {
            setNodes((prev) => prev.filter((node) => node.data.nodeId !== nodeId));
            setEdges((prev) => prev.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
        },
        [setNodes, setEdges],
    );

    // Cleanup function
    const cleanup = useCallback(() => {
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
        }
        setPdfUrl('');
        setPdfFile(undefined);
        setDocumentInfo(null);
    }, [pdfUrl]);

    // Initialize on mount
    useEffect(() => {
        initializeMindmap();
        loadPdfDocument();

        return cleanup;
    }, []);

    // Context value
    const contextValue: MindMapContextType = {
        // Topic State
        topicId,
        topicName,
        setTopicName,

        // Mindmap State
        nodes,
        edges,
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,

        // Loading States
        isLoading,
        setIsLoading,
        isSaving,
        setIsSaving,

        // PDF Document State
        pdfUrl,
        setPdfUrl,
        pdfFile,
        setPdfFile,
        documentInfo,
        setDocumentInfo,

        // PDF Navigation State
        currentPageNumber,
        setCurrentPageNumber,
        totalPages,
        setTotalPages,

        // Sheet States
        isFileSheetOpen,
        setIsFileSheetOpen,
        isNodeSheetOpen,
        setIsNodeSheetOpen,

        // Selected Node State
        selectedNodeData,
        setSelectedNodeData,

        // Actions
        initializeMindmap,
        saveMindmap,
        loadPdfDocument,

        openFileSheet,
        closeFileSheet,
        openNodeSheet,
        closeNodeSheet,

        // Extract text from PDF
        extractTextByRange,

        // Node Actions
        addChildNode,
        updateNode,
        deleteNode,

        //Node Stats
        nodeStats,

        //Generate
        executeGenerate: execute,
        isProcessingRegisterGenerate,
        sseData,
        sseStatus,

        // Cleanup
        cleanup,
    };

    return <MindMapContext.Provider value={contextValue}>{children}</MindMapContext.Provider>;
};

export default MindMapContext;
