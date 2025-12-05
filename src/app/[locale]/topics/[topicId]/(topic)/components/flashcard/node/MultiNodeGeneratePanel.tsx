import { Panel } from '@xyflow/react';
import Generate from '../../generate/Generate';
import useMultiNodeFlashcardsGenerate from '../../../hooks/useMultiNodeFlashcardsGenerate';
import { AppNode } from '@/types/mindmap/mindmap.type';
import { IGenerateNodeFlashcardsItem, MultiNodeGenerateEnum } from '../../../types/generate.type';
import { Button } from '@/components/ui/button';
import { Layers } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
    nodes: AppNode[];
    nodeIds: string[];
    onSuccess: ((data: IGenerateNodeFlashcardsItem[]) => void) | undefined;
}

export default function MultiNodeGeneratePanel({ nodes, nodeIds, onSuccess }: Props) {
    const { isVisible, getPreparedData, onHandleBeforeGenerate, onFallBack } = useMultiNodeFlashcardsGenerate({
        nodes,
        nodeIds,
    });

    if (!isVisible) {
        return null;
    }

    return (
        <Panel position="bottom-left">
            <div className="flex flex-row gap-2">
                <Generate
                    trigger={
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="secondary"
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md"
                                >
                                    <Layers className="h-4 w-4" />
                                    Flashcards
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Generate flashcards</TooltipContent>
                        </Tooltip>
                    }
                    type={MultiNodeGenerateEnum.MULTI_NODE_FLASHCARD}
                    getPreparedData={getPreparedData}
                    onSuccess={onSuccess}
                    onHandleBeforeGenerate={onHandleBeforeGenerate}
                    onFallBack={onFallBack}
                />
            </div>
        </Panel>
    );
}
