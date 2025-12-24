import RoadmapList from '@/app/[locale]/mindmap/components/RoadmapList';
import { useMindMapContext } from '@/app/[locale]/mindmap/context/MindMapContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ILearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { AppNode } from '@/types/mindmap/mindmap.type';
import { UserRoleEnum } from '@/utils/constants/roles';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

interface Props {
    mode?: ILearningMode;
    role?: UserRoleEnum.USER | UserRoleEnum.TEACHER;
    onClose?: () => void;
}

export default function Roadmap({ mode, role, onClose }: Props) {
    const t = useTranslations('RoadmapButton');
    const { nodes, edges, setNodes } = useMindMapContext();

    const rootNode = nodes.find((node) => node.data.isRoot === true);

    // Helper function to get children of a given node
    const getImmediateChildNodes = (parentNodeId: string): AppNode[] => {
        const childEdges = edges.filter((edge) => edge.source === parentNodeId);
        const children: AppNode[] = [];
        childEdges.forEach((edge) => {
            const childNode = nodes.find((node) => node.data.nodeId === edge.target);
            if (childNode) {
                children.push(childNode);
            }
        });
        return children;
    };

    // Get root level children
    const rootChildren = useMemo(() => {
        return rootNode ? getImmediateChildNodes(rootNode.data.nodeId) : []; //default empty if root node is not found
    }, [rootNode, nodes, edges]);

    function normalizeRoadmapOrder(baseNodes: AppNode[]) {
        const total = baseNodes.length;

        // Step 1: Separate valid vs invalid order nodes
        const validNodes = baseNodes.filter((n) => {
            const order = n.data?.roadmapOrder;
            return typeof order === 'number' && order >= 0 && order < total;
        });

        const invalidNodes = baseNodes.filter((n) => !validNodes.includes(n));

        // Step 2: Sort valid nodes by their existing order
        validNodes.sort((a, b) => {
            const orderA = typeof a.data.roadmapOrder === 'number' ? a.data.roadmapOrder : 0;
            const orderB = typeof b.data.roadmapOrder === 'number' ? b.data.roadmapOrder : 0;
            return orderA - orderB;
        });

        // Step 3: Merge valid first, then invalid
        const finalOrdered = [...validNodes, ...invalidNodes];

        // Step 4: Assign new clean 0..N-1 order numbers
        // Avoid mutating the original node objects (they may be frozen).
        const newFinal = finalOrdered.map((node, index) => ({
            ...node,
            data: {
                ...node.data,
                roadmapOrder: index,
            },
        }));

        return newFinal;
    }

    const orderedBaseNodes = normalizeRoadmapOrder(rootChildren);

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('RoadmapButtonLabel')}</CardTitle>

                {onClose ? (
                    <Button
                        className="text-muted-foreground hover:text-primary"
                        size="icon"
                        variant="ghost"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                ) : null}
            </CardHeader>

            <CardContent>
                <div className="grid auto-rows-min gap-6">
                    <RoadmapList
                        initialItems={orderedBaseNodes}
                        setNodes={setNodes}
                        allNodes={nodes}
                        allEdges={edges}
                        getImmediateChildNodes={getImmediateChildNodes}
                        normalizeRoadmapOrder={normalizeRoadmapOrder}
                        role={role}
                        mode={mode}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
